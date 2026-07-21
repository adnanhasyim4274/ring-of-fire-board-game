// Every tunable default number lives here — rebalance without touching the engine.
export const gameConfig = {
  minPlayers: 2,
  maxPlayers: 5,
  baseAP: 3,
  startingHandSize: 4,
  evidencePerRound: 1, // cards each player draws at the start of a round
  evidenceCopies: 2, // copies of each unique evidence card in the deck
  panicMeterMax: 5,
  calmCost: 2,
  calmCostStorm: 3, // under "Extreme Storm!"
  moveCost: 1,
  escortCost: 1,
  discussionTimerSeconds: 60, // Phase 2 countdown (visual pacing aid)
  defaultScenarioId: "ring_of_fire",
} as const;
