// ============================================================================
// RING OF FIRE v2.0 — Seluruh teks antarmuka (Bahasa Indonesia)
// Sumber nada & istilah: docs/00-MASTER-SPEC-v2.md §9
//
// ATURAN: tidak boleh ada teks UI yang ditulis langsung di JSX. Semua lewat sini.
// Isi kartu, peran, dan ubin TIDAK di sini — itu milik data/.
// ============================================================================

export const id = {
  appName: "Ring of Fire",
  appNameLong: "Ring of Fire Board Game",
  tagline: "Satwa Penjaga di sepanjang Cincin Api Pasifik",

  meta: {
    title: "Ring of Fire — Satwa Penjaga Cincin Api",
    description:
      "Board game kooperatif tentang mitigasi bencana dan literasi media. Saring hoaks, tekan kepanikan, dan bimbing warga ke Pos Siaga — bersama-sama.",
  },

  common: {
    back: "Kembali",
    close: "Tutup",
    cancel: "Batal",
    continue: "Lanjut",
    confirm: "Ya, lanjutkan",
    next: "Berikutnya",
    of: "dari",
    none: "—",
    home: "Beranda",
    ap: "AP",
    points: "poin",
    round: "Ronde",
    optional: "opsional",
  },

  home: {
    blurb:
      "Alam Cincin Api sedang mengamuk. Tapi yang bergerak lebih cepat dari lava adalah hoaks. Sebagai Satwa Penjaga, saring kabar yang masuk — mana fakta, mana hoaks — lalu bimbing warga ke Pos Siaga sebelum bencana besar tiba.",
    playNow: "Mulai Misi",
    continueGame: "Lanjutkan Permainan",
    howToPlay: "Cara Bermain",
    passAndPlay: "Satu perangkat · bergantian · 2–5 Satwa Penjaga",
    demoNote:
      "Ini demo digital. Papan permainan fisiknya yang jadi produk utama.",
    pillars: [
      {
        title: "Literasi itu mekaniknya",
        body: "Bukan tebak benar-salah. Kalian harus membuka gembok 5W1H dulu.",
      },
      {
        title: "Satu kartu, satu pilihan",
        body: "Kartu Evidence bisa membuktikan kebenaran ATAU menyelamatkan nyawa. Tidak bisa dua-duanya.",
      },
      {
        title: "Menang atau kalah bersama",
        body: "Kooperatif penuh. Tidak ada pemenang tunggal di Cincin Api.",
      },
    ],
  },

  setup: {
    title: "Susun Regu Satwa Penjaga",
    scenario: "Skenario",
    difficulty: "Level Kesulitan",
    playerCount: "Berapa pemain?",
    playerName: "Pemain",
    namePlaceholder: "Nama Satwa Penjaga",
    pickRole: "Pilih peran",
    start: "Mulai Fase 1",
    roleTaken: "Sudah diambil",
    needRoles: "Setiap pemain harus punya peran sebelum misi dimulai.",
    difficultyStats: {
      target: "Target evakuasi",
      panic: "Batas panik",
      deck: "Dek bencana",
      villagers: "warga",
      cards: "kartu",
    },
    rolePassive: "Pasif",
    roleActive: "Aktif (0 AP, 1×/ronde)",
    roleSubMission: "Sub-Misi",
    rolePlaystyle: "Gaya bermain",
  },

  phases: {
    p1_disaster: {
      num: "1",
      name: "Murka Cincin Api",
      short: "Bencana",
      hint: "Buka 1 Kartu Bencana. Dampaknya berlaku sepanjang ronde ini.",
    },
    p2_news: {
      num: "2",
      name: "Kabar Mengudara",
      short: "Berita",
      hint: "Buka 1 Kartu Berita. Warga di ubin target langsung panik.",
    },
    p3_turns: {
      num: "3",
      name: "Giliran Pemain",
      short: "Giliran",
      hint: "Tiap pemain punya 4 AP. Bergerak, menenangkan, mengawal, menyelidiki.",
    },
    p4_verdict: {
      num: "4",
      name: "Sidang Fakta",
      short: "Sidang",
      hint: "Buka kedua gembok, ucapkan vonis, lalu balik kartunya.",
    },
    p5_impact: {
      num: "5",
      name: "Dampak & Eskalasi",
      short: "Dampak",
      hint: "Kerusakan ubin, belanja Reputasi, lalu ronde berikutnya.",
    },
  },

  hud: {
    panicMeter: "Meter Kepanikan",
    panicHint: "Kalau penuh, warga berhenti percaya pada kalian.",
    reputation: "Poin Reputasi",
    reputationHint: "Dipakai untuk membeli Kartu Reward di Fase 5.",
    disasterDeck: "Dek Bencana",
    disasterDeckHint: "Dek ini adalah jam permainan.",
    cardsLeft: "kartu tersisa",
    round: "Ronde",
    evacuated: "Selamat",
    target: "target",
    ap: "AP",
    apFull: "Action Point",
    firstPlayer: "Pemain pertama",
    onDuty: "Giliranmu",
    waiting: "Menunggu",
    seaRouteOpen: "Rute Laut terbuka",
    seaRouteClosed: "Rute Laut TERTUTUP ronde ini",
    activeChaos: "Chaos aktif",
    ownedRewards: "Reward dimiliki",
  },

  board: {
    title: "Cincin Api",
    posSiaga: "Pos Siaga",
    posSiagaHint: "Zona aman + Bonus Stage. Warga yang sampai sini dinyatakan Selamat.",
    crisisZone: "Zona Krisis",
    crisisZoneEmpty: "Belum ada kartu aktif di tengah cincin.",
    seaRoute: "Rute Laut",
    seaRouteHint: "2 AP, maksimal 1 warga. Tertutup saat bencana Oseanografi.",
    crisis: "Krisis",
    crisisToken: "Token Krisis",
    calm: "Tenang",
    panicked: "Panik",
    evacuationLocked: "Evakuasi terkunci",
    you: "Kamu",
    villagers: "warga",
    damage: {
      0: "Normal",
      1: "Retak",
      2: "Hancur",
    },
    damageHint: {
      1: "Masuk ke ubin ini +1 AP.",
      2: "Tidak bisa dilewati. Warga di atasnya hilang.",
    },
    legend: "Keterangan",
    clockwise: "Warga berevakuasi searah jarum jam",
    tapTile: "Ketuk ubin untuk melihat isinya",
    tileEmpty: "Ubin kosong.",
    moveTarget: "Bisa dituju",
    selected: "Dipilih",
    sectorShort: {
      merah: "Merah",
      teal: "Teal",
      kuning: "Kuning",
      biru: "Biru",
    },
    /** Isyarat non-warna per sektor (aksesibilitas). */
    sectorCue: {
      merah: "Gunung api",
      teal: "Gelombang",
      kuning: "Pegunungan",
      biru: "Kepulauan",
    },
  },

  news: {
    incoming: "Kabar Mengudara",
    postedBy: "Diteruskan dari grup sebelah",
    attached: "Konten terlampir",
    targetSector: "Sektor target",
    locks: "Gembok 5W1H — keduanya wajib terbuka",
    lockOpen: "Terbuka",
    lockClosed: "Terkunci",
    lockOpenedBy: "Dibuka oleh",
    front: "Sisi depan",
    back: "Sisi belakang",
    statusHidden: "Fakta atau hoaks? Jangan menebak — buktikan.",
    truth: "Status asli",
    truthHoax: "HOAKS",
    truthFakta: "FAKTA",
    explanation: "Penjelasan ilmiah",
    redFlags: "Tanda bahaya yang seharusnya kalian lihat",
    ifIgnored: "Jika diabaikan",
    ifValidated: "Jika divalidasi",
    tapToFlip: "Kartu siap dibalik",
    category: {
      sosial_takhayul: "Sosial & Takhayul",
      manipulasi_visual: "Manipulasi Visual",
      motif_penipuan: "Motif Penipuan",
      pseudosains: "Pseudosains",
    },
  },

  /** NewsEffect di data/ berisi angka & bendera, bukan kalimat — ini terjemahannya. */
  newsEffect: {
    none: "Tidak ada efek tambahan.",
    panicTargetSector: "Warga di sektor target panik",
    calmTargetSector: "Warga di sektor target jadi tenang",
    lockEvacuationSector: "Evakuasi sektor target terkunci 1 ronde",
    apPenalty: "AP pemain pertama",
    apBonus: "AP tambahan",
    stepTowardPosSiaga: "Warga otomatis melangkah menuju Pos Siaga",
    removeCrisisToken: "Token Krisis dihapus",
    drawEvidence: "Tarik Kartu Evidence",
  },

  verdict: {
    title: "Sidang Fakta",
    step1: "1. Buka kedua gembok",
    step2: "2. Ucapkan vonis bersama",
    step3: "3. Balik kartunya",
    stepDone: "selesai",
    prompt: "Apa vonis tim?",
    locksIncomplete:
      "Gembok belum lengkap. Kalian tetap boleh memvonis — tapi kalau benar, itu cuma Tebakan Beruntung.",
    locksComplete: "Kedua gembok terbuka. Vonis kalian punya dasar.",
    hoax: "HOAKS",
    fakta: "FAKTA",
    abstain: "Abstain",
    hoaxHint: "Kami yakin ini kabar palsu.",
    faktaHint: "Kami yakin ini kabar benar.",
    abstainHint: "Bukti tidak cukup. Dihitung sebagai Hoaks Menyebar.",
    committed: "Vonis terkunci",
    committedNote: "Vonis tidak bisa diubah lagi.",
    flip: "BALIK KARTU BERITA",
    flipping: "Membalik…",
    confirmTitle: "Kunci vonis sekarang?",
    confirmBody:
      "Setelah token Verdict diletakkan, tim TIDAK boleh berubah pikiran. Pastikan semua orang sudah bicara.",
    confirmChoice: "Vonis yang akan dikunci",
    confirmYes: "Kunci vonis",
    confirmNo: "Diskusi dulu",
  },

  outcome: {
    terverifikasi: {
      label: "TERVERIFIKASI",
      headline: "Vonis benar, gembok lengkap.",
      body: "+1 Poin Reputasi. Token Krisis hilang. Efek \"Jika Divalidasi\" berlaku.",
    },
    tebakan_beruntung: {
      label: "TEBAKAN BERUNTUNG",
      headline: "Vonis benar, tapi gembok belum lengkap.",
      body: "Tidak ada Reputasi. Token Krisis tetap di papan.",
      lesson: "Benar karena menebak bukan literasi. Yang dinilai bukan jawabanmu, tapi caramu sampai ke sana.",
    },
    hoaks_menyebar: {
      label: "HOAKS MENYEBAR",
      headline: "Vonis salah, atau tim memilih abstain.",
      body: "+1 Meter Kepanikan. Tarik 1 Kartu Chaos. Efek \"Jika Diabaikan\" berlaku.",
    },
  },

  evidence: {
    hand: "Kartu Evidence",
    handLimit: "Batas tangan",
    empty: "Tangan kosong. Lakukan Investigasi untuk menarik kartu.",
    reveal: "Ketuk untuk membuka tanganmu (pastikan hanya kamu yang melihat!)",
    hide: "Tutup tangan",
    whoseHand: "Tangan siapa?",
    zonaAtas: "Zona Atas — Efek MIL",
    zonaBawah: "Zona Bawah — Sumber Daya",
    playToLock: "Pasang ke gembok",
    playToLockShort: "Pasang",
    discardFor: "Buang untuk",
    noMatch: "Tidak cocok dengan gembok berita ini",
    blockedRound: "Diblokir ronde ini",
    blockedChaos: "Diblokir Kartu Chaos",
    wildcard: "Wildcard — membuka gembok apa pun",
    pickLock: "Gembok mana yang mau dibuka?",
    barter: "Barter",
    barterTitle: "Barter Bukti",
    barterGive: "Berikan kartu ini",
    barterWith: "Barter dengan",
    barterTake: "Ambil kartu ini",
    barterConfirm: "Tukar",
    barterSameTileOnly: "Harus berada di ubin yang sama (kecuali Monyet).",
    category: {
      WHAT: "Apa yang aneh?",
      WHERE: "Di mana aslinya?",
      WHEN: "Kapan aslinya terjadi?",
      WHO: "Siapa yang bilang?",
      WHY: "Kenapa disebarkan?",
      HOW: "Bagaimana kata sains?",
    },
  },

  tableTalk: {
    title: "Table Talk Protocol",
    lead: "Kartu tetap di tangan. Mulutmu yang dibuka.",
    allowed: "Boleh",
    forbidden: "Tidak boleh",
    allowedItems: [
      "Menyebut kategori kartumu (\"aku punya WHO\")",
      "Menyebut nilai poinnya (\"nilainya 2\")",
      "Menjelaskan isinya pakai kalimatmu sendiri",
      "Berdebat, mengusulkan, menawar",
    ],
    forbiddenItems: [
      "Memperlihatkan wajah kartu",
      "Membaca teks kartu kata per kata",
      "Menyerahkan kartu untuk dibaca pemain lain",
      "Diam-diam menunjukkan ke satu pemain saja",
    ],
    why: "Karena tidak boleh baca verbatim, kalian terpaksa menerjemahkan konsep ke bahasa sendiri — dan itu persis bukti kalian paham.",
    compact: "Ceritakan bukti kalian pakai kalimat sendiri. Jangan tunjukkan kartunya.",
  },

  disaster: {
    active: "Bencana aktif",
    draw: "Buka Kartu Bencana",
    location: "Lokasi kejadian",
    roundEffect: "Dampak Kejadian (sepanjang ronde)",
    endEffect: "Konsekuensi Akhir",
    affectedSectors: "Sektor terdampak",
    allSectors: "Seluruh cincin",
    category: {
      tektonik: "Tektonik",
      vulkanik: "Vulkanik",
      oseanografi: "Oseanografi",
      atmosferik: "Atmosferik",
    },
  },

  chaos: {
    title: "Kartu Chaos",
    subtitle: "Kerugian tim yang berlaku sampai ditebus",
    empty: "Belum ada Kartu Chaos. Pertahankan.",
    drawn: "Kartu Chaos baru ditarik",
    count: "aktif",
  },

  reward: {
    title: "Belanja Reputasi",
    subtitle: "Tukar Poin Reputasi dengan peningkatan permanen untuk seluruh tim.",
    cost: "Rep",
    buy: "Beli",
    owned: "Dimiliki",
    tooExpensive: "Reputasi belum cukup",
    empty: "Semua Kartu Reward sudah dimiliki.",
    skip: "Lewati belanja",
  },

  role: {
    passive: "Pasif",
    active: "Aktif",
    activeCost: "0 AP · 1× per ronde",
    activeUsed: "Sudah dipakai ronde ini",
    use: "Gunakan",
    subMission: "Sub-Misi",
    subMissionReward: "+2 Reputasi tim kalau selesai",
    subMissionDone: "Selesai!",
    progress: "Progres",
    playstyle: "Gaya bermain",
  },

  actions: {
    title: "Aksi",
    move: "Bergerak ke sini",
    moveVia: "Lewat Rute Laut",
    calm: "Tenangkan warga",
    escort: "Kawal warga",
    escortPick: "Pilih warga yang mau dikawal",
    escortHint: "Sekarang ketuk ubin tujuan.",
    escortSelected: "warga dipilih",
    investigate: "Investigasi (tarik 1 Evidence)",
    endTurn: "Akhiri Giliran",
    endTurnDone: "Giliran sudah diakhiri",
    cards: "Kartu",
    notEnoughAp: "AP tidak cukup",
    drawDisaster: "Hadapi Cincin Api",
    drawNews: "Buka Kartu Berita",
    nextRound: "Mulai Ronde Berikutnya",
    toVerdict: "Lanjut ke Sidang Fakta",
    toImpact: "Lanjut ke Dampak",
    posSiagaBonus: "Bonus Stage Pos Siaga tersedia di akhir giliranmu.",
    seaRouteBlocked: "Rute Laut tertutup (bencana Oseanografi).",
    tileImpassable: "Ubin Hancur — tidak bisa dimasuki.",
  },

  peek: {
    title: "Intip rahasia",
    disaster: "Kartu Bencana berikutnya",
    news: "Kartu Berita berikutnya",
    hand: "Isi tangan pemain",
    close: "Sudah — rahasiakan!",
  },

  gameOver: {
    winTitle: "Cincin Api Mereda",
    loseTitle: "Misi Gagal",
    reasons: {
      menang:
        "Kalian mencapai target evakuasi sebelum dek Bencana habis. Warga selamat karena informasi yang terverifikasi — bukan keberuntungan.",
      panik:
        "Meter Kepanikan penuh. Warga tidak lagi percaya pada Satwa Penjaga, dan evakuasi jadi mustahil.",
      korban:
        "Terlalu banyak warga hilang. Target evakuasi sudah tidak mungkin tercapai.",
      waktu:
        "Kartu Bencana terakhir ditarik. Megathrust menyapu semua yang masih tertinggal.",
    },
    stats: {
      title: "Laporan Misi",
      rounds: "Ronde bertahan",
      evacuated: "Warga selamat",
      lost: "Warga hilang",
      terverifikasi: "Terverifikasi",
      tebakanBeruntung: "Tebakan beruntung",
      hoaksMenyebar: "Hoaks menyebar",
      hoaxDebunked: "Hoaks dibongkar",
      factsValidated: "Fakta divalidasi",
      subMissions: "Sub-Misi selesai",
      reputation: "Reputasi akhir",
    },
    literacyNote:
      "Perhatikan angka Tebakan Beruntung. Itu jumlah kali tim benar tanpa tahu kenapa — target perbaikan berikutnya.",
    playAgain: "Main Lagi",
    backHome: "Kembali ke Beranda",
  },

  log: {
    title: "Catatan Misi",
    show: "Buka",
    hide: "Tutup",
    empty: "Belum ada catatan.",
  },

  debug: {
    title: "Panel Playtest",
    setPanic: "Set panik",
    setReputation: "Set reputasi",
    setPhase: "Set fase",
    newsTop: "Berita teratas",
    disasterTop: "Bencana teratas",
    trimDeck: "Sisakan 1 kartu bencana",
  },

  timer: {
    label: "Jam pasir diskusi",
    timeUp: "Waktu habis — putuskan sekarang!",
  },

  howTo: {
    title: "Cara Bermain",
    subtitle: "Ring of Fire v2.0 — kooperatif, 3–5 pemain, 45–70 menit, usia 12+.",
    backHome: "Kembali ke Beranda",
    startNow: "Langsung Main",
    sections: {
      goal: {
        title: "Tujuan",
        body: "Evakuasi cukup banyak Token Warga ke Pos Siaga sebelum dek Kartu Bencana habis. Kalian menang atau kalah bersama — tidak ada pemenang tunggal.",
        bullets: [
          "Menang: warga selamat mencapai target sebelum dek Bencana habis.",
          "Kalah — Gagal Literasi: Meter Kepanikan mencapai batas.",
          "Kalah — Jatuh Korban: sisa warga di papan + yang selamat sudah di bawah target.",
          "Kalah — Kehabisan Waktu: Kartu Bencana terakhir ditarik, target belum tercapai.",
        ],
      },
      board: {
        title: "Papan: The Ring",
        body: "Papannya adalah Cincin Api itu sendiri — 28 ubin heksagon membentuk cincin tertutup mengelilingi Zona Krisis di tengah.",
        bullets: [
          "24 ubin sektor (4 sektor × 6 ubin) + 4 ubin Pos Siaga di tiap simpul.",
          "Ubin bersebelahan di rim: satu langkah ke kiri atau ke kanan sepanjang cincin.",
          "4 Rute Laut membusur di sisi dalam cincin, menghubungkan dua Pos Siaga bersebelahan. Melengkung mengitari Zona Krisis, bukan menembusnya.",
          "Pos Siaga kebal bencana dan merupakan tujuan evakuasi.",
          "Kerusakan 2 tahap: Normal → Retak (masuk +1 AP) → Hancur (tidak bisa dilewati, warga di atasnya hilang).",
        ],
      },
      loop: {
        title: "Alur Ronde — 5 Fase",
        body: "Setiap ronde berjalan dalam urutan yang tetap. Urutannya tidak boleh dibalik.",
      },
      turns: {
        title: "Fase 3 — Belanja 4 AP",
        body: "Tiap pemain punya 4 Action Point per ronde dan boleh mengulang aksi yang sama selama AP cukup.",
        costs: [
          { action: "Bergerak ke ubin bersebelahan", cost: "1 AP (2 AP kalau ubin tujuan Retak)" },
          { action: "Bergerak lewat Rute Laut", cost: "2 AP, maksimal bawa 1 warga" },
          { action: "Menenangkan warga (Panik → Tenang)", cost: "2 AP" },
          { action: "Mengawal / Evakuasi warga", cost: "1 AP" },
          { action: "Investigasi (tarik 1 Evidence)", cost: "1 AP" },
          { action: "Memasang Bukti ke gembok", cost: "0 AP" },
          { action: "Buang Evidence untuk Sumber Daya", cost: "0 AP" },
          { action: "Barter Bukti", cost: "1 AP" },
          { action: "Kemampuan Aktif peran", cost: "0 AP, 1× per ronde" },
        ],
      },
      commitFlip: {
        title: "Commit & Flip — jantung permainan",
        body: "Di meja tidak ada komputer yang tahu jawabannya. Jadi kartunya sendiri yang jadi komputernya. Tiga langkah, urutannya mutlak.",
        steps: [
          {
            title: "1. KUNCI (Commit)",
            body: "Buka kedua gembok 5W1H dengan Kartu Evidence yang cocok — kartu HOW 3 poin adalah wildcard yang bisa membuka gembok apa pun. Lalu ucapkan vonis bersama dan letakkan token Verdict: HOAKS, FAKTA, atau Abstain. Setelah diletakkan, tidak boleh berubah pikiran.",
          },
          {
            title: "2. BALIK (Flip)",
            body: "Siapa pun boleh membalik Kartu Berita. Sisi belakang memuat status asli, penjelasan ilmiah 2–3 kalimat, dan tanda bahaya yang seharusnya kalian kenali.",
          },
          {
            title: "3. DAMPAK (Resolve)",
            body: "Bandingkan vonis dengan jawaban. Ada tepat tiga hasil yang mungkin — dan dua di antaranya terasa mirip tapi sangat berbeda maknanya.",
          },
        ],
        note: "Umpan balik selalu datang, 100% dari waktu. Yang berbeda bukan ada atau tidaknya umpan balik, tapi konsekuensinya.",
      },
      evidence: {
        title: "Kartu Evidence — dwifungsi",
        body: "Setiap Kartu Evidence punya dua zona, dan kalian hanya boleh memakai salah satu.",
        bullets: [
          "Zona Atas — Efek MIL: membuka 1 gembok sesuai kategorinya.",
          "Zona Bawah — Sumber Daya: dibuang untuk keuntungan taktis (AP ekstra, jalur alternatif, menenangkan gratis, dan lain-lain).",
          "Kartu HOW 3 poin (Konfirmasi Otoritas BMKG) adalah wildcard: membuka gembok kategori apa pun.",
          "Inilah dilemanya: pakai untuk membuktikan kebenaran, atau buang untuk menyelamatkan nyawa lebih cepat. Tidak bisa dua-duanya.",
        ],
      },
      roles: {
        title: "Peran Satwa Penjaga",
        body: "Tiap peran punya Kemampuan Pasif yang selalu aktif, Kemampuan Aktif gratis sekali per ronde, dan Sub-Misi pribadi yang memberi +2 Reputasi untuk tim kalau selesai.",
      },
      economy: {
        title: "Reputasi, Chaos, dan Reward",
        bullets: [
          "Verifikasi yang benar dan lengkap memberi +1 Poin Reputasi. Sub-Misi selesai memberi +2.",
          "Gagal verifikasi menarik 1 Kartu Chaos — kerugian tim yang berlaku sampai ditebus.",
          "Di Fase 5 kalian boleh menukar Poin Reputasi dengan Kartu Reward: peningkatan permanen untuk seluruh tim.",
        ],
      },
      difficulty: {
        title: "Level Kesulitan",
        body: "Pilih saat setup. Semua angka ini masih angka playtest awal dan bisa disesuaikan setelah uji main.",
      },
      demo: {
        title: "Catatan tentang demo ini",
        body: "Prototipe web ini adalah demo pendukung, bukan produk akhir. Papan permainan fisik yang jadi deliverable utama — demo ini hanya menunjukkan bahwa mekaniknya bekerja.",
      },
    },
  },
} as const;

export type Strings = typeof id;
