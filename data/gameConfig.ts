// ============================================================================
// RING OF FIRE v2.0 — Konfigurasi angka
// Setiap angka yang bisa disetel tinggal di sini: rebalance tanpa menyentuh engine.
// Sumber: docs/00-MASTER-SPEC-v2.md §6, §7
// ============================================================================

export type DifficultyId = "siaga" | "awas" | "darurat";

export interface DifficultyPreset {
  id: DifficultyId;
  name: string;
  blurb: string;
  targetEvacuation: number;
  panicMeterMax: number;
  disasterDeckSize: number;
}

/** Preset level kesulitan (MASTER-SPEC §7). */
export const difficulties: Record<DifficultyId, DifficultyPreset> = {
  siaga: {
    id: "siaga",
    name: "Siaga",
    blurb: "Mudah — ruang bernapas untuk belajar alur verifikasi.",
    targetEvacuation: 8,
    panicMeterMax: 10,
    disasterDeckSize: 18,
  },
  awas: {
    id: "awas",
    name: "Awas",
    blurb: "Normal — angka kanonik papan permainan.",
    targetEvacuation: 10,
    panicMeterMax: 8,
    disasterDeckSize: 16,
  },
  darurat: {
    id: "darurat",
    name: "Darurat",
    blurb: "Sulit — satu tebakan beruntung saja bisa menenggelamkan tim.",
    targetEvacuation: 12,
    panicMeterMax: 6,
    disasterDeckSize: 14,
  },
};

export const gameConfig = {
  minPlayers: 2,
  maxPlayers: 5,

  // — Ekonomi giliran (Fase 3) —
  baseAP: 4,
  startingHandSize: 4,
  handLimit: 4,
  /** Orangutan "Arsip Berjalan" — batas tangan 6. */
  handLimitScholar: 6,

  // — Biaya aksi —
  calmCost: 2,
  /** Di bawah efek bencana `calm_cost_up`. */
  calmCostStorm: 3,
  moveCost: 1,
  /** Masuk ubin berstatus Retak. */
  moveCostRetak: 2,
  seaRouteCost: 2,
  escortCost: 1,
  investigateCost: 1,
  barterCost: 1,
  playEvidenceCost: 0,
  discardForResourceCost: 0,
  activeAbilityCost: 0,

  // — Batas Rute Laut —
  seaRouteMaxVillagers: 1,

  // — Dek —
  /** Salinan tiap kartu Evidence unik (25 unik x 2 = 50). */
  evidenceCopies: 2,

  // — Skor & hadiah —
  reputationPerVerification: 1,
  reputationPerSubMission: 2,
  reputationTrackMax: 15,

  // — Pacing —
  discussionTimerSeconds: 60,

  defaultScenarioId: "cincin_api",
  defaultDifficulty: "awas" as DifficultyId,

  difficulties,
} as const;

export type GameConfig = typeof gameConfig;
