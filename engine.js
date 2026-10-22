/**
 * BahasaBudi AI — Enjin Chatbot Berasaskan Peraturan
 * Bahasa utama: Bahasa Melayu
 * Serasi dengan pelayar web (global) dan Node.js (module.exports).
 * Tiada kebergantungan luaran. Tiada LLM API.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.BahasaBudiEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // ─── PEMALAR ──────────────────────────────────────────────────────────────

  const PAUTAN_GURU = 'https://wa.me/qr/2ONVEILR5OXYN1';

  // ─── KATA KUNCI TOPIK ─────────────────────────────────────────────────────

  const TOPIK = {
    tatabahasa:   ['tatabahasa', 'grammar', 'kata nama', 'kata kerja', 'kata sifat', 'kata ganti', 'kata hubung',
                   'kata sendi', 'kata tanya', 'kata perintah', 'imbuhan', 'awalan', 'akhiran', 'apitan',
                   'me-', 'ber-', 'ter-', 'di-', 'ke-', 'se-', 'golongan kata', 'jenis kata', 'ayat aktif', 'ayat pasif'],
    ejaan:        ['ejaan', 'spelling', 'salah eja', 'betulkan ejaan', 'cara eja', 'eja', 'sebutan', 'huruf'],
    tanda_baca:   ['tanda baca', 'punctuation', 'noktah', 'koma', 'tanda soal', 'tanda seru', 'titik bertindih',
                   'koma bertindih', 'petikan', 'tanda petik', 'huruf besar', 'huruf kecil'],
    kosa_kata:    ['kosa kata', 'vocabulary', 'perkataan', 'maksud', 'erti', 'definisi', 'sinonim', 'antonim',
                   'kata berlawanan', 'kata bermaksud', 'perbendaharaan kata'],
    peribahasa:   ['peribahasa', 'simpulan bahasa', 'idiom', 'proverb', 'ungkapan', 'bidalan', 'perbilangan'],
    bina_ayat:    ['bina ayat', 'pembinaan ayat', 'sentence', 'struktur ayat', 'cara bina', 'membina ayat',
                   'subjek', 'predikat', 'frasa', 'klausa', 'ayat tunggal', 'ayat majmuk', 'ayat tanya',
                   'ayat perintah', 'ayat penyata', 'ayat seruan'],
    karangan:     ['karangan', 'essay', 'penulisan', 'tulis karangan', 'format karangan', 'pendahuluan',
                   'penutup', 'isi karangan', 'jenis karangan', 'cerita', 'perbincangan', 'fakta', 'dialog'],
    imbuhan:      ['imbuhan', 'awalan', 'akhiran', 'apitan', 'sisipan', 'me-', 'ber-', 'ter-', 'di-',
                   'pe-', 'per-', '-kan', '-i', '-an', 'ke-...-an', 'pe-...-an'],
    di_kata_sendi: ['di kata sendi', 'di preposisi', 'perbezaan di', 'di sebagai', 'di dan di-',
                    'di sekolah', 'di rumah', 'bila guna di', 'aturan di'],
  };

  const NAMA_TOPIK = {
    tatabahasa:   'Tatabahasa',
    ejaan:        'Ejaan',
    tanda_baca:   'Tanda Baca',
    kosa_kata:    'Kosa Kata',
    peribahasa:   'Peribahasa & Simpulan Bahasa',
    bina_ayat:    'Pembinaan Ayat',
    karangan:     'Penulisan Karangan',
    imbuhan:      'Imbuhan',
    di_kata_sendi:'Kata Sendi "di" dan Imbuhan "di-"',
  };

  // ─── NIAT (INTENTS) ───────────────────────────────────────────────────────

  const NIAT = [
    {
      nama: 'salam',
      corak: [/\b(hello|hi|helo|hai|selamat|salam|assalamualaikum|apa khabar|good morning|good afternoon|good evening|waalaikumsalam)\b/i],
    },
    {
      nama: 'terima_kasih',
      corak: [/\b(terima kasih|thank|thanks|tq|syukran|jazakallah|hebat|bagus|pandai)\b/i],
    },
    {
      nama: 'selamat_tinggal',
      corak: [/\b(bye|selamat tinggal|selamat jalan|dadah|jumpa lagi|ok dah|oklah|chow)\b/i],
    },
    {
      nama: 'kerja_rumah',
      corak: [/\b(buat.*untuk saya|siapkan.*tugasan|jawab.*untuk saya|buat.*karangan.*saya|tulis.*untuk saya|buat.*homework|buat.*kerja rumah|selesaikan.*tugasan|siap.*peperiksaan|buat.*ujian)\b/i],
    },
    {
      nama: 'luar_topik',
      corak: [/\b(cuaca|politik|sukan|bola|muzik|filem|makanan|tiktok|youtube|instagram|facebook|permainan|game|gossip|artis)\b/i],
    },
    {
      nama: 'soal_di',
      corak: [/\bdi[-\s]?(kata sendi|preposisi|imbuhan|awalan)\b/i, /perbezaan.*\bdi\b/i, /\bdi\b.*\bdi-\b/i, /bila.*guna.*\bdi\b/i, /\bdi-\b.*atau.*\bdi\b/i],
    },
    {
      nama: 'minta_penerangan',
      corak: [/\b(terangkan|huraikan|jelaskan|apakah|apa itu|apa dia|bagaimana|kenapa|mengapa|explain|what is)\b/i],
    },
    {
      nama: 'minta_contoh',
      corak: [/\b(contoh|berikan contoh|tunjukkan|bagi contoh|senaraikan)\b/i],
    },
    {
      nama: 'minta_latihan',
      corak: [/\b(latihan|soalan|kuiz|quiz|test|ujian|cuba|praktis|practice|practise|beri soalan)\b/i],
    },
    {
      nama: 'minta_pembetulan',
      corak: [/\b(betulkan|semak|periksa|check|salah|pembetulan|tegur|perbetulkan)\b/i],
    },
  ];

  // ─── KANDUNGAN PEMBELAJARAN ───────────────────────────────────────────────

  const RESPONS = {

    salam: () =>
      `Assalamualaikum dan Selamat Datang! 👋\n\nSaya **BahasaBudi AI**, pembantu pembelajaran Bahasa Melayu anda.\n\nSaya boleh membantu anda dalam:\n• 📖 Tatabahasa\n• ✏️ Ejaan\n• 🔤 Tanda Baca\n• 💬 Kosa Kata\n• 🌿 Peribahasa & Simpulan Bahasa\n• 📝 Pembinaan Ayat\n• 📄 Penulisan Karangan\n• 🔧 Imbuhan\n\nApakah topik Bahasa Melayu yang ingin anda pelajari hari ini? 😊`,

    terima_kasih: () =>
      `Sama-sama! 😊 Teruskan semangat belajar Bahasa Melayu anda. Adakah ada topik lain yang ingin anda terokai?`,

    selamat_tinggal: () =>
      `Selamat belajar! 👋 Teruskan berlatih Bahasa Melayu setiap hari dan anda pasti akan semakin mahir. Jumpa lagi!`,

    tanya_topik: () =>
      `Boleh! Apakah topik Bahasa Melayu yang anda ingin pelajari? Anda boleh pilih:\n• Tatabahasa\n• Ejaan\n• Tanda Baca\n• Kosa Kata\n• Peribahasa & Simpulan Bahasa\n• Pembinaan Ayat\n• Penulisan Karangan\n• Imbuhan`,

    tanya_jenis_bantuan: (topik) =>
      `Apakah bantuan yang anda perlukan dalam **${NAMA_TOPIK[topik] || topik}**? Saya boleh memberikan:\n• Penerangan\n• Contoh\n• Pembetulan\n• Latihan & Soalan`,

    kerja_rumah: () =>
      `Saya di sini untuk **membimbing** anda, bukan menyiapkan kerja bagi pihak anda. 😊\n\nJika saya terus berikan jawapan, anda tidak akan benar-benar faham — dan itulah yang paling penting!\n\nBeritahu saya **topik** atau **konsep** yang anda tidak faham, dan saya akan:\n• Terangkan peraturannya dengan jelas\n• Berikan contoh yang sesuai\n• Bantu anda berlatih langkah demi langkah\n\nDengan cara ini, anda akan dapat menjawab sendiri dengan yakin. Topik mana yang ingin kita mulakan?`,

    luar_topik: () =>
      `Terima kasih atas pertanyaan anda, tetapi tujuan utama saya adalah untuk membantu anda belajar **Bahasa Melayu**. 😊\n\nUntuk perkara di luar pembelajaran bahasa, sila berbincang dengan orang dewasa atau guru yang dipercayai.\n\nAdakah ada topik Bahasa Melayu yang boleh saya bantu hari ini?`,

    eskalasi: () =>
      `Maaf, saya menghadapi kesukaran memahami soalan anda. Sila hubungi guru Bahasa Melayu anda untuk bantuan lanjut:\n\n👩‍🏫 **Hubungi Guru:** [Klik di sini untuk WhatsApp](${PAUTAN_GURU})\n\nAnda juga boleh cuba bertanya dengan cara yang berbeza, dan saya akan berusaha membantu! 😊`,

    gagal_faham: () =>
      `Maaf, saya kurang faham soalan anda. Boleh anda beritahu topik Bahasa Melayu yang anda ingin pelajari, atau cuba tanya dengan cara lain?\n\n*(Petua: Anda boleh bertanya tentang tatabahasa, ejaan, tanda baca, kosa kata, peribahasa, pembinaan ayat atau karangan.)*`,

    // ── TATABAHASA ─────────────────────────────────────────────────────────

    tatabahasa: (jenisB) => {
      const penerangan = `## Tatabahasa Bahasa Melayu\n\nTatabahasa ialah peraturan yang mengawal pembentukan kata dan binaan ayat dalam Bahasa Melayu.\n\n**Golongan Kata Utama:**\n\n| Golongan Kata | Keterangan | Contoh |\n|---------------|------------|--------|\n| Kata Nama | Nama orang, tempat, benda | buku, murid, sekolah |\n| Kata Kerja | Perbuatan atau keadaan | membaca, berlari, menulis |\n| Kata Adjektif | Sifat atau keadaan | cantik, besar, rajin |\n| Kata Ganti Nama | Menggantikan kata nama | saya, dia, mereka, kami |\n| Kata Sendi Nama | Menunjukkan hubungan | di, ke, dari, daripada, untuk |\n| Kata Hubung | Menghubungkan kata/ayat | dan, atau, tetapi, kerana |\n\n**Imbuhan (Awalan, Akhiran, Apitan):**\n- **Awalan:** me-, ber-, ter-, di-, ke-, se-, pe-, per-\n- **Akhiran:** -kan, -i, -an\n- **Apitan:** me-...-kan, ber-...-an, ke-...-an, pe-...-an\n\n**Contoh Penggunaan Imbuhan:**\n- *tulis* → **menu**lis (kata kerja aktif)\n- *tulis* → **di**tulis (kata kerja pasif)\n- *tulis* → tulisan (kata nama)\n- *tulis* → penulis (kata nama pelaku)`;

      const contoh = `## Contoh Tatabahasa\n\n**Penggunaan Awalan:**\n\n| Kata Dasar | + Awalan | Bentuk Baharu | Makna |\n|------------|----------|---------------|-------|\n| baca | me- | **mem**baca | sedang membaca |\n| lari | ber- | **ber**lari | melakukan perbuatan berlari |\n| dapat | ter- | **ter**dapat | wujud / ada |\n| tulis | di- | **di**tulis | ditulis oleh orang lain |\n\n**Petua Penting — Perubahan Awalan *me-*:**\n| Huruf Pertama Kata Dasar | Bentuk *me-* | Contoh |\n|--------------------------|-------------|--------|\n| p | mem- | pukul → **mem**ukul |\n| t | men- | tulis → **men**ulis |\n| k | meng- | kira → **meng**ira |\n| s | meny- | sapu → **meny**apu |\n| c, j, d, g, l, m, n, r, w, y | me- / meng- / men- | *(bergantung pada huruf)* |`;

      const latihan = `## Latihan Tatabahasa\n\n**Latihan 1 — Tambah awalan yang betul (me-, ber-, ter-, di-):**\n1. ___ baca (membaca / dibaca)\n2. ___ lari\n3. ___ tulis\n4. ___ nyanyi\n5. ___ selesai (diselesaikan / terselesai)\n\n**Latihan 2 — Kenal pasti golongan kata:**\nAdakah setiap perkataan ini Kata Nama, Kata Kerja atau Kata Adjektif?\n1. berlari\n2. buku\n3. pandai\n4. menulis\n5. sekolah\n6. cantik\n\n*(Cuba jawab dahulu — kemudian kongsikan jawapan anda untuk saya semak!)*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── EJAAN ──────────────────────────────────────────────────────────────

    ejaan: (jenisB) => {
      const penerangan = `## Ejaan Bahasa Melayu\n\nEjaan yang betul sangat penting dalam penulisan Bahasa Melayu. Berikut adalah panduan ejaan mengikut Sistem Ejaan Rumi Baharu.\n\n**1. Huruf Vokal**\n- Bahasa Melayu mempunyai enam vokal: **a, e, i, o, u** dan **e pepet** (bunyi "e" dalam *emak*, *enam*).\n\n**2. Kesalahan Ejaan yang Lazim:**\n| ❌ Salah | ✅ Betul | Catatan |\n|---------|---------|----------|\n| disekolah | di sekolah | "di" + tempat = dipisahkan |\n| di tulis | ditulis | "di-" + kata kerja = dicantumkan |\n| kesekolah | ke sekolah | "ke" + tempat = dipisahkan |\n| dinegara | di negara | "di" + tempat = dipisahkan |\n| kerumah | ke rumah | "ke" + tempat = dipisahkan |\n\n**3. Peraturan "di" dan "di-" (sangat penting!):**\n- **"di"** (kata sendi nama) + **tempat** → ditulis **berasingan**: *di sekolah, di rumah*\n- **"di-"** (awalan) + **kata kerja** → ditulis **bercantum**: *ditulis, dibaca, ditanya*\n\n**Cara mudah ingat:** Tanya diri sendiri — adakah perkataan selepas "di" itu **TEMPAT** atau **PERBUATAN**?`;

      const contoh = `## Contoh Ejaan\n\n**Betul atau Salah?**\n\n| ❌ Salah | ✅ Betul |\n|---------|--------|\n| saya tinggal disekolah | saya tinggal **di sekolah** |\n| buku itu di baca oleh dia | buku itu **dibaca** oleh dia |\n| mereka bermain dipadang | mereka bermain **di padang** |\n| surat itu di pos | surat itu **dipos** ✅ |\n| dia pergi kepasar | dia pergi **ke pasar** |\n| makanan itu di masak | makanan itu **dimasak** |\n\n**Ingat peraturannya:**\n- TEMPAT → tulis **"di"** berasingan\n- PERBUATAN (kata kerja) → tulis **"di-"** bercantum`;

      const latihan = `## Latihan Ejaan\n\n**Latihan — Tulis "di" berasingan atau "di-" bercantum?**\n\n1. Dia tinggal ___ kampung.\n2. Buku itu ___ baca oleh semua murid.\n3. Mereka bermain ___ padang sekolah.\n4. Surat itu sudah ___ hantar semalam.\n5. Adik saya belajar ___ universiti.\n6. Masalah itu ___ selesaikan oleh guru.\n7. Kami berkumpul ___ dewan sekolah.\n\n*(Fikir baik-baik: adakah perkataan selepas "di" itu TEMPAT atau PERBUATAN?)*\n\n*Hantar jawapan anda dan saya akan periksa!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── TANDA BACA ─────────────────────────────────────────────────────────

    tanda_baca: (jenisB) => {
      const penerangan = `## Tanda Baca Bahasa Melayu\n\nTanda baca membantu menyusun penulisan dan memperjelas makna ayat.\n\n**Tanda Baca Utama:**\n\n| Simbol | Nama | Kegunaan |\n|--------|------|----------|\n| . | Noktah | Mengakhiri ayat penyata |\n| , | Koma | Memisahkan senarai atau klausa |\n| ? | Tanda soal | Mengakhiri ayat tanya |\n| ! | Tanda seru | Tekanan atau seruan |\n| : | Titik bertindih | Sebelum senarai atau penjelasan |\n| ; | Koma bertitik | Antara klausa yang berkaitan |\n| \" \" | Tanda petikan | Percakapan langsung |\n\n**Penggunaan Huruf Besar:**\n- Mulakan setiap ayat dengan huruf besar.\n- Huruf besar untuk nama khas: nama orang, tempat, bahasa (*Ahmad, Kuala Lumpur, Bahasa Melayu*).\n- Jangan gunakan huruf besar untuk kata nama am di tengah ayat (*murid, sekolah, buku*).`;

      const contoh = `## Contoh Tanda Baca\n\n**Penggunaan yang Betul:**\n\n1. Ahmad pergi ke sekolah setiap hari**.**\n2. Apakah nama kamu**?**\n3. Aduh, sakitnya**!**\n4. Saya suka makan nasi lemak**,** mee goreng**,** dan roti canai**.**\n5. Guru berkata**:** "Semua murid hendaklah bawa buku teks esok**.**"\n\n**Kesalahan Lazim:**\n| ❌ Salah | ✅ Betul |\n|---------|--------|\n| saya suka belajar | Saya suka belajar. |\n| dia pergi ke sekolah? | Dia pergi ke sekolah. |\n| aduh sakitnya | Aduh, sakitnya! |\n| Ahmad dan Ali pergi ke pasar malam Ahmad membeli baju | Ahmad dan Ali pergi ke pasar malam. Ahmad membeli baju. |`;

      const latihan = `## Latihan Tanda Baca\n\n**Tambahkan tanda baca yang sesuai (noktah, tanda soal, tanda seru, koma, huruf besar):**\n\n1. saya pergi ke kedai buku semalam\n2. apakah pelajaran kegemaran kamu\n3. syabas kamu telah berjaya\n4. ibu membeli sayur ikan ayam dan telur di pasar\n5. cikgu berkata semua murid hendaklah hantar kerja rumah esok\n6. wah indahnya pemandangan di sini\n7. ali dan abu pergi ke taman permainan bersama-sama\n\n*Cuba tambahkan semua tanda baca dan huruf besar yang diperlukan!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── KOSA KATA ──────────────────────────────────────────────────────────

    kosa_kata: (jenisB) => {
      const penerangan = `## Kosa Kata Bahasa Melayu\n\nMemiliki kosa kata yang kaya membantu anda berkomunikasi dan menulis dengan lebih berkesan.\n\n**Cara Perkaya Kosa Kata:**\n1. **Baca** teks, berita dan buku Bahasa Melayu dengan kerap.\n2. **Catat** perkataan baharu dalam buku nota berserta maknanya.\n3. **Gunakan** perkataan baharu dalam ayat supaya lebih mudah ingat.\n4. **Pelajari keluarga kata** — kata dasar + imbuhan:\n   - *tulis* → menulis, tulisan, penulis, ditulis, penulisan\n\n**Jenis Kosa Kata Penting:**\n- **Sinonim:** Perkataan yang bermaksud sama\n  - *cantik = indah = molek = jelita*\n  - *besar = agung = gah = raksasa*\n- **Antonim:** Perkataan yang bermaksud berlawanan\n  - *besar ↔ kecil*\n  - *panas ↔ sejuk*\n  - *pandai ↔ bodoh*\n- **Kata Formal vs Tidak Formal:**\n  - *makan (biasa) → menjamah / menikmati (formal)*\n  - *pergi (biasa) → berangkat / bertolak (formal)*`;

      const contoh = `## Contoh Kosa Kata\n\n**Sinonim (Kata Bermaksud Sama):**\n| Perkataan | Sinonim |\n|-----------|---------|\n| cantik | indah, molek, jelita, elok |\n| besar | agung, gah, raksasa, luas |\n| cepat | segera, pantas, laju, deras |\n| sedih | dukacita, pilu, sendu, murung |\n| gembira | riang, ceria, sukacita, bahagia |\n\n**Keluarga Kata:**\n| Kata Dasar | Kata Kerja | Kata Nama (benda) | Kata Nama (pelaku) |\n|------------|------------|-------------------|--------------------|\n| tulis | menulis | tulisan | penulis |\n| baca | membaca | bacaan | pembaca |\n| ajar | mengajar | ajaran | pengajar / guru |\n| jual | menjual | jualan | penjual |`;

      const latihan = `## Latihan Kosa Kata\n\n**Latihan 1 — Padankan sinonim:**\nPilih sinonim yang betul:\n1. cantik → (a) pantas  (b) indah  (c) besar\n2. cepat → (a) laju  (b) panas  (c) kecil\n3. sedih → (a) agung  (b) pilu  (c) molek\n4. gembira → (a) ceria  (b) murung  (c) laju\n\n**Latihan 2 — Lengkapkan jadual keluarga kata:**\nIsikan jadual untuk kata dasar *jual*:\n| Kata Dasar | Kata Kerja | Nama (benda dijual) | Nama (orang yang jual) |\n|------------|------------|---------------------|------------------------|\n| jual | ? | ? | ? |\n\n**Latihan 3 — Gantikan dengan kata formal:**\n1. Dia *pergi* ke Johor Bahru semalam.\n2. Mereka *makan* di restoran mewah itu.\n3. Pemimpin itu *bercakap* di hadapan orang ramai.\n\n*Cuba dahulu, kemudian tunjukkan jawapan anda!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── PERIBAHASA ─────────────────────────────────────────────────────────

    peribahasa: (jenisB) => {
      const penerangan = `## Peribahasa & Simpulan Bahasa\n\nPeribahasa dan simpulan bahasa ialah ungkapan istimewa dalam Bahasa Melayu yang mempunyai makna tersirat.\n\n**Jenis-Jenis:**\n\n**1. Peribahasa (Pepatah)**\nAyat lengkap yang mengandungi pengajaran atau nilai moral:\n- *Seperti aur dengan tebing* — Persahabatan yang rapat; saling bantu-membantu\n- *Bagai mencurah air ke daun keladi* — Usaha yang sia-sia; nasihat tidak diendahkan\n- *Alang-alang menyeluk pekasam, biar sampai ke pangkal lengan* — Kalau hendak buat sesuatu, buat dengan bersungguh-sungguh\n- *Hendak seribu daya, tak hendak seribu dalih* — Kalau ada kemahuan, ada jalan; kalau tidak mahu, pelbagai alasan diberikan\n\n**2. Simpulan Bahasa**\nUngkapan pendek dua atau tiga patah perkataan dengan makna kiasan:\n- *Buah tangan* — Hadiah yang dibawa semasa berkunjung\n- *Besar kepala* — Sombong / angkuh\n- *Naik angin* — Marah / hilang sabar\n- *Ringan tulang* — Rajin / suka membantu\n- *Panjang tangan* — Suka mencuri\n- *Kaki bangku* — Tidak pandai bersukan`;

      const contoh = `## Contoh Peribahasa & Simpulan Bahasa\n\n**Simpulan Bahasa dalam Ayat:**\n\n| Simpulan Bahasa | Makna | Contoh Ayat |\n|----------------|-------|-------------|\n| buah tangan | hadiah | Ali membawa **buah tangan** untuk neneknya. |\n| besar kepala | sombong | Jangan **besar kepala** apabila berjaya. |\n| naik angin | marah | Ayah **naik angin** kerana kereta itu rosak. |\n| ringan tulang | rajin | Kakak saya **ringan tulang** membantu ibu. |\n| kaki bangku | tidak pandai bersukan | Dia **kaki bangku** di padang. |\n| panjang tangan | suka mencuri | Jangan jadi orang **panjang tangan**. |\n\n**Peribahasa dalam Ayat:**\n- Ahmad dan Ali **seperti aur dengan tebing**, sentiasa membantu antara satu sama lain.`;

      const latihan = `## Latihan Peribahasa\n\n**Latihan 1 — Padankan simpulan bahasa dengan maknanya:**\n1. buah tangan → (a) sombong  (b) hadiah  (c) rajin\n2. naik angin → (a) gembira  (b) marah  (c) rajin\n3. ringan tulang → (a) malas  (b) suka membantu  (c) cerewet\n4. besar kepala → (a) bijak  (b) sombong  (c) tinggi\n\n**Latihan 2 — Isi tempat kosong dengan simpulan bahasa yang sesuai:**\n*(buah tangan / naik angin / ringan tulang / besar kepala / kaki bangku)*\n1. Jangan ___ walaupun kamu mendapat tempat pertama.\n2. Dia suka membantu semua orang. Dia memang ___.\n3. Emak saya ___ kerana saya lupa buat kerja rumah.\n4. Abang saya membawa ___ untuk kami apabila pulang dari Jepun.\n\n*Cuba jawab dan kongsikan jawapan anda!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── BINA AYAT ──────────────────────────────────────────────────────────

    bina_ayat: (jenisB) => {
      const penerangan = `## Pembinaan Ayat Bahasa Melayu\n\nAyat yang gramatis dalam Bahasa Melayu mengikut struktur yang jelas.\n\n**Struktur Asas Ayat:**\n\n> **Subjek + Predikat**\n\n- **Subjek** — siapa atau apakah yang dibicarakan\n- **Predikat** — apa yang dilakukan atau keadaan subjek\n\n**Jenis Predikat:**\n\n| Jenis Predikat | Contoh |\n|----------------|--------|\n| Frasa Kerja | Ahmad **berlari** di padang. |\n| Frasa Nama | Dia **seorang doktor**. |\n| Frasa Adjektif | Bunga itu **sangat cantik**. |\n| Frasa Sendi Nama | Buku itu **di atas meja**. |\n\n**Langkah Membina Ayat:**\n1. Pilih **subjek** (siapa/apa): *Murid itu*\n2. Pilih **predikat** (kata kerja/penerangan): *membaca buku*\n3. Tambah **keterangan** (di mana/bila/bagaimana): *di perpustakaan setiap hari*\n4. Ayat lengkap: *Murid itu membaca buku di perpustakaan setiap hari.*\n\n**Jenis-Jenis Ayat:**\n- **Ayat Penyata** — menyatakan sesuatu: *Saya suka membaca.*\n- **Ayat Tanya** — bertanya: *Adakah kamu suka membaca?*\n- **Ayat Perintah** — mengarah: *Sila baca buku itu.*\n- **Ayat Seruan** — luahan perasaan: *Alangkah indahnya pemandangan ini!*`;

      const contoh = `## Contoh Pembinaan Ayat\n\n**Ayat Mudah:**\n| Subjek | Predikat | Ayat Lengkap |\n|--------|----------|--------------|\n| Ahmad | berlari | Ahmad berlari. |\n| Ibu | memasak nasi | Ibu memasak nasi. |\n| Kucing itu | sangat comel | Kucing itu sangat comel. |\n\n**Ayat yang Diperkembangkan:**\n- *Ahmad berlari **dengan pantas** di padang sekolah **setiap pagi**.*\n- *Ibu memasak nasi lemak **di dapur** **pada waktu pagi**.*\n\n**Ayat Majmuk (Ayat Gabungan):**\n- *Ahmad belajar dengan rajin **dan** dia berjaya dalam peperiksaan.*\n- *Saya suka membaca **tetapi** adik saya lebih suka bermain.*\n- *Dia tidak hadir ke sekolah **kerana** dia sakit.*`;

      const latihan = `## Latihan Pembinaan Ayat\n\n**Latihan 1 — Kenal pasti subjek dan predikat:**\n1. *Murid-murid itu bermain di padang.*\n   - Subjek: ?\n   - Predikat: ?\n2. *Buku itu sangat tebal.*\n   - Subjek: ?\n   - Predikat: ?\n\n**Latihan 2 — Susun perkataan menjadi ayat yang betul:**\n1. buku / membaca / murid / di / perpustakaan\n2. cantik / bunga / di / taman / itu\n3. Ahmad / setiap / berlari / pagi / padang / di\n\n**Latihan 3 — Kembangkan ayat dengan menambah keterangan:**\nTambah maklumat (di mana, bila, bagaimana) untuk menjadikan ayat lebih menarik:\n1. *Ibu memasak.* → ?\n2. *Adik bermain.* → ?\n3. *Guru mengajar.* → ?\n\n*Tulis jawapan anda dan saya akan bantu semak!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── KARANGAN ───────────────────────────────────────────────────────────

    karangan: (jenisB) => {
      const penerangan = `## Penulisan Karangan Bahasa Melayu\n\nKarangan yang baik mempunyai struktur yang jelas, penggunaan bahasa yang betul dan isi yang lengkap.\n\n**Jenis-Jenis Karangan:**\n1. **Karangan Cerita (Naratif)** — menceritakan sesuatu peristiwa\n2. **Karangan Deskriptif** — menggambarkan seseorang, tempat atau peristiwa\n3. **Karangan Perbincangan** — membincangkan isu dengan pelbagai sudut pandangan\n4. **Karangan Pendapat** — memberikan pendapat berserta hujah dan alasan\n5. **Karangan Dialog** — perbualan antara dua orang atau lebih\n\n**Format Karangan Standard:**\n\n**Pendahuluan**\n- Perkenalkan tajuk dalam 2–3 ayat.\n- Gunakan ayat pembuka yang menarik perhatian pembaca.\n\n**Isi (Badan Karangan)**\n- Setiap perenggan = 1 isi utama\n- Struktur: **Isi → Huraian → Contoh**\n- Gunakan kata penghubung: *pertama sekali, seterusnya, selain itu, tambahan pula, akhir sekali*\n\n**Penutup**\n- Rumuskan isi-isi utama.\n- Akhiri dengan ayat penutup yang berkesan atau seruan kepada pembaca.`;

      const contoh = `## Contoh Penulisan Karangan\n\n**Contoh satu perenggan isi:**\n\n> **Isi:** Membaca dapat meluaskan pengetahuan seseorang.\n> **Huraian:** Dengan membaca, kita dapat mempelajari pelbagai perkara baharu yang tidak kita ketahui sebelum ini.\n> **Contoh:** Contohnya, dengan membaca buku sains, murid dapat memahami fenomena alam dengan lebih mendalam.\n\n**Kata Penghubung yang Berguna:**\n\n| Fungsi | Kata Penghubung |\n|--------|------------------|\n| Isi pertama | Pertama sekali, Pertama |\n| Menambah isi | Selain itu, Tambahan pula, Di samping itu |\n| Isi seterusnya | Seterusnya, Kemudian |\n| Isi terakhir | Akhir sekali, Kesimpulannya |\n| Memberi contoh | Sebagai contoh, Contohnya, Misalnya |\n| Penutup | Kesimpulannya, Oleh itu, Oleh yang demikian |`;

      const latihan = `## Latihan Penulisan Karangan\n\n**Latihan 1 — Rancang karangan anda:**\nUntuk tajuk *"Kepentingan Membaca"*, rancangkan:\n- Pendahuluan: Apakah ayat pembuka anda?\n- Isi 1: Hujah pertama (cth: meluaskan pengetahuan)\n- Isi 2: Hujah kedua\n- Isi 3: Hujah ketiga\n- Penutup: Ayat penutup yang berkesan\n\n**Latihan 2 — Tulis satu perenggan isi:**\nGunakan struktur **Isi → Huraian → Contoh** untuk tajuk *"Faedah Bersenam"*.\n\n**Latihan 3 — Perbaiki pendahuluan ini:**\n*"Membaca itu baik. Kita semua perlu membaca. Membaca sangat bagus."*\n→ Bagaimana anda akan jadikan pendahuluan ini lebih menarik dan berkesan?\n\n*Kongsikan cubaan anda dan saya akan berikan maklum balas!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── IMBUHAN ────────────────────────────────────────────────────────────

    imbuhan: (jenisB) => {
      const penerangan = `## Imbuhan Bahasa Melayu\n\nImbuhan ialah unit bahasa yang ditambah kepada kata dasar untuk membentuk kata baharu dengan makna yang berbeza.\n\n**Jenis-Jenis Imbuhan:**\n\n**1. Awalan (ditambah di hadapan kata dasar)**\n| Awalan | Fungsi | Contoh |\n|--------|--------|--------|\n| me- | Kata kerja aktif | menulis, membaca |\n| ber- | Kata kerja aktif | berlari, berbual |\n| ter- | Keadaan tidak sengaja / boleh | terjatuh, terbaca |\n| di- | Kata kerja pasif | ditulis, dibaca |\n| ke- | Kata nama / ordinal | ketua, kelima |\n| se- | Satu / sama | sekolah, sekali |\n| pe- | Kata nama pelaku | penulis, pembaca |\n| per- | Menjadikan / meningkatkan | perbesar, permudah |\n\n**2. Akhiran (ditambah di belakang kata dasar)**\n| Akhiran | Fungsi | Contoh |\n|---------|--------|--------|\n| -kan | Melakukan untuk / menyebabkan | tuliskan, bacakan |\n| -i | Melakukan berulang / pada | tulisi, ikuti |\n| -an | Kata nama abstrak | tulisan, bacaan |\n\n**3. Apitan (ditambah di hadapan DAN belakang)**\n| Apitan | Contoh |\n|--------|--------|\n| me-...-kan | menuliskan, membacakan |\n| me-...-i | menulisi, mengikuti |\n| ke-...-an | kebaikan, kecantikan |\n| pe-...-an | penulisan, pembacaan |`;

      const contoh = `## Contoh Imbuhan\n\n**Kata Dasar + Imbuhan = Makna Baharu:**\n\n| Kata Dasar | Imbuhan | Kata Baharu | Makna |\n|------------|---------|-------------|-------|\n| tulis | me- | menulis | melakukan perbuatan menulis |\n| tulis | di- | ditulis | ditulis oleh orang lain |\n| tulis | pe- | penulis | orang yang menulis |\n| tulis | -an | tulisan | hasil daripada menulis |\n| tulis | me-...-kan | menuliskan | menulis untuk orang lain |\n| besar | per- | perbesar | menjadikan lebih besar |\n| cantik | ke-...-an | kecantikan | keadaan cantik |\n\n**Perubahan Bentuk Awalan *me-*:**\n| Huruf Pertama | Bentuk | Contoh |\n|---------------|--------|--------|\n| p | mem- | pukul → **mem**ukul |\n| t | men- | tulis → **men**ulis |\n| k | meng- | kira → **meng**ira |\n| s | meny- | sapu → **meny**apu |\n| huruf lain | me- / men- / meng- | *(bergantung kata)* |`;

      const latihan = `## Latihan Imbuhan\n\n**Latihan 1 — Tambah awalan yang betul:**\n1. ___ baca (awalan me- atau di-?)\n2. ___ lari (awalan ber-?)\n3. ___ tulis (awalan pe- untuk buat kata nama pelaku?)\n4. ___ selesaikan masalah itu (awalan me- atau ter-?)\n\n**Latihan 2 — Bentuk keluarga kata:**\nLengkapkan jadual untuk kata dasar *ajar*:\n| Kata Dasar | + me- | + di- | + pe- | + -an | + pe-...-an |\n|------------|-------|-------|-------|-------|-------------|\n| ajar | ? | ? | ? | ? | ? |\n\n**Latihan 3 — Pilih imbuhan yang betul:**\n1. Guru itu ___ (ajar) murid-murid dengan sabar. (mengajar / diajar)\n2. Buku itu ___ (tulis) oleh seorang sasterawan terkenal. (menulis / ditulis)\n3. Dia ialah seorang ___ (nyanyi) berbakat. (penyanyi / nyanyian)\n\n*Hantar jawapan anda!*`;

      if (!jenisB || jenisB === 'penerangan') return penerangan;
      if (jenisB === 'contoh') return contoh;
      if (jenisB === 'latihan') return latihan;
      return penerangan + '\n\n---\n\n' + contoh;
    },

    // ── "di" KATA SENDI vs "di-" IMBUHAN ──────────────────────────────────

    di_kata_sendi: () =>
      `## Perbezaan "di" (Kata Sendi Nama) dan "di-" (Awalan/Imbuhan)\n\nIni adalah salah satu soalan ejaan yang paling kerap ditanya dalam Bahasa Melayu!\n\n---\n\n**1. "di" sebagai Kata Sendi Nama**\n- Digunakan sebelum **nama tempat atau lokasi**\n- Ditulis **berasingan** daripada perkataan selepasnya\n- Menunjukkan **DI MANA** sesuatu berlaku atau berada\n\n| Contoh | Penjelasan |\n|--------|------------|\n| *di sekolah* | di tempat bernama sekolah |\n| *di rumah* | di tempat bernama rumah |\n| *di padang* | di tempat bernama padang |\n| *di Kuala Lumpur* | di bandar Kuala Lumpur |\n\n---\n\n**2. "di-" sebagai Awalan (Imbuhan)**\n- Digunakan sebelum **kata kerja (perbuatan)**\n- Ditulis **bercantum** dengan kata kerja (tiada ruang)\n- Menunjukkan ayat **PASIF** — sesuatu dilakukan KEPADA subjek\n\n| Contoh | Penjelasan |\n|--------|------------|\n| *dibaca* | kata kerja: baca (dibaca oleh seseorang) |\n| *ditulis* | kata kerja: tulis |\n| *ditanya* | kata kerja: tanya |\n| *dihantar* | kata kerja: hantar |\n\n---\n\n**Cara Mudah Ingat:**\nTanya diri sendiri — adakah perkataan selepas "di" itu **TEMPAT** atau **PERBUATAN**?\n- 📍 TEMPAT → tulis **"di"** berasingan: *di sekolah*\n- 🔧 PERBUATAN (kata kerja) → tulis **"di-"** bercantum: *ditulis*\n\n---\n\n**Cuba selesaikan latihan ini:**\n1. Surat itu ___ hantar semalam. *(dihantar atau di hantar?)*\n2. Mereka bermain ___ padang. *(dipadang atau di padang?)*\n3. Buku ini ___ beli oleh ibu. *(dibeli atau di beli?)*\n4. Adik saya belajar ___ universiti. *(diuniversiti atau di universiti?)*`,

  };

  // ─── KEADAAN SESI ─────────────────────────────────────────────────────────

  function buatSesi() {
    return {
      bilanganGagal: 0,
      topikTunggu: null,
      jenisB_Tunggu: null,
    };
  }

  // ─── FUNGSI PEMBANTU ──────────────────────────────────────────────────────

  function kesanTopik(teks) {
    const kecil = teks.toLowerCase();
    if (/\bdi[-\s]?(kata sendi|preposisi|imbuhan|awalan)\b|\bperbezaan.*\bdi\b|\bdi\b.*\bdi-\b|\bbila.*guna.*\bdi\b|\bdi-\b.*atau.*\bdi\b/i.test(teks)) return 'di_kata_sendi';
    for (const [topik, katakunci] of Object.entries(TOPIK)) {
      for (const kk of katakunci) {
        if (kecil.includes(kk.toLowerCase())) return topik;
      }
    }
    return null;
  }

  function kesanJenisBantuan(teks) {
    if (/\b(latihan|soalan|kuiz|quiz|test|ujian|cuba|praktis|practice|practise|beri soalan)\b/i.test(teks)) return 'latihan';
    if (/\b(contoh|berikan contoh|tunjukkan|bagi contoh|senaraikan)\b/i.test(teks)) return 'contoh';
    if (/\b(betulkan|semak|periksa|check|salah|pembetulan|tegur)\b/i.test(teks)) return 'pembetulan';
    if (/\b(terangkan|huraikan|jelaskan|apakah|apa itu|bagaimana|kenapa|mengapa|explain)\b/i.test(teks)) return 'penerangan';
    return null;
  }

  function padankanNiat(teks) {
    for (const niat of NIAT) {
      for (const corak of niat.corak) {
        if (corak.test(teks)) return niat.nama;
      }
    }
    return null;
  }

  function dapatkanResponsTopik(topik, jenisB) {
    if (topik === 'di_kata_sendi') return RESPONS.di_kata_sendi();
    if (typeof RESPONS[topik] === 'function') return RESPONS[topik](jenisB);
    return null;
  }

  // ─── FUNGSI UTAMA PROSES ──────────────────────────────────────────────────

  function prosesMessej(teks, sesi) {
    if (!teks || !teks.trim()) {
      return { teks: RESPONS.gagal_faham(), sesi };
    }

    const dipangkas = teks.trim();
    const niat = padankanNiat(dipangkas);
    const topik = kesanTopik(dipangkas);
    const jenisB = kesanJenisBantuan(dipangkas);

    // ── Niat utama ──
    if (niat === 'salam') {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.salam(), sesi };
    }
    if (niat === 'terima_kasih') {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.terima_kasih(), sesi };
    }
    if (niat === 'selamat_tinggal') {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.selamat_tinggal(), sesi };
    }
    if (niat === 'kerja_rumah') {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.kerja_rumah(), sesi };
    }
    if (niat === 'luar_topik') {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.luar_topik(), sesi };
    }

    // ── Pengisian slot: sedang menunggu topik ──
    if (sesi.topikTunggu === 'tanya_topik') {
      if (topik) {
        sesi.bilanganGagal = 0;
        if (!jenisB) {
          return { teks: RESPONS.tanya_jenis_bantuan(topik), sesi: { ...sesi, topikTunggu: topik, jenisB_Tunggu: 'tanya' } };
        }
        const respons = dapatkanResponsTopik(topik, jenisB);
        if (respons) {
          sesi.topikTunggu = null; sesi.jenisB_Tunggu = null;
          return { teks: respons, sesi };
        }
      }
    }

    // ── Pengisian slot: sedang menunggu jenis bantuan ──
    if (sesi.jenisB_Tunggu === 'tanya' && sesi.topikTunggu) {
      const selesaiJenisB = jenisB || (topik ? 'penerangan' : null);
      if (selesaiJenisB || topik) {
        const gunaTopik = topik || sesi.topikTunggu;
        const respons = dapatkanResponsTopik(gunaTopik, selesaiJenisB || 'penerangan');
        if (respons) {
          sesi.bilanganGagal = 0; sesi.topikTunggu = null; sesi.jenisB_Tunggu = null;
          return { teks: respons, sesi };
        }
      }
    }

    // ── Topik dikesan terus ──
    if (topik) {
      sesi.bilanganGagal = 0;
      if (topik === 'di_kata_sendi') {
        sesi.topikTunggu = null; sesi.jenisB_Tunggu = null;
        return { teks: RESPONS.di_kata_sendi(), sesi };
      }
      if (!jenisB) {
        sesi.topikTunggu = topik; sesi.jenisB_Tunggu = 'tanya';
        return { teks: RESPONS.tanya_jenis_bantuan(topik), sesi };
      }
      const respons = dapatkanResponsTopik(topik, jenisB);
      if (respons) {
        sesi.topikTunggu = null; sesi.jenisB_Tunggu = null;
        return { teks: respons, sesi };
      }
    }

    // ── Niat tanpa topik ──
    if (niat === 'minta_penerangan' || niat === 'minta_contoh' || niat === 'minta_latihan' || niat === 'minta_pembetulan') {
      sesi.bilanganGagal = 0;
      sesi.topikTunggu = 'tanya_topik';
      return { teks: RESPONS.tanya_topik(), sesi };
    }

    // ── Gagal faham ──
    sesi.bilanganGagal = (sesi.bilanganGagal || 0) + 1;
    if (sesi.bilanganGagal >= 2) {
      sesi.bilanganGagal = 0;
      return { teks: RESPONS.eskalasi(), sesi };
    }
    return { teks: RESPONS.gagal_faham(), sesi };
  }

  // ─── API AWAM ─────────────────────────────────────────────────────────────

  return {
    buatSesi,
    prosesMessej,
    PAUTAN_GURU,
    NAMA_TOPIK,
    // Alias untuk keserasian dengan kod lama
    createSession: buatSesi,
    processMessage: (teks, sesi) => {
      const r = prosesMessej(teks, sesi);
      return { text: r.teks, session: r.sesi };
    },
  };

}));
