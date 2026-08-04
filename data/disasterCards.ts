// ============================================================================
// RING OF FIRE v2.0 — Kartu Bencana (16 kartu, 4 kategori x 4)
// Dek ini sekaligus JAM PERMAINAN: habis = waktu habis.
// Dampak Kejadian berlaku sepanjang ronde; Konsekuensi Akhir merusak ubin di Fase 5.
// Kategori "oseanografi" aktif => seluruh Rute Laut TERTUTUP ronde itu.
// Sumber: docs/00-MASTER-SPEC-v2.md §5.3
// ============================================================================

import type { DisasterCard, DisasterCategory } from "@/engine/types";

export const disasterCards: DisasterCard[] = [
  // ——————————————————————————————————————————————————————————————————
  // TEKTONIK
  // ——————————————————————————————————————————————————————————————————
  {
    id: "dis_tek_01",
    category: "tektonik",
    title: "Gempa Megathrust",
    description:
      "Bidang kontak dua lempeng yang terkunci selama ratusan tahun lepas sekaligus. Guncangannya panjang, dalam, dan terasa sampai ratusan kilometer dari pusatnya.",
    locationLabel: "Zona subduksi sepanjang Busur Pegunungan & Gurun",
    roundEffect:
      "Tanah terus bergoyang: semua perpindahan memerlukan +1 AP ronde ini.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: ["kuning"],
    endEffect:
      "Ubin dengan warga terbanyak mengalami kerusakan struktural — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_tek_02",
    category: "tektonik",
    title: "Likuefaksi",
    description:
      "Guncangan mengubah tanah berpasir yang jenuh air menjadi seperti bubur. Bangunan tenggelam berdiri, jalan berubah jadi kubangan lumpur.",
    locationLabel: "Dataran endapan di Busur Vulkanik",
    roundEffect:
      "Tanah tidak sanggup menahan beban: tidak ada aksi Evakuasi yang boleh masuk atau keluar sektor terdampak.",
    roundEffectKey: "block_escort",
    affectedSectorIds: ["merah"],
    endEffect: "Satu ubin di sektor terdampak amblas — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_tek_03",
    category: "tektonik",
    title: "Rentetan Gempa Susulan",
    description:
      "Puluhan gempa kecil beruntun setelah guncangan utama. Tidak ada yang merobohkan sendirian, tapi tidak ada pula yang membiarkan orang tidur.",
    locationLabel: "Kepulauan Kuril hingga pesisir Tohoku",
    roundEffect:
      "Warga di sektor terdampak otomatis menjadi Panik pada awal ronde.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["teal"],
    endEffect: "Satu ubin di sektor terdampak retak lebih lebar — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_tek_04",
    category: "tektonik",
    title: "Longsor Tebing Batu",
    description:
      "Lereng curam yang sudah jenuh air kehilangan pegangan. Material batu dan tanah meluncur menutup satu-satunya jalan keluar lembah.",
    locationLabel: "Punggungan curam Busur Kepulauan Vulkanik",
    roundEffect:
      "Jalur darurat tertutup material: Kartu Evidence tidak boleh dibuang untuk keuntungan pergerakan ronde ini.",
    roundEffectKey: "no_evidence_move",
    affectedSectorIds: ["biru"],
    endEffect: "Satu ubin di sektor terdampak tertimbun — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },

  // ——————————————————————————————————————————————————————————————————
  // VULKANIK
  // ——————————————————————————————————————————————————————————————————
  {
    id: "dis_vul_01",
    category: "vulkanik",
    title: "Erupsi Eksplosif",
    description:
      "Sumbat magma jebol dan kolom letusan menembus belasan kilometer ke langit. Dentumannya terdengar jauh melampaui radius bahaya.",
    locationLabel: "Puncak gunung api aktif, Busur Vulkanik",
    roundEffect:
      "Kepanikan menjalar: warga di sektor terdampak otomatis menjadi Panik pada awal ronde.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["merah"],
    endEffect: "Satu ubin di sektor terdampak dihantam material — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_vul_02",
    category: "vulkanik",
    title: "Awan Panas Piroklastik",
    description:
      "Campuran gas dan abu bersuhu ratusan derajat meluncur menuruni lereng lebih cepat daripada kendaraan. Ini bahaya vulkanik yang paling mematikan.",
    locationLabel: "Alur lereng selatan, Busur Vulkanik",
    roundEffect:
      "Lereng tidak bisa dilewati rombongan: tidak ada aksi Evakuasi masuk maupun keluar sektor terdampak.",
    roundEffectKey: "block_escort",
    affectedSectorIds: ["merah"],
    endEffect: "Satu ubin di sektor terdampak hangus — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_vul_03",
    category: "vulkanik",
    title: "Hujan Abu Pekat",
    description:
      "Abu halus menutup langit sampai siang terasa seperti malam. Ia melumpuhkan mesin, menyumbat saluran napas, dan membuat atap runtuh oleh beratnya.",
    locationLabel: "Kawasan angin bawah, Busur Salju & Tsunami",
    roundEffect:
      "Jarak pandang nyaris nol: Kartu Evidence kategori [WHERE] tidak bisa dipakai ronde ini.",
    roundEffectKey: "block_where",
    affectedSectorIds: ["teal"],
    endEffect: "Satu ubin di sektor terdampak tertimbun abu — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_vul_04",
    category: "vulkanik",
    title: "Satwa Turun Gunung",
    description:
      "Monyet, ular, dan babi hutan meninggalkan lereng bersamaan. Tanah memanas dan gas keluar lebih deras — hewan pergi sebelum manusia sempat rapat.",
    locationLabel: "Lereng atas seluruh busur vulkanik",
    roundEffect:
      "Alam memberi peringatan lebih dulu: tim boleh mengintip 1 Kartu Bencana teratas ronde ini.",
    roundEffectKey: "peek_disaster",
    affectedSectorIds: [],
    endEffect: "Tidak ada kerusakan ubin. Gunakan waktu pinjaman ini dengan baik.",
    damageTarget: "none",
  },

  // ——————————————————————————————————————————————————————————————————
  // OSEANOGRAFI — Rute Laut tertutup total saat kartu ini aktif
  // ——————————————————————————————————————————————————————————————————
  {
    id: "dis_ose_01",
    category: "oseanografi",
    title: "Tsunami Jarak Jauh",
    description:
      "Gempa besar di seberang samudra melahirkan gelombang yang menyeberangi laut terbuka berjam-jam lamanya, lalu meninggi saat mencapai perairan dangkal.",
    locationLabel: "Seluruh pesisir cincin",
    roundEffect:
      "Semua pesisir siaga: keluar dari sektor mana pun memerlukan +1 AP, dan Rute Laut tertutup.",
    roundEffectKey: "coast_exit_penalty",
    affectedSectorIds: [],
    endEffect:
      "Ubin dengan warga terbanyak disapu gelombang — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "most_villagers",
  },
  {
    id: "dis_ose_02",
    category: "oseanografi",
    title: "Gelombang Pasang Cepat",
    description:
      "Pasang purnama bertemu gelombang badai. Air naik jauh melewati batas biasa dan bertahan berjam-jam sebelum surut.",
    locationLabel: "Pesisir rendah Busur Kepulauan Vulkanik",
    roundEffect:
      "Jalan pesisir terendam: keluar dari sektor terdampak memerlukan +1 AP, dan Rute Laut tertutup.",
    roundEffectKey: "coast_exit_penalty",
    affectedSectorIds: ["biru"],
    endEffect: "Satu ubin di sektor terdampak terendam — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_ose_03",
    category: "oseanografi",
    title: "Tsunami Lokal",
    description:
      "Pusat gempanya dekat, sehingga gelombang pertama tiba hanya beberapa menit setelah guncangan. Tidak ada waktu untuk menunggu pengumuman.",
    locationLabel: "Teluk sempit Busur Salju & Tsunami",
    roundEffect:
      "Warga di sektor terdampak otomatis menjadi Panik pada awal ronde. Rute Laut tertutup.",
    roundEffectKey: "panic_spread",
    affectedSectorIds: ["teal"],
    endEffect: "Satu ubin di sektor terdampak disapu air — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_ose_04",
    category: "oseanografi",
    title: "Abrasi Ekstrem",
    description:
      "Gelombang beruntun mengikis kaki tebing pantai sampai bibirnya runtuh. Garis pantai bergeser puluhan meter dalam semalam.",
    locationLabel: "Pesisir Valparaíso hingga selatan",
    roundEffect:
      "Jalan pantai rontok sebagian: semua perpindahan memerlukan +1 AP. Rute Laut tertutup.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: ["kuning"],
    endEffect: "Satu ubin di sektor terdampak longsor ke laut — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },

  // ——————————————————————————————————————————————————————————————————
  // ATMOSFERIK
  // ——————————————————————————————————————————————————————————————————
  {
    id: "dis_atm_01",
    category: "atmosferik",
    title: "Badai Tropis",
    description:
      "Angin kencang dan hujan tanpa jeda selama berjam-jam. Atap terbang, pohon tumbang, dan suara badai menelan setiap instruksi yang diteriakkan.",
    locationLabel: "Kepulauan Filipina hingga Pasifik Selatan",
    roundEffect:
      "Suara tenggelam oleh badai: biaya Menenangkan naik menjadi 3 AP ronde ini.",
    roundEffectKey: "calm_cost_up",
    affectedSectorIds: ["biru"],
    endEffect: "Satu ubin di sektor terdampak porak-poranda — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_atm_02",
    category: "atmosferik",
    title: "Blackout Jaringan",
    description:
      "Listrik dan menara telekomunikasi padam bersamaan. Justru saat informasi paling dibutuhkan, semua orang kembali ke desas-desus mulut ke mulut.",
    locationLabel: "Seluruh cincin",
    roundEffect:
      "Tidak ada sinyal untuk berkoordinasi: aksi Barter tidak bisa dilakukan ronde ini.",
    roundEffectKey: "block_trade",
    affectedSectorIds: [],
    endEffect: "Tidak ada kerusakan fisik ubin — kerusakannya ada pada arus informasi.",
    damageTarget: "none",
  },
  {
    id: "dis_atm_03",
    category: "atmosferik",
    title: "Cuaca Ekstrem",
    description:
      "Suhu anjlok, kabut tebal, dan hujan es turun bergantian dalam satu hari. Pengungsi di tempat terbuka kehabisan tenaga jauh lebih cepat.",
    locationLabel: "Dataran tinggi Kamchatka hingga Andes",
    roundEffect:
      "Semua orang kedinginan dan gelisah: biaya Menenangkan naik menjadi 3 AP ronde ini.",
    roundEffectKey: "calm_cost_up",
    affectedSectorIds: ["teal", "kuning"],
    endEffect: "Satu ubin di sektor terdampak rusak oleh cuaca — Retak, atau Hancur bila sudah Retak.",
    damageTarget: "affected_sector",
  },
  {
    id: "dis_atm_04",
    category: "atmosferik",
    title: "Kemacetan Evakuasi",
    description:
      "Semua orang bergerak ke arah yang sama pada menit yang sama. Jalur yang dirancang untuk menyelamatkan justru berubah menjadi perangkap tanpa gerak.",
    locationLabel: "Jalur keluar utama Busur Vulkanik",
    roundEffect:
      "Antrean mengular di setiap simpang: semua perpindahan memerlukan +1 AP ronde ini.",
    roundEffectKey: "move_penalty",
    affectedSectorIds: ["merah"],
    endEffect:
      "Tidak ada kerusakan ubin, tetapi waktu yang hilang tidak pernah kembali.",
    damageTarget: "none",
  },
];

export const disasterCardById: Record<string, DisasterCard> = Object.fromEntries(
  disasterCards.map((c) => [c.id, c])
);

export const disasterCardsByCategory: Record<DisasterCategory, DisasterCard[]> = {
  tektonik: disasterCards.filter((c) => c.category === "tektonik"),
  vulkanik: disasterCards.filter((c) => c.category === "vulkanik"),
  oseanografi: disasterCards.filter((c) => c.category === "oseanografi"),
  atmosferik: disasterCards.filter((c) => c.category === "atmosferik"),
};

/**
 * Dek Bencana sepanjang `size` kartu (18 / 16 / 14 sesuai level kesulitan).
 * Urutan kanonik dan deterministik — reducer yang mengocok dengan PRNG berbenih.
 * Bila size > jumlah kartu unik, daftar diulang dari awal.
 */
export function buildDisasterDeck(size: number): string[] {
  const ids: string[] = [];
  if (size <= 0 || disasterCards.length === 0) return ids;
  for (let i = 0; i < size; i++) {
    ids.push(disasterCards[i % disasterCards.length].id);
  }
  return ids;
}
