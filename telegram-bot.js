/**
 * BahasaBudi AI — Telegram Bot
 * Uses long-polling (no webhook server required).
 * Requires: node-telegram-bot-api
 *
 * Setup:
 *   npm install node-telegram-bot-api
 *   node telegram-bot.js
 */

'use strict';

const TelegramBot = require('node-telegram-bot-api');
const engine      = require('./engine');

// ── Configuration ──────────────────────────────────────────────────────────
// Set your bot token here, or use an environment variable (recommended):
//   BOT_TOKEN=your_token node telegram-bot.js
const BOT_TOKEN = process.env.BOT_TOKEN || '8972523357:AAF36PoBA7UUamCsdlD3O4IRxf5LQ88vAB0';

// ── Bot instance (polling mode — no server needed) ─────────────────────────
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ── Per-user session store (in-memory) ─────────────────────────────────────
const sessions = new Map();

function getSession(chatId) {
  if (!sessions.has(chatId)) {
    sessions.set(chatId, engine.createSession());
  }
  return sessions.get(chatId);
}

function setSession(chatId, session) {
  sessions.set(chatId, session);
}

// ── Markdown escaping for Telegram MarkdownV2 ──────────────────────────────
// Telegram MarkdownV2 requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
function escapeMarkdownV2(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

// ── Convert bot engine output to Telegram-friendly HTML ────────────────────
// We use Telegram HTML mode which supports <b>, <i>, <code>, <a>, <pre>
function toTelegramHtml(text) {
  let out = text;

  // Escape HTML entities first (preserve structure)
  out = out
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings → bold line
  out = out.replace(/^## (.+)$/gm, '\n<b>$1</b>');
  out = out.replace(/^### (.+)$/gm, '<b>$1</b>');

  // Bold / italic
  out = out.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  out = out.replace(/\*(.+?)\*/g, '<i>$1</i>');
  out = out.replace(/_(.+?)_/g, '<i>$1</i>');

  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Blockquote (Telegram doesn't have blockquotes, use italic)
  out = out.replace(/^&gt; (.+)$/gm, '<i>$1</i>');

  // Horizontal rule
  out = out.replace(/^---$/gm, '───────────────────');

  // Links  [text](url)
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2">$1</a>');

  // Tables → plain text representation (Telegram doesn't render tables)
  out = out.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gm, (_, header, rows) => {
    const headers = header.split('|').map(c => c.trim()).filter(Boolean);
    const rowLines = rows.trim().split('\n').map(row => {
      const cells = row.split('|').map(c => c.trim()).filter(Boolean);
      return cells.map((c, i) => `${headers[i] || ''}: ${c}`).join(' | ');
    });
    return headers.join(' | ') + '\n' + rowLines.join('\n');
  });

  // Bullet lists
  out = out.replace(/^[•\-\*] (.+)$/gm, '• $1');

  // Numbered lists — leave as-is
  out = out.replace(/^(\d+)\. (.+)$/gm, '$1. $2');

  return out.trim();
}

// ── Quick-reply keyboard ────────────────────────────────────────────────────
const MAIN_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [{ text: '📖 Grammar' },        { text: '✏️ Spelling (di/di-)' }],
      [{ text: '📝 Sentence Construction' }, { text: '💬 Vocabulary' }],
      [{ text: '🌿 Idioms (Peribahasa)' },   { text: '📄 Essay Writing' }],
      [{ text: '🧪 Practice Questions' },    { text: '❓ Help' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
  parse_mode: 'HTML',
};

// Map keyboard button labels to message text the engine understands
const KEYBOARD_MAP = {
  '📖 Grammar':                  'Explain Bahasa Melayu grammar',
  '✏️ Spelling (di/di-)':        'Explain the difference between di as a preposition and di- as a prefix',
  '📝 Sentence Construction':    'How to construct a Malay sentence step by step',
  '💬 Vocabulary':                'Help me with vocabulary',
  '🌿 Idioms (Peribahasa)':      'Explain peribahasa and simpulan bahasa',
  '📄 Essay Writing':            'Help me with karangan essay writing',
  '🧪 Practice Questions':       'Give me practice questions on Bahasa Melayu grammar and spelling',
  '❓ Help':                     'hello',
};

// ── Message handler ─────────────────────────────────────────────────────────
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const rawText = msg.text || '';

  // Map keyboard shortcut to engine-friendly text
  const inputText = KEYBOARD_MAP[rawText] || rawText;

  // Retrieve or create session
  const session = getSession(chatId);

  // Send "typing…" action
  await bot.sendChatAction(chatId, 'typing').catch(() => {});

  // Process through engine
  const result = engine.processMessage(inputText, session);
  setSession(chatId, result.session);

  const responseHtml = toTelegramHtml(result.text);

  try {
    await bot.sendMessage(chatId, responseHtml, {
      ...MAIN_KEYBOARD,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } catch (err) {
    // Fallback: send as plain text if HTML parsing fails
    console.error('Send error:', err.message);
    await bot.sendMessage(chatId, result.text, MAIN_KEYBOARD).catch(console.error);
  }
});

// ── /start command ──────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  // Reset session on /start
  sessions.delete(chatId);
  const session = getSession(chatId);

  await bot.sendChatAction(chatId, 'typing').catch(() => {});

  const result = engine.processMessage('hello', session);
  setSession(chatId, result.session);

  const responseHtml = toTelegramHtml(result.text);

  await bot.sendMessage(chatId, responseHtml, {
    ...MAIN_KEYBOARD,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }).catch(console.error);
});

// ── /help command ───────────────────────────────────────────────────────────
bot.onText(/\/help/, async (msg) => {
  const helpText = `<b>BahasaBudi AI — Commands</b>\n\n/start — Restart the bot and see the welcome message\n/help — Show this help message\n/reset — Reset your learning session\n\n<b>Topics I can help with:</b>\n• Grammar (Tatabahasa)\n• Spelling (Ejaan)\n• Punctuation (Tanda Baca)\n• Vocabulary (Kosa Kata)\n• Idioms (Peribahasa &amp; Simpulan Bahasa)\n• Sentence Construction (Bina Ayat)\n• Essay Writing (Karangan)\n\nJust type your question or use the keyboard below!`;
  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'HTML', ...MAIN_KEYBOARD }).catch(console.error);
});

// ── /reset command ──────────────────────────────────────────────────────────
bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  sessions.delete(chatId);
  await bot.sendMessage(chatId, '✅ Your session has been reset. Let\'s start fresh!\n\nWhat Bahasa Melayu topic would you like to learn today?', MAIN_KEYBOARD).catch(console.error);
});

// ── Error handling ───────────────────────────────────────────────────────────
bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

bot.on('error', (err) => {
  console.error('Bot error:', err.message);
});

console.log('✅ BahasaBudi AI Telegram bot is running (polling mode)…');
console.log('   Press Ctrl+C to stop.');
