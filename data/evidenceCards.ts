// ============================================================================
// RING OF FIRE v2.0 — Kartu Evidence (25 unik x 2 salinan = dek 50)
// 6 kategori 5W1H: WHAT, WHERE, WHEN, WHO, WHY, HOW.
//
// DWIFUNGSI — jantung permainan:
//   ZONA ATAS  (milEffect)      : buka 1 gembok kategorinya di Kartu Berita.
//   ZONA BAWAH (resourceEffect) : buang kartunya untuk keuntungan taktis.
// Satu kartu, satu pilihan. Membuktikan kebenaran ATAU menyelamatkan nyawa
// lebih cepat — tidak bisa dua-duanya.
//
// Kartu 2 poin punya bonus tambahan. Hanya SATU kartu wildcard di seluruh dek:
// "Konfirmasi Otoritas (BMKG)", HOW 3 poin, membuka gembok kategori apa pun.
// Sumber: docs/00-MASTER-SPEC-v2.md §5.2
// ============================================================================

import type { EvidenceCard, EvidenceCategory } from "@/engine/types";
import { gameConfig } from "./gameConfig";

export const evidenceCards: EvidenceCard[] = [
  // ——————————————————————————————————————————————————————————————————
  // WHAT 🔍 — Apa yang aneh pada kontennya sendiri?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_what_01",
    category: "WHAT",
    title: "Detektif Foto",
    points: 1,
    description:
      "Perhatikan tepi gelombang di foto itu — pikselnya melembek seperti cat basah, sementara kapal di sebelahnya tajam. Dua bagian ini tidak berasal dari satu kamera.",
    milEffect: "Membuka 1 gembok [WHAT] pada Kartu Berita aktif.",
    resourceName: "Sprint Darurat",
    resourceEffect: "Buang kartu ini untuk langsung mendapatkan +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_what_02",
    category: "WHAT",
    title: "Analisis Bayangan & Pantulan",
    points: 2,
    description:
      "Bayangan tiang listrik jatuh ke kiri, bayangan orangnya ke kanan. Dalam satu foto hanya ada satu matahari — jadi salah satunya ditempelkan.",
    milEffect:
      "Membuka 1 gembok [WHAT]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Jalur Alternatif",
    resourceEffect:
      "Buang kartu ini untuk melintasi 1 ubin terdampak bencana tanpa penalti AP.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_what_03",
    category: "WHAT",
    title: "Deteksi Artefak AI",
    points: 2,
    description:
      "Zoom ke latar: tulisan di papan toko berubah jadi huruf yang tidak ada di bahasa mana pun, dan satu orang punya enam jari. Mesin penghasil gambar selalu tergelincir di detail kecil.",
    milEffect:
      "Membuka 1 gembok [WHAT]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
    bonus: "refund_ap",
  },
  {
    id: "evd_what_04",
    category: "WHAT",
    title: "Bandingkan Frame demi Frame",
    points: 1,
    description:
      "Jeda videonya. Antara dua frame, gelombang raksasa itu melompat posisi tanpa alasan — ini potongan dua klip berbeda yang disambung.",
    milEffect: "Membuka 1 gembok [WHAT] pada Kartu Berita aktif.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
  },
  {
    id: "evd_what_05",
    category: "WHAT",
    title: "Zoom Piksel",
    points: 1,
    description:
      "Perbesar sampai maksimal. Di sekeliling objek utama ada kotak-kotak buram khas gambar yang berkali-kali disimpan ulang — tanda unggahan daur ulang, bukan rekaman asli.",
    milEffect: "Membuka 1 gembok [WHAT] pada Kartu Berita aktif.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHERE 📍 — Di mana sebenarnya ini terjadi?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_where_01",
    category: "WHERE",
    title: "Pencarian Gambar Terbalik",
    points: 2,
    description:
      "Seret gambarnya ke mesin pencari gambar. Foto \"jalan runtuh di kota kita\" ini ternyata liputan bencana di negara tetangga beberapa tahun lalu.",
    milEffect:
      "Membuka 1 gembok [WHERE]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Jalur Alternatif",
    resourceEffect:
      "Buang kartu ini untuk melintasi 1 ubin terdampak bencana tanpa penalti AP.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_where_02",
    category: "WHERE",
    title: "Cek Geotag",
    points: 2,
    description:
      "Data lokasi yang menempel di berkas foto menunjuk titik 3.000 km dari sini. Seseorang hanya mengganti keterangannya supaya terdengar seperti kejadian lokal.",
    milEffect:
      "Membuka 1 gembok [WHERE]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },
  {
    id: "evd_where_03",
    category: "WHERE",
    title: "Uji Landmark Lokal",
    points: 1,
    description:
      "Gunung di latar belakang itu bentuknya salah dan arahnya terbalik dari sini. Siapa pun yang tinggal di sektor ini akan langsung tahu.",
    milEffect: "Membuka 1 gembok [WHERE] pada Kartu Berita aktif.",
    resourceName: "Sprint Darurat",
    resourceEffect: "Buang kartu ini untuk langsung mendapatkan +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_where_04",
    category: "WHERE",
    title: "Cocokkan dengan Peta Resmi",
    points: 1,
    description:
      "Pesannya menyebut jembatan di dekat pasar ambruk — padahal di peta wilayah ini tidak pernah ada jembatan di sana.",
    milEffect: "Membuka 1 gembok [WHERE] pada Kartu Berita aktif.",
    resourceName: "Jalur Alternatif",
    resourceEffect:
      "Buang kartu ini untuk melintasi 1 ubin terdampak bencana tanpa penalti AP.",
    resourceKind: "alt_route",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHEN 🕐 — Kapan aslinya ini terjadi?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_when_01",
    category: "WHEN",
    title: "Ekstraksi Metadata",
    points: 2,
    description:
      "Berkas fotonya menyimpan tanggal pemotretan di dalam dirinya sendiri: empat tahun lalu, musim yang berbeda, jauh sebelum krisis ini dimulai.",
    milEffect:
      "Membuka 1 gembok [WHEN]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Sprint Darurat",
    resourceEffect: "Buang kartu ini untuk langsung mendapatkan +2 AP.",
    resourceKind: "ap2",
    bonus: "refund_ap",
  },
  {
    id: "evd_when_02",
    category: "WHEN",
    title: "Arsip Berita Lama",
    points: 1,
    description:
      "Klip ini pernah tayang di televisi bertahun-tahun lalu. Di arsip berita, judulnya bencana yang sama sekali berbeda.",
    milEffect: "Membuka 1 gembok [WHEN] pada Kartu Berita aktif.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
  },
  {
    id: "evd_when_03",
    category: "WHEN",
    title: "Cek Cuaca Hari Itu",
    points: 1,
    description:
      "Katanya direkam pagi ini saat hujan deras. Catatan cuaca hari ini: cerah sepanjang pagi, dan bayangan di video menunjuk matahari sore.",
    milEffect: "Membuka 1 gembok [WHEN] pada Kartu Berita aktif.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_when_04",
    category: "WHEN",
    title: "Rekonstruksi Linimasa",
    points: 3,
    description:
      "Susun semuanya berurutan: catatan gempa resmi, jam pada rekaman CCTV, dan waktu unggahan pertama. Ketiganya harus cocok — kalau berita ini benar, urutannya rapi; kalau palsu, satu di antaranya pasti mendahului kejadiannya.",
    milEffect:
      "Membuka 1 gembok [WHEN] pada Kartu Berita aktif, sekuat apa pun klaimnya.",
    resourceName: "Ketahanan Mental",
    resourceEffect:
      "Buang kartu ini untuk mencegah Meter Kepanikan naik pada ronde ini.",
    resourceKind: "panic_shield",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHO 👤 — Siapa yang bilang, dan seberapa kredibel?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_who_01",
    category: "WHO",
    title: "Lacak Akun Penyebar",
    points: 2,
    description:
      "Akun yang menyebarkan info letusan ini dibuat kemarin sore, tanpa nama asli, dan memakai foto hewan sebagai profil. Sangat mencurigakan.",
    milEffect:
      "Membuka 1 gembok [WHO]. Bonus 2 poin: otomatis menenangkan 1 Warga Panik di ubin terdekat.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
    bonus: "calm_nearest",
  },
  {
    id: "evd_who_02",
    category: "WHO",
    title: "Cek Centang Biru",
    points: 1,
    description:
      "Akun \"lembaga resmi\" ini namanya berselisih satu huruf dari yang asli dan tidak punya unggahan lama sama sekali. Ini akun tiruan.",
    milEffect: "Membuka 1 gembok [WHO] pada Kartu Berita aktif.",
    resourceName: "Sprint Darurat",
    resourceEffect: "Buang kartu ini untuk langsung mendapatkan +2 AP.",
    resourceKind: "ap2",
  },
  {
    id: "evd_who_03",
    category: "WHO",
    title: "Deteksi Gerombolan Bot",
    points: 2,
    description:
      "Tiga ratus akun mengunggah kalimat yang sama persis dalam menit yang sama. Saksi sungguhan tidak pernah mengetik serempak — bot iya.",
    milEffect:
      "Membuka 1 gembok [WHO]. Bonus 2 poin: otomatis menenangkan 1 Warga Panik di ubin terdekat.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
    bonus: "calm_nearest",
  },
  {
    id: "evd_who_04",
    category: "WHO",
    title: "Hubungi Narasumber Asli",
    points: 3,
    description:
      "Kami menelepon orang yang namanya dicatut di berita itu. Jawabannya satu kalimat: \"Saya tidak pernah mengatakan itu.\" Kutipan dibuat untuk meminjam wibawanya.",
    milEffect:
      "Membuka 1 gembok [WHO] pada Kartu Berita aktif, bahkan jika sumbernya mengaku pejabat.",
    resourceName: "Ketahanan Mental",
    resourceEffect:
      "Buang kartu ini untuk mencegah Meter Kepanikan naik pada ronde ini.",
    resourceKind: "panic_shield",
  },

  // ——————————————————————————————————————————————————————————————————
  // WHY 🎭 — Kenapa ini disebarkan? Siapa untung?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_why_01",
    category: "WHY",
    title: "Waspada Phishing",
    points: 1,
    description:
      "Pesan berantai ini menyuruh mengeklik tautan asing demi bantuan pangan darurat. Hati-hati — ini jebakan untuk mencuri data pribadimu.",
    milEffect: "Membuka 1 gembok [WHY] pada Kartu Berita aktif.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
  },
  {
    id: "evd_why_02",
    category: "WHY",
    title: "Siapa yang Untung?",
    points: 2,
    description:
      "Ikuti aliran uangnya: tiap kali \"peringatan\" ini dibagikan, pemilik akun dapat pemasukan iklan. Ketakutanmu adalah model bisnisnya.",
    milEffect:
      "Membuka 1 gembok [WHY]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Sprint Darurat",
    resourceEffect: "Buang kartu ini untuk langsung mendapatkan +2 AP.",
    resourceKind: "ap2",
    bonus: "refund_ap",
  },
  {
    id: "evd_why_03",
    category: "WHY",
    title: "Cek Rekening Donasi",
    points: 2,
    description:
      "Donasi bencana yang sah mengalir ke lembaga terdaftar yang laporannya bisa dibuka siapa saja — bukan ke rekening pribadi satu orang asing.",
    milEffect:
      "Membuka 1 gembok [WHY]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },
  {
    id: "evd_why_04",
    category: "WHY",
    title: "Alarm Clickbait",
    points: 1,
    description:
      "HURUF BESAR SEMUA, enam ikon sirene, dan \"sebarkan sebelum dihapus!!\". Peringatan keselamatan sungguhan memberi informasi, bukan memburu klik.",
    milEffect: "Membuka 1 gembok [WHY] pada Kartu Berita aktif.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
  },

  // ——————————————————————————————————————————————————————————————————
  // HOW 🔬 — Bagaimana kata sains?
  // ——————————————————————————————————————————————————————————————————
  {
    id: "evd_how_01",
    category: "HOW",
    title: "Konfirmasi Otoritas (BMKG)",
    points: 3,
    description:
      "Menurut keterangan langsung dari lembaga pemantau resmi, tidak ada aktivitas seismik maupun vulkanik yang cocok dengan klaim itu hari ini. Data mentahnya terbuka dan bisa dicek siapa pun.",
    milEffect:
      "WILDCARD! Bisa dipakai membuka gembok [HOW], ATAU gembok kategori apa pun yang dibutuhkan meja.",
    resourceName: "Ketahanan Mental",
    resourceEffect:
      "Buang kartu ini untuk mencegah Meter Kepanikan naik pada ronde ini, bahkan jika tim gagal memecahkan hoaks.",
    resourceKind: "panic_shield",
    isWildcard: true,
  },
  {
    id: "evd_how_02",
    category: "HOW",
    title: "Catatan Seismograf",
    points: 2,
    description:
      "Jarum stasiun pemantau tidak bisa berbohong: nol getaran tercatat dalam 24 jam terakhir. Cerita \"tanah bergetar terus\" itu fiksi.",
    milEffect:
      "Membuka 1 gembok [HOW]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Jalur Alternatif",
    resourceEffect:
      "Buang kartu ini untuk melintasi 1 ubin terdampak bencana tanpa penalti AP.",
    resourceKind: "alt_route",
    bonus: "refund_ap",
  },
  {
    id: "evd_how_03",
    category: "HOW",
    title: "Daftar Periksa Tanda Tsunami",
    points: 1,
    description:
      "Tanda alam yang sungguhan cuma tiga: guncangan kuat dan lama, air laut surut mendadak, dan suara gemuruh dari laut. Cocokkan beritanya dengan daftar ini.",
    milEffect: "Membuka 1 gembok [HOW] pada Kartu Berita aktif.",
    resourceName: "Pengeras Suara",
    resourceEffect:
      "Buang kartu ini untuk mengubah 1 Warga Panik menjadi Tenang secara gratis (0 AP).",
    resourceKind: "calm_free",
  },
  {
    id: "evd_how_04",
    category: "HOW",
    title: "Buletin Pos Pengamatan Gunung Api",
    points: 2,
    description:
      "Buletin hari ini: semburan gas di punggungan memang bisa berpendar samar pada malam hari — wajar, terpantau, dan tidak melibatkan makhluk halus apa pun.",
    milEffect:
      "Membuka 1 gembok [HOW]. Bonus 2 poin: pemain yang memainkannya mendapat 1 AP kembali.",
    resourceName: "Bantuan Logistik",
    resourceEffect:
      "Buang kartu ini untuk menukar 1 kartu di tanganmu dengan 1 kartu pemain lain, tanpa biaya AP.",
    resourceKind: "trade",
    bonus: "refund_ap",
  },
];

export const evidenceCardById: Record<string, EvidenceCard> = Object.fromEntries(
  evidenceCards.map((c) => [c.id, c])
);

export const evidenceCardsByCategory: Record<EvidenceCategory, EvidenceCard[]> = {
  WHAT: evidenceCards.filter((c) => c.category === "WHAT"),
  WHERE: evidenceCards.filter((c) => c.category === "WHERE"),
  WHEN: evidenceCards.filter((c) => c.category === "WHEN"),
  WHO: evidenceCards.filter((c) => c.category === "WHO"),
  WHY: evidenceCards.filter((c) => c.category === "WHY"),
  HOW: evidenceCards.filter((c) => c.category === "HOW"),
};

/** Satu-satunya kartu wildcard di seluruh dek. */
export const wildcardEvidenceId = "evd_how_01";

/** Dek Evidence = tiap kartu unik x gameConfig.evidenceCopies (25 x 2 = 50). */
export function buildEvidenceDeck(): string[] {
  const ids: string[] = [];
  for (const c of evidenceCards) {
    for (let i = 0; i < gameConfig.evidenceCopies; i++) ids.push(c.id);
  }
  return ids;
}
