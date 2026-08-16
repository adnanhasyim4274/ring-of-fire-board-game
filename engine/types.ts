// ============================================================================
// RING OF FIRE — Shared type contract v3.0
// Canonical rules: E:\archives\ringoffire\docs\00-MASTER-SPEC-v3.md
// Every chunk depends on this file. Do not change without updating the spec.
// ============================================================================

// ——— Board topology ————————————————————————————————————————————————
// The board IS a ring. Tiles are a closed loop of `ringSize` indices.
// Adjacency along the rim: (i-1+N)%N and (i+1)%N.
// Rim adjacency covers indices 0..23 only. The 3 Sea Lane tiles (24..26) form
// an explicit chain: Ready Post 0 <-> 24 <-> 25 <-> 26 <-> Ready Post 12.

export type SectorId =
  | "sunda"
  | "philippine"
  | "hokkaido"
  | "cascadia"
  | "andes"
  | "south_pacific";

export interface Sector {
  id: SectorId;
  name: string;          // "Sunda Arc"
  region: string;        // "Java, Sumatra, Sunda Strait"
  hoaxTheme: string;     // the hoax flavour this sector is known for
  tileIndices: number[]; // 3 land tiles per sector
}

export interface TileType {
  id: string;
  name: string;
  isReadyPost?: boolean;
  isSeaLane?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  /** Rim tiles ONLY (24). Sea Lane tiles sit outside the ring arithmetic. */
  ringSize: number;
  layout: string[];                    // tileType id per index, length 27
  regionNames: string[];               // real-world label per tile, length 27
  sectors: Sector[];                   // 6
  readyPostIndices: number[];          // [0, 4, 8, 12, 16, 20]
  seaLaneIndices: number[];            // [24, 25, 26]
  /** The two opposite Ready Posts the Sea Lane joins: [0, 12]. */
  seaLaneEndpoints: [number, number];
  villagerSetup: number[];             // villagers per index, length 27
  totalVillagers: number;              // 18
  targetEvacuation: number;            // 12
  disasterDeckSize: number;            // 14
}

// ——— Cards ——————————————————————————————————————————————————————————

export type EvidenceCategory = "WHAT" | "WHERE" | "WHEN" | "WHO" | "WHY" | "HOW";

export type NewsCategory =
  | "social_superstition"
  | "visual_manipulation"
  | "fraud_motive"
  | "pseudoscience";

/** The verdict the table can commit to. */
export type Verdict = "hoax" | "fact" | "abstain";

/** The three possible resolutions of Commit & Flip. */
export type VerdictOutcome = "verified" | "lucky_guess" | "rumour_spreads";

export interface NewsEffect {
  panic?: number;                 // +N Meter Kepanikan
  panicTargetSector?: boolean;    // villagers in target sector panic
  calmTargetSector?: boolean;
  lockEvacuationSector?: boolean; // no escort out of that sector next round
  apPenaltyFirstPlayer?: number;
  stepTowardReadyPost?: boolean;   // villagers auto-step toward safety
  removeCrisisToken?: boolean;
  apBonus?: number;
  drawEvidence?: number;
}

export interface NewsCard {
  id: string;
  category: NewsCategory;
  title: string;
  body: string;               // the post itself
  attachedContent: string;    // description of the attached media
  targetSectorId: SectorId;
  /** FRONT of card ends here. Everything below is printed on the BACK. */
  truth: "hoax" | "fact";
  locks: [EvidenceCategory, EvidenceCategory]; // exactly 2, both must open
  explanation: string;        // 2-3 sentence scientific explanation
  redFlags: string;           // "the red flags you should have caught"
  ifIgnored: NewsEffect;
  ifValidated: NewsEffect;
}

export type ResourceKind =
  | "ap2"
  | "alt_route"
  | "trade"
  | "calm_free"
  | "panic_shield";

export interface EvidenceCard {
  id: string;
  category: EvidenceCategory;
  title: string;
  points: 1 | 2 | 3;
  description: string;
  milEffect: string;          // ZONA ATAS
  resourceName: string;       // ZONA BAWAH label
  resourceEffect: string;
  resourceKind: ResourceKind;
  isWildcard?: boolean;       // only the 3-point HOW card
  bonus?: "refund_ap" | "calm_nearest";
}

export type DisasterCategory = "tectonic" | "volcanic" | "oceanic" | "atmospheric";

