// ============================================================================
// RING OF FIRE v2.0 — Skenario papan "THE RING"
// 28 ubin, cincin tertutup. 4 sektor x 6 ubin + 4 Pos Siaga di tiap simpul.
// Adjacency rim: (i-1+28)%28 dan (i+1)%28. Rute Laut menambah 4 sisi tambahan.
// Sumber: docs/00-MASTER-SPEC-v2.md §2, §8
// ============================================================================

import type { Scenario, Sector } from "@/engine/types";

const RING_SIZE = 28;

/** Ubin Pos Siaga: simpul antar-sektor, kebal bencana, tujuan evakuasi. */
const POS_SIAGA_INDICES = [0, 7, 14, 21];

/** Tiap Rute Laut menghubungkan dua Pos Siaga bersebelahan, membusur di sisi dalam cincin. */
const SEA_ROUTES: [number, number][] = [
  [0, 7],
  [7, 14],
  [14, 21],
  [21, 0],
];

const sectors: Sector[] = [
  {
    id: "merah",
    name: "Busur Vulkanik",
    region: "Jawa, Sumatra, Selat Sunda",
    hoaxTheme:
      "Vulkanisme berlebihan — letusan dilebih-lebihkan sampai terdengar seperti kiamat, misalnya \"Semeru meletus bisa membelah Pulau Jawa\".",
    tileIndices: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "teal",
    name: "Busur Salju & Tsunami",
    region: "Jepang (Fuji), Kamchatka, Kepulauan Kuril",
    hoaxTheme:
      "Tsunami — video buatan AI \"gelombang 25 meter\" dan peringatan dini palsu yang meniru lembaga resmi.",
    tileIndices: [8, 9, 10, 11, 12, 13],
  },
  {
    id: "kuning",
    name: "Busur Pegunungan & Gurun",
    region: "Rockies, Andes, Atacama, Mojave",
    hoaxTheme:
      "Megathrust sepanjang Rockies & Andes — ramalan tanggal pasti, teori konspirasi cuaca, dan foto retakan jalan yang dipalsukan.",
    tileIndices: [15, 16, 17, 18, 19, 20],
  },
  {
    id: "biru",
    name: "Busur Kepulauan Vulkanik",
    region: "Filipina, Tonga, Pasifik Selatan",
    hoaxTheme:
      "Gunung api bawah laut — video AI \"daratan baru muncul\", mitos Atlantis bangkit, dan hoaks pulau hilang semalam.",
    tileIndices: [22, 23, 24, 25, 26, 27],
  },
];

/** typeId per indeks cincin (0..27). */
const layout: string[] = [
  // 0 — simpul barat: Selat Sunda
  "pos_siaga",
  // 1..6 — MERAH (Jawa, Sumatra, Selat Sunda)
  "pesisir",
  "zona_patahan",
  "lereng_gunung",
  "kota",
  "dataran_tinggi",
  "hutan_lereng",
  // 7 — simpul utara: Sangihe
  "pos_siaga",
  // 8..13 — TEAL (Jepang, Kamchatka, Kuril)
  "pesisir",
  "lereng_gunung",
  "kota",
  "zona_patahan",
  "dataran_tinggi",
  "hutan_lereng",
  // 14 — simpul timur laut: Aleutian
  "pos_siaga",
  // 15..20 — KUNING (Rockies, Andes, Atacama)
  "zona_patahan",
  "kota",
  "lereng_gunung",
  "dataran_tinggi",
  "hutan_lereng",
  "pesisir",
  // 21 — simpul selatan: Rapa Nui
  "pos_siaga",
  // 22..27 — BIRU (Filipina, Tonga, Pasifik Selatan)
  "pesisir",
  "lereng_gunung",
  "kota",
  "zona_patahan",
  "hutan_lereng",
  "dataran_tinggi",
];

/** Label wilayah nyata per ubin — semuanya titik sungguhan di Ring of Fire. */
const regionNames: string[] = [
  // 0
  "Pos Siaga Anyer, Selat Sunda",
  // MERAH
  "Anak Krakatau, Selat Sunda",
  "Sesar Lembang, Bandung",
  "Lereng Merapi, Yogyakarta",
  "Kota Padang, Sumatra Barat",
  "Kaldera Toba, Sumatra Utara",
  "Hutan Semeru, Jawa Timur",
  // 7
  "Pos Siaga Sangihe, Sulawesi Utara",
  // TEAL
  "Pesisir Sanriku, Tohoku",
  "Lereng Gunung Fuji, Honshu",
  "Kota Sendai, Miyagi",
  "Kepulauan Kuril, Iturup",
  "Dataran Tinggi Kamchatka",
  "Hutan Shiretoko, Hokkaido",
  // 14
  "Pos Siaga Unalaska, Kepulauan Aleutian",
  // KUNING
  "Sesar San Andreas, California",
  "Kota Seattle, Cascadia",
  "Lereng Gunung Rainier, Washington",
  "Gurun Atacama, Chile Utara",
  "Hutan Awan Andes, Peru",
  "Pesisir Valparaíso, Chile",
  // 21
  "Pos Siaga Rapa Nui, Pasifik Selatan",
  // BIRU
  "Pesisir Legazpi, Luzon",
  "Lereng Gunung Mayon, Albay",
  "Kota Manila, Luzon",
  "Palung Tonga, Nuku'alofa",
  "Kepulauan Vanuatu, Ambrym",
  "Dataran Tinggi Bougainville",
];

/**
 * 16 Token Warga, 4 per sektor, sisi Tenang.
 * Tidak pernah di Pos Siaga (0, 7, 14, 21) — itu tujuan evakuasi, bukan titik awal.
 */
const villagerSetup: number[] = (() => {
  const setup = new Array<number>(RING_SIZE).fill(0);
  const occupied = [
    1, 2, 4, 6, // merah
    8, 10, 11, 13, // teal
    15, 16, 18, 20, // kuning
    22, 24, 25, 27, // biru
  ];
  for (const i of occupied) setup[i] = 1;
  return setup;
})();

export const cincinApiScenario: Scenario = {
  id: "cincin_api",
  name: "Cincin Api",
  ringSize: RING_SIZE,
  layout,
  regionNames,
  sectors,
  posSiagaIndices: POS_SIAGA_INDICES,
  seaRoutes: SEA_ROUTES,
  villagerSetup,
  totalVillagers: 16,
  targetEvacuation: 10,
  disasterDeckSize: 16,
};

export const scenarios: Scenario[] = [cincinApiScenario];

export const scenarioById: Record<string, Scenario> = Object.fromEntries(
  scenarios.map((s) => [s.id, s])
);

/** Sektor yang memuat sebuah indeks ubin, atau null jika itu Pos Siaga. */
export function sectorForTileIndex(
  scenario: Scenario,
  index: number
): Sector | null {
  return scenario.sectors.find((s) => s.tileIndices.includes(index)) ?? null;
}
