// ============================================================================
// RING OF FIRE v3.0 — Tunable numbers
// ONE difficulty. There is no easy/normal/hard mode any more: the whole game is
// calibrated for ages 15–22. Every adjustable number lives here so the balance
// can be retuned without touching the engine.
// Source: docs/00-MASTER-SPEC-v3.md §3, §7
// ============================================================================

export const gameConfig = {
  minPlayers: 3,
  maxPlayers: 6,

  // — Single difficulty (spec §3) —
  /** 18 villagers, 3 per sector, never on a Ready Post or Sea Lane tile. */
  totalVillagers: 18,
  /** Reach the Ready Posts with 12 of them to win. */
  targetEvacuation: 15,
  /** Panic Meter hits 6 and the table loses. */
  panicMeterMax: 6,
  /** The Disaster deck is the game clock: 14 cards = 14 rounds. */
  disasterDeckSize: 12,

  // — Turn economy (Phase 3) —
  baseAP: 4,
  startingHandSize: 4,
  handLimit: 4,
  /** Japanese Macaque "Walking Archive" — hand limit 6. */
  handLimitScholar: 6,
  /** Ending your turn on a Ready Post grants this much AP next round. */
  readyPostApBonus: 1,

  // — Action costs —
  calmCost: 2,
  /** Under the disaster round effect `calm_cost_up`. */
  calmCostStorm: 3,
  moveCost: 1,
  /** Entering a Cracked tile. Destroyed tiles cannot be entered at all. */
  moveCostCracked: 2,
  /** Entering a Sea Lane tile. */
  seaLaneCost: 2,
  /** Whale Shark "Open Water" — the engine applies this discount. */
  seaLaneCostNavigator: 1,
  escortCost: 1,
  investigateCost: 1,
  barterCost: 1,
  playEvidenceCost: 0,
  discardForResourceCost: 0,
  activeAbilityCost: 0,

  // — Sea Lane limits —
  /** Villagers you may carry across the Sea Lane in one crossing. */
  seaLaneMaxVillagers: 1,

  // — Decks —
  /** Copies of each unique Evidence card (25 unique x 2 = 50). */
  evidenceCopies: 2,

  // — Score & rewards —
  reputationPerVerification: 1,
  reputationPerSubMission: 2,
  reputationTrackMax: 15,

  // — Pacing —
  discussionTimerSeconds: 60,

  defaultScenarioId: "ring_of_fire",
} as const;

export type GameConfig = typeof gameConfig;