export type RoundEffectKey =
  | "move_penalty"        // +1 AP all movement
  | "coast_exit_penalty"  // +1 AP leaving affected sector
  | "block_escort"        // no escort in/out of affected sector
  | "block_where"         // WHERE evidence unusable
  | "block_trade"         // barter unusable
  | "calm_cost_up"        // calm costs 3
  | "panic_spread"        // villagers in affected sector panic at round start
  | "peek_disaster"       // favourable: peek next disaster
  | "no_evidence_move";   // evidence cannot be discarded for movement

export interface DisasterCard {
  id: string;
  category: DisasterCategory;
  title: string;
  description: string;
  locationLabel: string;
  roundEffect: string;                 // player-facing copy
  roundEffectKey: RoundEffectKey;
  affectedSectorIds: SectorId[];       // empty = all sectors
  endEffect: string;                   // player-facing copy
  /** Which tile takes damage at end of round. */
  damageTarget: "affected_sector" | "most_villagers" | "none";
}

export type ChaosEffectKey =
  | "calm_cost_up_perm"
  | "hand_limit_down"
  | "block_category"
  | "ap_down"
  | "villager_drift"
  | "reputation_tax";

export interface ChaosCard {
  id: string;
  title: string;
  description: string;
  effectKey: ChaosEffectKey;
  blockedCategory?: EvidenceCategory;
}

export type RewardEffectKey =
  | "ap_up"
  | "hand_limit_up"
  | "sea_lane_cheap"
  | "clear_chaos"
  | "calm_cheap";

export interface RewardCard {
  id: string;
  title: string;
  cost: number;               // Poin Reputasi
  description: string;
  effectKey: RewardEffectKey;
}

// ——— Roles ————————————————————————————————————————————————————————

export type ActiveAbilityKey =
  | "recon"          // Bald Eagle: peek disaster OR news deck
  | "data_mining"    // Japanese Macaque: discard 2 evidence -> open any lock
  | "tactical_escort"// Sumatran Tiger: +1 AP for escort this turn
  | "network_sync"   // Kea Parrot: see a player's hand, swap 1 card
  | "suppress"       // Andean Llama: calm up to 3 AND clear the Crisis Token
  | "open_water";    // Whale Shark: move a villager along the Sea Lane

export type SubMissionKey =
  | "critical_mapping" // Bald Eagle: end turn on 3 different damaged tiles
  | "collect_3pt"      // Japanese Macaque: hold three 3-point evidence at once
  | "rescue_crisis"    // Sumatran Tiger: evacuate 5 villagers out of the round's news sector
  | "catalyst"         // Kea Parrot: 3 barters whose card solved the news same round
  | "calm_six"         // Andean Llama: calm 6 panicked villagers total
  | "safe_passage";    // Whale Shark: deliver 3 villagers via the Sea Lane

export interface Role {
  id: string;
  name: string;
  title: string;              // "The Scout"
  passiveName: string;
  passive: string;
  activeName: string;
  active: string;
  activeKey: ActiveAbilityKey;
  subMissionName: string;
  subMission: string;
  subMissionKey: SubMissionKey;
  subMissionTarget: number;
  playstyle: string;          // one-line "gaya bermain"
}

// ——— Runtime state ————————————————————————————————————————————————

export type PlayerId = string;

export type VillagerStatus = "calm" | "panicked" | "rescued" | "lost";

export interface VillagerToken {
  id: string;
  status: VillagerStatus;
  tileIndex: number;
}

/** 0 = Normal, 1 = Retak, 2 = Hancur. */
export type TileDamage = 0 | 1 | 2;

export interface TileState {
  index: number;
  typeId: string;
  sectorId: SectorId | null;   // null for Ready Post and Sea Lane tiles
  isReadyPost: boolean;
  isSeaLane: boolean;
  damage: TileDamage;
  occupants: VillagerToken[];
  hasCrisisToken: boolean;
  evacuationLocked: boolean;   // from a news "lock evacuation" effect
}

export interface Player {
  id: PlayerId;
  name: string;
  roleId: string;
  ap: number;
  hand: string[];              // evidence card ids
  position: number;            // ring index
  activeUsedThisRound: boolean;
  altRouteReady: boolean;
  escortBonusAp: number;       // Harimau tactical escort
  subMissionProgress: number;
  subMissionDone: boolean;
  damagedTilesVisited: number[]; // Elang sub-mission tracking
}

export type GamePhase =
  | "setup"
  | "p1_disaster"
  | "p2_news"
  | "p3_turns"
  | "p4_verdict"
  | "p5_impact"
  | "game_over";

