/**
 * BahasaBudi AI — Rule-Based Chatbot Engine
 * Works in both browser (global export) and Node.js (module.exports).
 * No external dependencies. No LLM API.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.BahasaBudiEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // ─── KNOWLEDGE BASE ───────────────────────────────────────────────────────

  const HUMAN_LINK = 'https://wa.me/qr/2ONVEILR5OXYN1';

  const TOPICS = {
    grammar:      ['grammar', 'tatabahasa', 'ayat', 'sentence', 'kata', 'word', 'noun', 'verb', 'adjective', 'kata nama', 'kata kerja', 'kata sifat', 'imbuhan', 'affix', 'prefix', 'suffix', 'awalan', 'akhiran'],
    spelling:     ['spelling', 'ejaan', 'spell', 'salah eja', 'betulkan ejaan', 'correct spelling'],
    punctuation:  ['punctuation', 'tanda baca', 'comma', 'koma', 'full stop', 'noktah', 'colon', 'kolan', 'semicolon', 'tanda soal', 'question mark', 'exclamation'],
    vocabulary:   ['vocabulary', 'kosa kata', 'perkataan', 'meaning', 'maksud', 'erti', 'definition', 'definisi', 'word meaning', 'makna'],
    idioms:       ['idiom', 'peribahasa', 'simpulan bahasa', 'proverb', 'expression', 'ungkapan'],
    sentence:     ['sentence construction', 'bina ayat', 'construct', 'membina', 'structure', 'struktur ayat', 'how to write a sentence', 'cara tulis ayat', 'subject', 'predicate', 'subjek', 'predikat'],
    essay:        ['essay', 'karangan', 'writing', 'penulisan', 'write', 'tulis', 'komposisi', 'composition', 'format karangan', 'essay format'],
    preposition:  ['preposition', 'kata sendi', 'di ', ' ke ', ' dari ', ' daripada ', 'untuk', 'dengan', 'pada', 'tentang'],
    prefix:       ['prefix', 'awalan', 'di-', 'me-', 'ber-', 'ter-', 'ke-', 'se-', 'pen-', 'per-'],
  };

  // Maps canonical topic keys to display names
  const TOPIC_NAMES = {
    grammar:     'Grammar (Tatabahasa)',
    spelling:    'Spelling (Ejaan)',
    punctuation: 'Punctuation (Tanda Baca)',
    vocabulary:  'Vocabulary (Kosa Kata)',
    idioms:      'Idioms (Peribahasa & Simpulan Bahasa)',
    sentence:    'Sentence Construction (Bina Ayat)',
    essay:       'Essay Writing (Karangan)',
    preposition: 'Prepositions (Kata Sendi Nama)',
    prefix:      'Prefixes & Affixes (Imbuhan)',
  };

  // ─── INTENT PATTERNS ──────────────────────────────────────────────────────

  const INTENTS = [
    {
      name: 'greeting',
      patterns: [/\b(hello|hi|hey|helo|hai|selamat|salam|good morning|good afternoon|good evening|apa khabar|assalamualaikum)\b/i],
    },
    {
      name: 'thanks',
      patterns: [/\b(thank|thanks|terima kasih|tq|tysm|syukran)\b/i],
    },
    {
      name: 'goodbye',
      patterns: [/\b(bye|goodbye|selamat tinggal|selamat jalan|dadah|see you)\b/i],
    },
    {
      name: 'di_prefix_question',
      patterns: [/\bdi[-\s]?(prefix|imbuhan|awalan)\b/i, /difference.*\bdi\b.*prefix/i, /\bdi\b.*preposition.*\bdi[-]/i, /\bdi-\b.*\bdi\b/i, /\b(di sebagai|di kata sendi|di imbuhan|di awalan|di kata kerja)\b/i, /explain.*\bdi\b/i],
    },
    {
      name: 'sentence_construction',
      patterns: [/\b(bina ayat|construct.*sentence|sentence.*construct|how.*write.*sentence|cara.*tulis.*ayat|struktur ayat|sentence structure|subjek.*predikat|subject.*predicate)\b/i],
    },
    {
      name: 'practice_request',
      patterns: [/\b(practice|practise|latihan|exercise|soalan|questions?|quiz|test|cuba|try)\b/i],
    },
    {
      name: 'correction_request',
      patterns: [/\b(correct|betulkan|semak|check|salah|wrong|fix|perbetulkan|tegur)\b/i],
    },
    {
      name: 'explanation_request',
      patterns: [/\b(explain|terangkan|huraikan|describe|what is|apa itu|apa dia|maksud|how does|bagaimana|kenapa|why)\b/i],
    },
    {
      name: 'example_request',
      patterns: [/\b(example|contoh|tunjukkan|show me|berikan|give me)\b/i],
    },
    {
      name: 'homework',
      patterns: [/\b(homework|kerja rumah|assignment|tugasan|exam|peperiksaan|test|ujian|karangan.*untuk.*sekolah|do my|buat.*untuk saya|write.*for me|jawab.*untuk saya)\b/i],
    },
    {
      name: 'off_topic',
      patterns: [/\b(weather|cuaca|politics|politik|sport|sukan|game|permainan|movie|filem|music|muzik|food|makanan|football|bola|tiktok|instagram|youtube)\b/i],
    },
  ];

  // ─── RESPONSE TEMPLATES ───────────────────────────────────────────────────

  const RESPONSES = {

    greeting: () =>
      `Hello! 👋 I am **BahasaBudi AI**, your Bahasa Melayu learning assistant.\n\nI can help you with:\n• Grammar (Tatabahasa)\n• Spelling (Ejaan)\n• Punctuation (Tanda Baca)\n• Vocabulary (Kosa Kata)\n• Idioms (Peribahasa & Simpulan Bahasa)\n• Sentence Construction (Bina Ayat)\n• Essay Writing (Karangan)\n\nWhat topic would you like to learn today? 😊`,

    thanks: () =>
      `You're welcome! 😊 Keep up the great work in your Bahasa Melayu learning. Is there anything else you'd like to practise?`,

    goodbye: () =>
      `Goodbye! 👋 Selamat belajar! Keep practising your Bahasa Melayu and you will improve every day. Take care!`,

    ask_topic: () =>
      `Sure! What Bahasa Melayu topic do you need help with? You can choose:\n• Grammar (Tatabahasa)\n• Spelling (Ejaan)\n• Punctuation (Tanda Baca)\n• Sentence Construction (Bina Ayat)\n• Vocabulary (Kosa Kata)\n• Idioms (Peribahasa)\n• Essay Writing (Karangan)`,

    ask_help_type: (topic) =>
      `What would you like help with in **${TOPIC_NAMES[topic] || topic}**? I can provide:\n• An explanation\n• Examples\n• Corrections\n• Practice questions`,

    homework: () =>
      `I'm here to **guide** you, not to complete your work for you. 😊\n\nIf I simply give you the answers, you won't truly learn — and that's what matters most!\n\nTell me which **topic** or **concept** you are struggling with, and I will:\n• Explain the rules clearly\n• Give you examples\n• Help you practise step by step\n\nThat way, you'll be able to write the answer yourself with confidence. Which topic shall we start with?`,

    off_topic: () =>
      `I appreciate your curiosity, but my main purpose is to help you learn **Bahasa Melayu**. 😊\n\nFor personal or unrelated matters, please speak to a trusted adult or teacher.\n\nIs there a Bahasa Melayu topic I can help you with today?`,

    escalate: () =>
      `It seems I'm having difficulty understanding your question. You may want to reach out to your Bahasa Melayu teacher directly for further help:\n\n👩‍🏫 **Contact Teacher:** [Click here to message via WhatsApp](${HUMAN_LINK})\n\nYou can also try asking your question in a different way, and I'll do my best to help! 😊`,

    fallback: () =>
      `Sorry, I don't quite understand your question. Could you tell me which Bahasa Melayu topic you need help with, or try asking in a different way?\n\n*(Tip: You can ask about grammar, spelling, punctuation, vocabulary, idioms, sentence construction, or essay writing.)*`,

    // ── TOPIC CONTENT ────────────────────────────────────────────────────────

    grammar: (helpType) => {
      const explanation = `## Grammar (Tatabahasa)\n\nBahasa Melayu grammar covers the rules that govern how words are formed and how sentences are structured.\n\n**Key areas include:**\n\n**1. Parts of Speech (Golongan Kata)**\n| Type | Bahasa Melayu | Example |\n|------|---------------|---------|\n| Noun | Kata Nama | buku, murid, sekolah |\n| Verb | Kata Kerja | membaca, berlari, menulis |\n| Adjective | Kata Sifat | cantik, besar, rajin |\n| Pronoun | Kata Ganti Nama | saya, dia, mereka |\n| Preposition | Kata Sendi Nama | di, ke, dari, daripada |\n\n**2. Affixes (Imbuhan)**\n- **Prefixes (Awalan):** me-, ber-, ter-, di-, ke-, se-\n- **Suffixes (Akhiran):** -kan, -i, -an\n- **Confix (Apitan):** me-...-kan, ber-...-an, ke-...-an\n\n**Example:**\n- tulis → **me**tulis (to write)\n- main → ber**main** (to play)\n- tulis + -an → tulisan (writing)`;

      const examples = `## Grammar Examples (Contoh Tatabahasa)\n\n**Affixes in action:**\n\n| Root Word | + Prefix | Meaning |\n|-----------|----------|---------|\n| baca | membaca | to read |\n| lari | berlari | to run |\n| dapat | terdapat | is found / available |\n| tulis | ditulis | is written |\n\n**Tip:** The prefix *me-* changes form depending on the first letter of the root word:\n- me + p → mem (e.g., pukul → **mem**ukul)\n- me + t → men (e.g., tulis → **men**ulis)\n- me + k → meng (e.g., kira → **meng**ira)\n- me + s → meny (e.g., sapu → **meny**apu)`;

      const practice = `## Grammar Practice (Latihan Tatabahasa)\n\nTry these exercises:\n\n**Exercise 1 — Add the correct prefix (me-, ber-, ter-, di-):**\n1. ___ baca (membaca / dibaca)\n2. ___ lari\n3. ___ tulis\n4. ___ nyanyi\n\n**Exercise 2 — Identify the word type:**\nIs each word a Kata Nama, Kata Kerja, or Kata Sifat?\n1. berlari\n2. buku\n3. pandai\n4. menulis\n5. sekolah\n\n*(Try answering first — then I can check your answers!)*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    spelling: (helpType) => {
      const explanation = `## Spelling (Ejaan)\n\nCorrect spelling is essential in Bahasa Melayu. Here are common spelling rules:\n\n**1. Use "e" or "a"?**\n- Bahasa Melayu uses both the schwa *e* (pepet) and the clear *e* (taling).\n- Schwa *e*: sounds like the "e" in "the" → e.g., *emak*, *enam*\n- Clear *e*: sounds like the "e" in "bed" → e.g., *sekolah*, *beli*\n\n**2. Common Spelling Errors to Avoid:**\n| ❌ Wrong | ✅ Correct | Notes |\n|---------|-----------|-------|\n| Bahasa Melayu | Bahasa Melayu | always capitalised |\n| di sekolah | di sekolah | "di" + place = separated |\n| disekolah | di sekolah | ❌ do not combine |\n| ditanya | ditanya | "di-" + verb = joined |\n| di tanya | ditanya | ❌ do not separate |\n| silap eja | silap eja | correct phrase |\n\n**3. Rule: di (preposition) vs di- (prefix)**\n- *di* + **location** → written **separately**: *di sekolah, di rumah*\n- *di-* + **verb** → written **together**: *ditanya, ditulis, dibaca*`;

      const examples = `## Spelling Examples (Contoh Ejaan)\n\n**Correct vs Incorrect:**\n\n| ❌ Incorrect | ✅ Correct |\n|------------|----------|\n| saya tinggal disekolah | saya tinggal **di sekolah** |\n| buku itu dibeli oleh dia | buku itu **dibeli** oleh dia ✅ |\n| mereka bermain dipadang | mereka bermain **di padang** |\n| surat itu dipos | surat itu **dipos** ✅ |\n\n**Remember:** Ask yourself — is the word after "di" a **place** or a **verb**?`;

      const practice = `## Spelling Practice (Latihan Ejaan)\n\n**Exercise — Write "di" separately or together (di- prefix)?**\n\n1. Dia tinggal ___ kampung.\n2. Buku itu ___ baca oleh semua murid.\n3. Mereka bermain ___ padang sekolah.\n4. Surat itu sudah ___ hantar semalam.\n5. Adik saya belajar ___ universiti.\n\n*(Think carefully: is the word after "di" a PLACE or an ACTION WORD?)*\n\n*Submit your answers and I'll give you feedback!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    punctuation: (helpType) => {
      const explanation = `## Punctuation (Tanda Baca)\n\nPunctuation marks help organise writing and show meaning clearly.\n\n**Common Punctuation Marks in Bahasa Melayu:**\n\n| Symbol | Name | Malay Name | Use |\n|--------|------|------------|-----|\n| . | Full stop | Noktah | End of a statement |\n| , | Comma | Koma | Separating items or clauses |\n| ? | Question mark | Tanda soal | End of a question |\n| ! | Exclamation mark | Tanda seru | Emphasis or exclamation |\n| : | Colon | Titik bertindih | Before a list or explanation |\n| ; | Semicolon | Koma bertitik | Between related clauses |\n| \" \" | Quotation marks | Tanda petikan | Direct speech |\n\n**Capital Letters (Huruf Besar):**\n- Begin every sentence with a capital letter.\n- Capitalise proper nouns: names of people, places, languages (e.g., *Ahmad, Kuala Lumpur, Bahasa Melayu*).\n- Do NOT capitalise common nouns mid-sentence (e.g., *murid, sekolah, buku*).`;

      const examples = `## Punctuation Examples (Contoh Tanda Baca)\n\n**Correct Punctuation:**\n\n1. Ahmad pergi ke sekolah setiap hari**.**\n2. Apakah nama kamu**?**\n3. Aduh, sakitnya**!**\n4. Saya suka makan nasi lemak**,** mee goreng**,** dan roti canai**.**\n5. Guru berkata**:** "Semua murid hendaklah bawa buku teks esok**.**"\n\n**Common Mistakes:**\n| ❌ Incorrect | ✅ Correct |\n|------------|----------|\n| saya suka belajar | Saya suka belajar. |\n| dia pergi ke sekolah? | Dia pergi ke sekolah. |\n| aduh sakitnya | Aduh, sakitnya! |`;

      const practice = `## Punctuation Practice (Latihan Tanda Baca)\n\n**Add the correct punctuation marks:**\n\n1. saya pergi ke kedai buku semalam\n2. apakah pelajaran kegemaran kamu\n3. syabas kamu telah berjaya\n4. ibu membeli sayur ikan ayam dan telur di pasar\n5. cikgu berkata semua murid hendaklah hantar kerja rumah esok\n\n*Try adding full stops, question marks, exclamation marks, commas, and capital letters where needed!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    vocabulary: (helpType) => {
      const explanation = `## Vocabulary (Kosa Kata)\n\nBuilding a strong vocabulary helps you express yourself clearly in Bahasa Melayu.\n\n**Strategies to Learn Vocabulary:**\n1. **Read** Bahasa Melayu texts, news, and books regularly.\n2. **Keep a vocabulary notebook** — write new words and their meanings.\n3. **Use new words in sentences** to help you remember them.\n4. **Learn word families** — root word + affixes:\n   - *tulis* → menulis, tulisan, penulis, ditulis\n\n**Useful Vocabulary Categories:**\n- **Synonyms (Sinonim):** words with similar meanings\n  - *cantik = indah = molek*\n  - *besar = agung = gah*\n- **Antonyms (Antonim):** words with opposite meanings\n  - *besar ↔ kecil*\n  - *panas ↔ sejuk*\n- **Formal vs Informal words:**\n  - *makan (informal) → menjamah / menikmati (formal)*\n  - *pergi (neutral) → berangkat (formal)*`;

      const examples = `## Vocabulary Examples (Contoh Kosa Kata)\n\n**Synonyms (Sinonim):**\n| Word | Synonyms |\n|------|----------|\n| cantik | indah, molek, jelita |\n| besar | agung, gah, raksasa |\n| cepat | segera, pantas, laju |\n| sedih | dukacita, pilu, sendu |\n\n**Word Family (Keluarga Kata):**\n| Root (Akar Kata) | Verb | Noun | Adjective |\n|-----------------|------|------|-----------|\n| tulis | menulis | tulisan / penulis | bertulis |\n| baca | membaca | bacaan / pembaca | terbaca |\n| ajar | mengajar | ajaran / pengajar | terpelajar |`;

      const practice = `## Vocabulary Practice (Latihan Kosa Kata)\n\n**Exercise 1 — Match the synonym:**\nMatch each word with its synonym:\n1. cantik → (a) pantas  (b) indah  (c) besar\n2. cepat → (a) laju  (b) panas  (c) kecil\n3. besar → (a) agung  (b) molek  (c) sayu\n\n**Exercise 2 — Form a word family:**\nFill in the table for the root word *jual*:\n| Root | Verb | Noun (thing sold) | Noun (person who sells) |\n|------|------|-------------------|-------------------------|\n| jual | ? | ? | ? |\n\n*Try it first, then ask me to check your answers!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    idioms: (helpType) => {
      const explanation = `## Idioms (Peribahasa & Simpulan Bahasa)\n\nIdioms are expressions whose meanings cannot be understood from the individual words alone.\n\n**Types:**\n\n**1. Peribahasa (Proverbs)**\nFull proverbs with a complete moral or lesson:\n- *Seperti aur dengan tebing* — Close friendship; supporting each other\n- *Bagai mencurah air ke daun keladi* — Wasted effort; nothing sticks\n- *Alang-alang menyeluk pekasam, biar sampai ke pangkal lengan* — If you're going to do something, do it properly\n\n**2. Simpulan Bahasa (Fixed Idioms)**\nShort two- or three-word expressions with a specific figurative meaning:\n- *Buah tangan* — A gift brought when visiting\n- *Besar kepala* — Arrogant / big-headed\n- *Naik angin* — Angry / to lose one's temper\n- *Ringan tulang* — Hardworking / willing to help`;

      const examples = `## Idiom Examples (Contoh Peribahasa & Simpulan Bahasa)\n\n**Simpulan Bahasa in Sentences:**\n\n| Idiom | Meaning | Example Sentence |\n|-------|---------|------------------|\n| buah tangan | a gift | Ali membawa **buah tangan** untuk neneknya. |\n| besar kepala | arrogant | Jangan **besar kepala** apabila berjaya. |\n| naik angin | angry | Ayah **naik angin** kerana kereta itu rosak. |\n| ringan tulang | hardworking | Kakak saya **ringan tulang** membantu ibu. |\n| kaki bangku | clumsy | Dia **kaki bangku** di padang. |\n\n**Peribahasa in Sentences:**\n- *Seperti aur dengan tebing* — Ahmad dan Ali **seperti aur dengan tebing**, saling bantu membantu.`;

      const practice = `## Idioms Practice (Latihan Peribahasa)\n\n**Exercise 1 — Match the idiom with its meaning:**\n1. buah tangan → (a) arrogant  (b) a gift  (c) clumsy\n2. naik angin → (a) happy  (b) angry  (c) hardworking\n3. ringan tulang → (a) lazy  (b) willing to help  (c) talkative\n\n**Exercise 2 — Fill in the blank with the correct idiom:**\n*(buah tangan / naik angin / ringan tulang / besar kepala)*\n1. Jangan ___ walaupun kamu mendapat tempat pertama.\n2. Dia suka membantu semua orang. Dia memang ___.\n3. Emak saya ___ kerana saya lupa buat kerja rumah.\n\n*Try it and then share your answers with me!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    sentence: (helpType) => {
      const explanation = `## Sentence Construction (Bina Ayat)\n\nA grammatically correct Bahasa Melayu sentence follows a clear structure.\n\n**Basic Sentence Structure:**\n\n> **Subjek (Subject) + Predikat (Predicate)**\n\nThe **subject** is who or what the sentence is about.\nThe **predicate** tells us what the subject does or is.\n\n**Types of Predicates:**\n\n| Predicate Type | Malay Term | Example |\n|----------------|------------|----------|\n| Verb phrase | Frasa Kerja | *Ahmad **berlari** di padang.* |\n| Noun phrase | Frasa Nama | *Dia **seorang doktor**.* |\n| Adjective phrase | Frasa Adjektif | *Bunga itu **sangat cantik**.* |\n| Prepositional phrase | Frasa Sendi Nama | *Buku itu **di atas meja**.* |\n\n**Step-by-Step: Building a Sentence**\n1. Choose your **subject** (who/what): *Murid itu*\n2. Choose your **predicate** (verb/description): *membaca buku*\n3. Add **details** (where/when/how): *di perpustakaan setiap hari*\n4. Full sentence: *Murid itu membaca buku di perpustakaan setiap hari.*`;

      const examples = `## Sentence Construction Examples (Contoh Bina Ayat)\n\n**Simple sentences:**\n| Subject | Predicate | Full Sentence |\n|---------|-----------|---------------|\n| Ahmad | berlari | Ahmad berlari. |\n| Ibu | memasak nasi | Ibu memasak nasi. |\n| Kucing itu | sangat comel | Kucing itu sangat comel. |\n\n**Expanded sentences:**\n- *Ahmad berlari **dengan pantas** di padang sekolah **setiap pagi**.*\n- *Ibu memasak nasi **lemak** di dapur **pada waktu pagi**.*\n\n**Compound sentence (Ayat Majmuk):**\n- *Ahmad belajar dengan rajin **dan** dia berjaya dalam peperiksaan.*\n- *Saya suka membaca **tetapi** adik saya lebih suka bermain.*`;

      const practice = `## Sentence Construction Practice (Latihan Bina Ayat)\n\n**Exercise 1 — Identify subject and predicate:**\n1. *Murid-murid itu bermain di padang.*\n   - Subject: ?\n   - Predicate: ?\n2. *Buku itu sangat tebal.*\n   - Subject: ?\n   - Predicate: ?\n\n**Exercise 2 — Build sentences using these words:**\n*(Arrange and add words to form a correct sentence)*\n1. buku / membaca / murid / di / perpustakaan\n2. cantik / bunga / di / taman / itu\n3. Ahmad / setiap / berlari / pagi / padang / di\n\n**Exercise 3 — Expand the sentence:**\nAdd details (where, when, how) to make it more interesting:\n1. *Ibu memasak.* → ?\n2. *Adik bermain.* → ?\n\n*Write your answers and I'll help you check!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    essay: (helpType) => {
      const explanation = `## Essay Writing (Karangan)\n\nA good Bahasa Melayu essay is well-structured, uses correct language, and covers the topic fully.\n\n**Types of Essays (Jenis Karangan):**\n1. **Narrative (Cerita/Naratif)** — telling a story\n2. **Descriptive (Deskriptif)** — describing a person, place, or event\n3. **Expository (Penerangan)** — explaining a topic\n4. **Argumentative/Pendapat** — giving opinions with reasons\n\n**Standard Essay Format:**\n\n**Pendahuluan (Introduction)**\n- Introduce the topic in 2–3 sentences.\n- Use a general statement to hook the reader.\n\n**Isi (Body Paragraphs)**\n- Each paragraph = 1 main idea (isi)\n- Structure: **Isi → Huraian → Contoh** (Point → Explanation → Example)\n- Use connectors: *pertama sekali, seterusnya, selain itu, tambahan pula, akhir sekali*\n\n**Penutup (Conclusion)**\n- Summarise the main points.\n- End with a meaningful closing statement or call to action.`;

      const examples = `## Essay Writing Examples (Contoh Karangan)\n\n**Sample paragraph (one body paragraph):**\n\n> **Isi:** Membaca dapat meluaskan pengetahuan seseorang.\n> **Huraian:** Dengan membaca, kita dapat mempelajari pelbagai perkara baharu yang tidak kita ketahui sebelum ini.\n> **Contoh:** Contohnya, dengan membaca buku sains, murid dapat memahami fenomena alam dengan lebih mendalam.\n\n**Useful Essay Connectors:**\n\n| Function | Connector Words |\n|----------|-----------------|\n| First point | Pertama sekali, Pertama |\n| Adding points | Selain itu, Tambahan pula, Di samping itu |\n| Next point | Seterusnya, Kemudian |\n| Last point | Akhir sekali, Kesimpulannya |\n| Giving example | Sebagai contoh, Contohnya, Misalnya |\n| Conclusion | Kesimpulannya, Oleh itu, Oleh yang demikian |`;

      const practice = `## Essay Writing Practice (Latihan Karangan)\n\n**Exercise 1 — Plan your essay:**\nFor the title *"Kepentingan Membaca"* (The Importance of Reading), plan:\n- Pendahuluan (Introduction): What is your opening statement?\n- Isi 1: First point (e.g., meluaskan pengetahuan)\n- Isi 2: Second point\n- Isi 3: Third point\n- Penutup: Your closing thought\n\n**Exercise 2 — Write one body paragraph:**\nUsing the structure **Isi → Huraian → Contoh**, write one paragraph for the title *"Faedah Bersenam"* (Benefits of Exercise).\n\n**Exercise 3 — Improve this introduction:**\n*"Membaca itu baik. Kita semua perlu membaca. Membaca sangat bagus."*\n→ How would you make this introduction stronger and more interesting?\n\n*Share your attempt and I can give you feedback!*`;

      if (!helpType || helpType === 'explanation') return explanation;
      if (helpType === 'examples') return examples;
      if (helpType === 'practice') return practice;
      return explanation + '\n\n---\n\n' + examples;
    },

    di_prefix: () =>
      `## "di" as Preposition vs "di-" as Prefix\n\nThis is one of the most common spelling questions in Bahasa Melayu! Here's a clear guide:\n\n---\n\n**1. "di" as a Preposition (Kata Sendi Nama)**\n- Used before a **place or location**\n- Written **separately** from the following word\n- Shows WHERE something is or happens\n\n| Example | Explanation |\n|---------|-------------|\n| *di sekolah* | at school (place) |\n| *di rumah* | at home (place) |\n| *di padang* | at the field (place) |\n| *di Kuala Lumpur* | in Kuala Lumpur (place) |\n\n---\n\n**2. "di-" as a Prefix (Awalan)**\n- Used before an **action word (verb)**\n- Written **together** with the verb (no space)\n- Shows that something is done TO the subject (passive voice)\n\n| Example | Explanation |\n|---------|-------------|\n| *dibaca* | is read (verb: baca) |\n| *ditulis* | is written (verb: tulis) |\n| *ditanya* | is asked (verb: tanya) |\n| *dihantar* | is sent (verb: hantar) |\n\n---\n\n**Quick Test:**\nAsk yourself — is the word after "di" a **PLACE** or a **VERB**?\n- PLACE → write **di** separately: *di sekolah*\n- VERB → write **di-** together: *ditulis*\n\n---\n\n**Practice:**\n1. Surat itu ___ hantar semalam. *(dihantar or di hantar?)*\n2. Mereka bermain ___ padang. *(dipadang or di padang?)*\n3. Buku ini ___ beli oleh ibu. *(dibeli or di beli?)*`,

  };

  // ─── ENGINE STATE ─────────────────────────────────────────────────────────

  function createSession() {
    return {
      fallbackCount: 0,
      pendingTopic: null,
      pendingHelpType: null,
    };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  function detectTopic(text) {
    const lower = text.toLowerCase();
    // Priority: specific before generic
    if (/\bdi[-\s]prefix\b|\bdi[-\s]imbuhan\b|\bdi sebagai\b|\bdi kata sendi\b|\bpreposition.*\bdi\b|\bdi\b.*\bpreposition\b|\bdi-\b|\bdi\b.*\bprefix\b/i.test(text)) return 'preposition';
    for (const [topic, keywords] of Object.entries(TOPICS)) {
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) return topic;
      }
    }
    return null;
  }

  function detectHelpType(text) {
    if (/\b(practice|practise|latihan|exercise|soalan|questions?|quiz|cuba)\b/i.test(text)) return 'practice';
    if (/\b(contoh|example|tunjuk|show)\b/i.test(text)) return 'examples';
    if (/\b(correct|betulkan|semak|check|fix|perbetulkan)\b/i.test(text)) return 'correction';
    if (/\b(explain|terangkan|huraikan|what is|apa itu|how|kenapa|bagaimana)\b/i.test(text)) return 'explanation';
    return null;
  }

  function matchIntent(text) {
    for (const intent of INTENTS) {
      for (const pattern of intent.patterns) {
        if (pattern.test(text)) return intent.name;
      }
    }
    return null;
  }

  function getTopicResponse(topic, helpType) {
    // Map alias topics
    if (topic === 'preposition' || topic === 'prefix') {
      return RESPONSES.di_prefix();
    }
    if (typeof RESPONSES[topic] === 'function') {
      return RESPONSES[topic](helpType);
    }
    return null;
  }

  // ─── MAIN PROCESS FUNCTION ────────────────────────────────────────────────

  function processMessage(text, session) {
    if (!text || !text.trim()) {
      return { text: RESPONSES.fallback(), session };
    }

    const trimmed = text.trim();
    const intent = matchIntent(trimmed);
    const topic = detectTopic(trimmed);
    const helpType = detectHelpType(trimmed);

    // ── Hard-route intents ──
    if (intent === 'greeting') {
      session.fallbackCount = 0;
      return { text: RESPONSES.greeting(), session };
    }
    if (intent === 'thanks') {
      session.fallbackCount = 0;
      return { text: RESPONSES.thanks(), session };
    }
    if (intent === 'goodbye') {
      session.fallbackCount = 0;
      return { text: RESPONSES.goodbye(), session };
    }
    if (intent === 'homework') {
      session.fallbackCount = 0;
      return { text: RESPONSES.homework(), session };
    }
    if (intent === 'off_topic') {
      session.fallbackCount = 0;
      return { text: RESPONSES.off_topic(), session };
    }

    // ── Pending slot filling: we asked for topic, now user replies ──
    if (session.pendingTopic === 'ask_topic') {
      if (topic) {
        session.pendingTopic = topic;
        session.fallbackCount = 0;
        if (!helpType) {
          return { text: RESPONSES.ask_help_type(topic), session: { ...session, pendingTopic: topic, pendingHelpType: 'ask' } };
        }
        const response = getTopicResponse(topic, helpType);
        if (response) {
          session.pendingTopic = null;
          session.pendingHelpType = null;
          return { text: response, session };
        }
      }
    }

    // ── Pending slot filling: we asked for help type ──
    if (session.pendingHelpType === 'ask' && session.pendingTopic) {
      const resolvedHelp = helpType || (topic ? 'explanation' : null);
      if (resolvedHelp || topic) {
        const useTopic = topic || session.pendingTopic;
        const response = getTopicResponse(useTopic, resolvedHelp || 'explanation');
        if (response) {
          session.fallbackCount = 0;
          session.pendingTopic = null;
          session.pendingHelpType = null;
          return { text: response, session };
        }
      }
    }

    // ── Direct topic hit ──
    if (topic) {
      session.fallbackCount = 0;

      // Special case: di/di- question
      if (intent === 'di_prefix_question' || topic === 'preposition' || topic === 'prefix') {
        session.pendingTopic = null;
        session.pendingHelpType = null;
        return { text: RESPONSES.di_prefix(), session };
      }

      if (!helpType) {
        // Ask what kind of help they need
        session.pendingTopic = topic;
        session.pendingHelpType = 'ask';
        return { text: RESPONSES.ask_help_type(topic), session };
      }

      const response = getTopicResponse(topic, helpType);
      if (response) {
        session.pendingTopic = null;
        session.pendingHelpType = null;
        return { text: response, session };
      }
    }

    // ── Intent with no topic ──
    if (intent === 'explanation_request' || intent === 'example_request' || intent === 'practice_request' || intent === 'correction_request') {
      session.fallbackCount = 0;
      session.pendingTopic = 'ask_topic';
      return { text: RESPONSES.ask_topic(), session };
    }

    // ── Fallback ──
    session.fallbackCount = (session.fallbackCount || 0) + 1;
    if (session.fallbackCount >= 2) {
      session.fallbackCount = 0;
      return { text: RESPONSES.escalate(), session };
    }
    return { text: RESPONSES.fallback(), session };
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  return {
    createSession,
    processMessage,
    HUMAN_LINK,
    TOPIC_NAMES,
  };

}));
