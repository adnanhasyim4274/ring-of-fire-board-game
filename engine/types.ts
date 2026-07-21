// Shared type contract for Ring of Fire Board Game — every chunk depends on this file.

export type EvidenceCategory = "WHAT" | "WHERE" | "WHY" | "WHO" | "HOW";

export type EventStatus = "hoax" | "pseudoscience" | "scam" | "superstition" | "fact";

export interface EventCard {
  id: string;
  title: string;
  body: string; // the forwarded message/news text
  attachedContent: string; // description of the attached image/video
  targetTileType: string; // tile type id affected (see data/tileTypes.ts)
  status: EventStatus;
  requiredLocks: EvidenceCategory[]; // OR — satisfying just one is enough
  effectIfIgnored: string;
  effectIfValidated?: string; // only for "fact" status
  // Machine-readable effect flags (the strings above are player-facing copy)
  ignored?: {
    panicTargetTile?: boolean; // occupants of the target tile become panicked
    apPenaltyFirstPlayer?: boolean; // the current first player loses 1 AP next phase
    permanentPanic?: boolean; // target tile gains the permanentPanic flag
  };
  validated?: {
    calmTargetTile?: boolean;
    moveTargetTowardSafe?: boolean; // villagers on target tile step toward the nearest safe zone
    calmTileType?: string; // calm occupants of every tile of this type
  };
}

export type ResourceKind = "ap2" | "alt_route" | "trade" | "calm_free" | "panic_shield";

export interface EvidenceCard {
  id: string;
  category: EvidenceCategory;
  title: string;
  points: number; // 1, 2, or 3 (wildcard)
  description: string;
  milEffect: string; // effect when used for verification (top)
  resourceEffectName: string; // name of the action when discarded for resources (bottom)
  resourceEffect: string; // description of the resource effect
  isWildcard?: boolean; // true only for the 3-point HOW card
  resourceKind: ResourceKind;
  bonus?: "refund_ap" | "calm_nearest"; // 2-point card bonuses
}

export type DisasterCategory = "water_coastal" | "volcanic" | "tectonic" | "social_infra";

export type RoundEffectKey =
  | "coast_exit_penalty" // +1 AP to leave a Coastal tile
  | "move_penalty" // +1 AP to move between tiles
  | "peek_disaster" // favorable: team may peek the next disaster card
  | "block_escort" // escort through/out of affected tile type blocked
  | "panic_spread_fault" // fault zone + adjacent villagers panic at round start
  | "block_where" // WHERE evidence cards can't verify this round
  | "block_trade" // the trade resource action is blocked
  | "calm_cost_up"; // calm costs 3 AP instead of 2

export interface DisasterCard {
  id: string;
  category: DisasterCategory;
  title: string;
  description: string;
  affectedTileType: string; // display name, or "All Locations"
  roundEffect: string; // effect that applies during the next round
  endEffect: string; // permanent impact at the end of the round
  roundEffectKey: RoundEffectKey;
  affectedTileTypeIds: string[]; // empty = all locations
  destroysTile: boolean; // end effect flips one affected tile to Destroyed
}

export type RoleAbilityType =
  | "peek_disaster"
  | "peek_event"
  | "cancel_panic"
  | "bonus_evidence"
  | "bonus_ap";

export interface Role {
  id: string;
  name: string; // "Eagle"
  nickname: string; // "The Scout"
  ability: string;
  abilityType: RoleAbilityType;
  illustration?: string;
}

export interface TileType {
  id: string;
  name: string;
  isSafeZone?: boolean;
  vulnerableTo: string[]; // disaster categories that can damage this tile type
}

export interface Scenario {
  id: string;
  name: string; // e.g. "The Pacific Ring of Fire"
  tileCount: number;
  cols: number;
  rows: number;
  layout: string[]; // tileType ids per grid position ("ocean" = impassable water)
  regionNames: (string | null)[]; // real-world region label per tile (null for ocean)
  villagerSetup: number[]; // villager count per grid position, length = tileCount
  targetEvacuation: number;
  totalVillagers: number;
  disasterDeckSize: number;
}

export type PlayerId = string;