export type GameOverReason = "win" | "panic" | "casualties" | "timeout";

export interface GameLogEntry {
  round: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
}

export interface GameStats {
  verified: number;
  luckyGuess: number;
  rumourSpreads: number;
  hoaxDebunked: number;
  factsValidated: number;
  subMissionsDone: number;
}

export interface PeekInfo {
  kind: "disaster" | "news" | "hand";
  cardId?: string;
  playerId?: PlayerId;
}

export interface GameState {
  phase: GamePhase;
  round: number;
  scenarioId: string;

  players: Player[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  playersEndedTurn: PlayerId[];

  tiles: TileState[];

  panicMeter: number;
  panicMeterMax: number;
  reputation: number;

  // Active round cards
  activeDisaster: DisasterCard | null;
  activeNews: NewsCard | null;
  newsTileIndex: number | null;

  // Commit & Flip
  locksOpened: EvidenceCategory[];
  verdict: Verdict | null;      // committed, immutable once set
  newsRevealed: boolean;        // card has been flipped
  lastOutcome: VerdictOutcome | null;

  decks: {
    disaster: string[];
    news: string[];
    evidence: string[];
    chaos: string[];
  };
  discards: {
    disaster: string[];
    news: string[];
    evidence: string[];
  };

  activeChaos: string[];        // chaos card ids in force
  ownedRewards: string[];       // reward card ids purchased

  evacuees: VillagerToken[];
  casualties: VillagerToken[];

  gameOverReason: GameOverReason | null;
  log: GameLogEntry[];
  stats: GameStats;

  // per-round bookkeeping
  pendingApBonus: Record<PlayerId, number>;
  panicShield: boolean;
  peek: PeekInfo | null;
  /** False while an oceanic disaster shuts the Sea Lane. */
  seaLaneOpen: boolean;
  rngSeed: number;
}

export type GameAction =
  | {
      type: "START_GAME";
      scenarioId: string;
          players: { name: string; roleId: string }[];
      seed?: number;
    }
  // Fase 1
  | { type: "DRAW_DISASTER" }
  // Fase 2
  | { type: "DRAW_NEWS" }
  // Fase 3
  | { type: "MOVE_PLAYER"; playerId: PlayerId; targetTileIndex: number; viaSeaLane?: boolean }
  | { type: "CALM_VILLAGER"; playerId: PlayerId; villagerId: string }
  | { type: "ESCORT_VILLAGER"; playerId: PlayerId; villagerIds: string[]; targetTileIndex: number; viaSeaLane?: boolean }
  | { type: "INVESTIGATE"; playerId: PlayerId }
  | { type: "PLAY_EVIDENCE_LOCK"; playerId: PlayerId; evidenceId: string; lock: EvidenceCategory }
  | { type: "DISCARD_FOR_RESOURCE"; playerId: PlayerId; evidenceId: string; tradeWithPlayerId?: PlayerId; tradeGiveCardId?: string; targetVillagerId?: string }
  | { type: "BARTER"; playerId: PlayerId; withPlayerId: PlayerId; giveCardId: string; takeCardId: string }
  // `villagerId` + `targetTileIndex` are the Whale Shark's "Deep Current"
  // parameters; every other Active ability ignores them.
  | {
      type: "USE_ACTIVE_ABILITY";
      playerId: PlayerId;
      targetPlayerId?: PlayerId;
      deck?: "disaster" | "news";
      evidenceIds?: string[];
      lock?: EvidenceCategory;
      villagerId?: string;
      targetTileIndex?: number;
    }
  | { type: "END_PLAYER_TURN" }
  // Fase 4 — Commit & Flip
  | { type: "COMMIT_VERDICT"; verdict: Verdict }
  | { type: "FLIP_NEWS" }
  // Fase 5
  | { type: "BUY_REWARD"; rewardId: string }
  | { type: "ADVANCE_PHASE" }
  | { type: "CLEAR_PEEK" }
  | { type: "RESET_GAME" }
  // Debug / playtest
  | { type: "DEBUG_SET_PANIC"; value: number }
  | { type: "DEBUG_SET_REPUTATION"; value: number }
  | { type: "DEBUG_SET_PHASE"; phase: GamePhase }
  | { type: "DEBUG_SET_NEWS_TOP"; cardId: string }
  | { type: "DEBUG_SET_DISASTER_TOP"; cardId: string }
  | { type: "DEBUG_TRIM_DISASTER_DECK" };
