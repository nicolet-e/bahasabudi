/**
 * BahasaBudi AI — Bot Telegram
 * Menggunakan kaedah long-polling (tiada pelayan webhook diperlukan).
 * Memerlukan: node-telegram-bot-api
 *
 * Persediaan:
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
      [{ text: '📖 Tatabahasa' },          { text: '✏️ Ejaan (di / di-)' }],
      [{ text: '📝 Bina Ayat' },            { text: '💬 Kosa Kata' }],
      [{ text: '🌿 Peribahasa' },           { text: '📄 Karangan' }],
      [{ text: '🔧 Imbuhan' },              { text: '🧪 Latihan & Soalan' }],
      [{ text: '❓ Bantuan' }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
  parse_mode: 'HTML',
};

// Peta butang papan kekunci kepada teks yang difahami oleh enjin
const KEYBOARD_MAP = {
  '📖 Tatabahasa':        'Terangkan tatabahasa Bahasa Melayu',
  '✏️ Ejaan (di / di-)':  'Terangkan perbezaan di kata sendi dan di- imbuhan',
  '📝 Bina Ayat':         'Bagaimana cara membina ayat yang betul langkah demi langkah',
  '💬 Kosa Kata':         'Bantu saya dengan kosa kata',
  '🌿 Peribahasa':        'Terangkan peribahasa dan simpulan bahasa',
  '📄 Karangan':          'Bantu saya menulis karangan',
  '🔧 Imbuhan':           'Terangkan imbuhan awalan dan akhiran',
  '🧪 Latihan & Soalan':  'Berikan saya latihan Bahasa Melayu',
  '❓ Bantuan':           'hello',
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

  // Proses melalui enjin
  const result = engine.processMessage(inputText, session);
  setSession(chatId, result.session || result.sesi);

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

  const result = engine.processMessage('selamat', session);
  setSession(chatId, result.session || result.sesi);

  const responseHtml = toTelegramHtml(result.text);

  await bot.sendMessage(chatId, responseHtml, {
    ...MAIN_KEYBOARD,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }).catch(console.error);
});

// ── /help command ───────────────────────────────────────────────────────────
bot.onText(/\/help/, async (msg) => {
  const helpText = `<b>BahasaBudi AI — Arahan Bot</b>\n\n/start — Mulakan semula bot dan lihat mesej selamat datang\n/help — Paparkan mesej bantuan ini\n/reset — Tetapkan semula sesi pembelajaran anda\n\n<b>Topik yang boleh saya bantu:</b>\n• Tatabahasa\n• Ejaan\n• Tanda Baca\n• Kosa Kata\n• Peribahasa &amp; Simpulan Bahasa\n• Pembinaan Ayat\n• Penulisan Karangan\n• Imbuhan\n\nTaip soalan anda atau gunakan papan kekunci di bawah!`;
  await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'HTML', ...MAIN_KEYBOARD }).catch(console.error);
});

// ── /reset command ──────────────────────────────────────────────────────────
bot.onText(/\/reset/, async (msg) => {
  const chatId = msg.chat.id;
  sessions.delete(chatId);
  await bot.sendMessage(chatId, '✅ Sesi anda telah ditetapkan semula. Jom mulakan dari awal!\n\nApakah topik Bahasa Melayu yang ingin anda pelajari hari ini?', MAIN_KEYBOARD).catch(console.error);
});

// ── Error handling ───────────────────────────────────────────────────────────
bot.on('polling_error', (err) => {
  console.error('Polling error:', err.message);
});

bot.on('error', (err) => {
  console.error('Bot error:', err.message);
});

console.log('✅ Bot Telegram BahasaBudi AI sedang berjalan (mod polling)…');
console.log('   Tekan Ctrl+C untuk berhenti.');