export interface Player {
  id: PlayerId;
  name: string;
  roleId: string;
  ap: number;
  hand: string[]; // evidence card ids (duplicates allowed — the deck has copies)
  position: number; // tile index
  altRouteReady: boolean; // "Alternate Route" discard effect armed
}

export type VillagerStatus = "normal" | "panic" | "evacuated" | "lost";

export interface VillagerToken {
  id: string;
  status: VillagerStatus;
  tileIndex: number;
}

export interface TileState {
  index: number;
  typeId: string;
  status: "normal" | "destroyed";
  occupants: VillagerToken[];
  hasCrisisToken: boolean;
  permanentPanic: boolean;
}

export type GamePhase =
  | "setup"
  | "phase1_influx"
  | "phase2_verification"
  | "phase3_evacuation"
  | "phase4_escalation"
  | "game_over";

export type GameOverReason = "panic" | "casualties" | "timeout" | "win";

export interface GameLogEntry {
  round: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
}

export type EventOutcome = "pending" | "debunked" | "validated" | "ignored";

export interface GameStats {
  hoaxesDebunked: number;
  factsValidated: number;
  eventsIgnored: number;
}

export interface PeekInfo {
  kind: "event" | "disaster";
  cardId: string;
}

export interface GameState {
  phase: GamePhase;
  round: number;
  scenarioId: string;
  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  tiles: TileState[];
  panicMeter: number;
  panicMeterMax: number;
  activeEventCard: EventCard | null;
  activeEventTileIndex: number | null;
  activeEventLocksOpened: EvidenceCategory[];
  activeEventOutcome: EventOutcome;
  eventDeck: string[]; // remaining ids, shuffled
  eventDiscard: string[];
  evidenceDeck: string[];
  evidenceDiscard: string[];
  disasterDeck: string[]; // remaining ids — empty = timeout loss
  activeDisasterEffect: DisasterCard | null; // round effect currently in force
  incomingDisaster: DisasterCard | null; // drawn in Phase 4, becomes active next round
  evacuees: VillagerToken[];
  casualties: VillagerToken[];
  gameOverReason: GameOverReason | null;
  log: GameLogEntry[];
  stats: GameStats;
  // per-round bookkeeping
  pendingApBonus: Record<PlayerId, number>;
  monkeyPenalty: Record<PlayerId, boolean>;
  panicShield: boolean;
  abilityUsed: Record<PlayerId, boolean>;
  tigerEscortBonus: Record<PlayerId, boolean>;
  playersEndedTurn: PlayerId[];
  peek: PeekInfo | null;
  rngSeed: number;
}

export type GameAction =
  | { type: "START_GAME"; scenarioId: string; players: { name: string; roleId: string }[]; seed?: number }
  | { type: "DRAW_EVENT_CARD" }
  | { type: "USE_EVIDENCE_FOR_VERIFICATION"; playerId: PlayerId; evidenceId: string }
  | {
      type: "DISCARD_EVIDENCE_FOR_RESOURCE";
      playerId: PlayerId;
      evidenceId: string;
      tradeWithPlayerId?: PlayerId;
      tradeGiveCardId?: string;
      targetVillagerId?: string;
    }
  | { type: "RESOLVE_VERIFICATION" } // resolves as ignored if no lock has been opened
  | { type: "MOVE_PLAYER"; playerId: PlayerId; targetTileIndex: number }
  | { type: "CALM_VILLAGER"; playerId: PlayerId; villagerId: string }
  | { type: "ESCORT_VILLAGER"; playerId: PlayerId; villagerId: string; targetTileIndex: number }
  | { type: "END_PLAYER_TURN" }
  | { type: "DRAW_DISASTER_CARD" }
  | { type: "ADVANCE_PHASE" }
  | { type: "USE_ROLE_ABILITY"; playerId: PlayerId }
  | { type: "CLEAR_PEEK" }
  | { type: "RESET_GAME" }
  // Debug / playtest actions (hidden panel)
  | { type: "DEBUG_SET_PANIC"; value: number }
  | { type: "DEBUG_SET_PHASE"; phase: GamePhase }
  | { type: "DEBUG_SET_EVENT_TOP"; cardId: string }
  | { type: "DEBUG_SET_DISASTER_TOP"; cardId: string }
  | { type: "DEBUG_EMPTY_DISASTER_DECK" };
