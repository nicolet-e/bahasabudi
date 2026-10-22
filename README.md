# BahasaBudi AI 📚

A rule-based educational chatbot that helps students learn **Bahasa Melayu**.  
No LLM API. No cloud subscription. Runs entirely on your own machine.

---

## Features

| Feature | Details |
|---------|---------|
| **Topics covered** | Grammar, Spelling (di/di-), Punctuation, Vocabulary, Idioms, Sentence Construction, Essay Writing |
| **Intent detection** | Keyword + regex pattern matching |
| **Slot filling** | Asks for topic if missing; asks for help type if not specified |
| **Fallback handling** | Two-strike rule — after 2 consecutive unrecognised inputs, escalates to human teacher |
| **Human escalation** | WhatsApp link shown when needed |
| **Guardrails** | Refuses to complete homework; redirects off-topic queries |
| **No external AI API** | Fully rule-based |
| **Web interface** | Self-contained HTML + CSS + JS |
| **Telegram bot** | Long-polling — no server or webhook needed |

---

## File Structure

```
bahasabudi/
├── engine.js          ← Shared rule-based chatbot engine (browser + Node.js)
├── index.html         ← Web chat interface (open directly in a browser)
├── telegram-bot.js    ← Telegram bot (Node.js, long-polling)
├── package.json       ← Node.js dependencies
└── README.md          ← This file
```

---

## Quick Start

### 1 — Web Interface

No installation needed. Just open `index.html` in any modern browser:

```
Double-click  bahasabudi/index.html
```

Or serve it locally (optional, for testing):

```bash
cd bahasabudi
npx serve . -p 3000
# then open http://localhost:3000
```

---

### 2 — Telegram Bot

#### Step 1 — Create a bot with BotFather

1. Open Telegram and search for **@BotFather**.
2. Send `/newbot` and follow the prompts.
3. Choose a name (e.g. *BahasaBudi AI*) and a username (e.g. `BahasaBudiAI_bot`).
4. BotFather will give you a **token** — copy it.

#### Step 2 — Install dependencies

```bash
cd bahasabudi
npm install
```

#### Step 3 — Run the bot

**Option A — Environment variable (recommended):**
```bash
BOT_TOKEN=1234567890:AAxxxxxxxxxxxxxxxxxxxx node telegram-bot.js
```

**Option B — Edit the file:**  
Open `telegram-bot.js` and replace line 18:
```js
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';
// → replace with your actual token
```
Then:
```bash
node telegram-bot.js
```

#### Step 4 — Chat!

Find your bot in Telegram by its username and send `/start`.

---

## How the Engine Works

```
User input
    │
    ▼
Intent matching  ──► greeting / thanks / goodbye / homework / off_topic
    │
    ▼
Topic detection  ──► grammar / spelling / punctuation / vocabulary /
    │                idioms / sentence / essay / preposition / prefix
    ▼
Help-type detection ──► explanation / examples / practice / correction
    │
    ▼
Slot filling ──► ask_topic (if no topic) → ask_help_type (if no help type)
    │
    ▼
Knowledge base ──► returns structured Markdown response
    │
    ▼
Fallback tracker ──► 2 consecutive misses → escalate to human teacher
```

---

## Customisation

### Adding a new topic

1. Add keywords to `TOPICS` in `engine.js`.
2. Add a display name to `TOPIC_NAMES`.
3. Add a response function to `RESPONSES`.
4. Add the topic chip to `QUICK_REPLIES` in `index.html`.
5. Add the keyboard button to `MAIN_KEYBOARD` in `telegram-bot.js`.

### Changing the human escalation contact

Search for `HUMAN_LINK` in `engine.js` and update the URL.

---

## Telegram Bot Commands

| Command | Effect |
|---------|--------|
| `/start` | Greet and show the topic keyboard |
| `/help`  | Show list of topics and commands |
| `/reset` | Clear the current session |

---

## Requirements

- Web interface: any modern browser (Chrome, Firefox, Edge, Safari)
- Telegram bot: Node.js 16+ and an internet connection
