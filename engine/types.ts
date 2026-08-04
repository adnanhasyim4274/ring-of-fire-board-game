// ============================================================================
// RING OF FIRE — Shared type contract v2.0
// Canonical rules: E:\archives\ringoffire\docs\00-MASTER-SPEC-v2.md
// Every chunk depends on this file. Do not change without updating the spec.
// ============================================================================

// ——— Board topology ————————————————————————————————————————————————
// The board IS a ring. Tiles are a closed loop of `ringSize` indices.
// Adjacency along the rim: (i-1+N)%N and (i+1)%N.
// Sea Routes add 4 extra edges, each connecting two ADJACENT Pos Siaga
// (arcs hugging the inner rim, never crossing the centre).

export type SectorId = "merah" | "teal" | "kuning" | "biru";

export interface Sector {
  id: SectorId;
  name: string;          // "Busur Vulkanik"
  region: string;        // "Jawa, Sumatra, Sunda Strait"
  hoaxTheme: string;     // tema hoaks khas sektor ini
  tileIndices: number[]; // 6 tiles per sector
}

export interface TileType {
  id: string;
  name: string;
  isPosSiaga?: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  ringSize: number;                  // 28
  layout: string[];                  // tileType id per ring index
  regionNames: string[];             // real-world label per tile
  sectors: Sector[];
  posSiagaIndices: number[];         // [0, 7, 14, 21]
  seaRoutes: [number, number][];     // [[0,7],[7,14],[14,21],[21,0]]
  villagerSetup: number[];           // villagers per ring index
  totalVillagers: number;            // 16
  targetEvacuation: number;          // 10
  disasterDeckSize: number;          // 16
}

// ——— Cards ——————————————————————————————————————————————————————————

export type EvidenceCategory = "WHAT" | "WHERE" | "WHEN" | "WHO" | "WHY" | "HOW";

export type NewsCategory =
  | "sosial_takhayul"
  | "manipulasi_visual"
  | "motif_penipuan"
  | "pseudosains";

/** The verdict the table can commit to. */
export type Verdict = "hoax" | "fakta" | "abstain";

/** The three possible resolutions of Commit & Flip. */
export type VerdictOutcome = "terverifikasi" | "tebakan_beruntung" | "hoaks_menyebar";

export interface NewsEffect {
  panic?: number;                 // +N Meter Kepanikan
  panicTargetSector?: boolean;    // villagers in target sector panic
  calmTargetSector?: boolean;
  lockEvacuationSector?: boolean; // no escort out of that sector next round
  apPenaltyFirstPlayer?: number;
  stepTowardPosSiaga?: boolean;   // villagers auto-step toward safety
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
  truth: "hoax" | "fakta";
  locks: [EvidenceCategory, EvidenceCategory]; // exactly 2, both must open
  explanation: string;        // 2-3 sentence scientific explanation
  redFlags: string;           // "tanda bahaya yang seharusnya kalian lihat"
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

export type DisasterCategory = "tektonik" | "vulkanik" | "oseanografi" | "atmosferik";

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
  | "sea_route_cheap"
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
  | "recon"          // Elang: peek disaster OR news deck
  | "data_mining"    // Orangutan: discard 2 evidence -> open any lock
  | "tactical_escort"// Harimau: +1 AP for escort this turn
  | "network_sync"   // Monyet: see a player's hand, swap 1 card
  | "suppress";      // Komodo: calm up to 3 on your tile

export type SubMissionKey =
  | "map_damaged"      // Elang: end turn on 3 different damaged tiles
  | "collect_3pt"      // Orangutan: hold three 3-point evidence at once
  | "rescue_crisis"    // Harimau: evacuate 5 villagers taken from crisis tiles
  | "catalyst"         // Monyet: 3 barters whose card solved the news same round
  | "calm_six";        // Komodo: calm 6 panicked villagers total

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

export type VillagerStatus = "tenang" | "panik" | "selamat" | "hilang";

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
  sectorId: SectorId | null;   // null for Pos Siaga
  isPosSiaga: boolean;
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

export type GameOverReason = "menang" | "panik" | "korban" | "waktu";

export interface GameLogEntry {
  round: number;
  phase: GamePhase;
  message: string;
  timestamp: number;
}

export interface GameStats {
  terverifikasi: number;
  tebakanBeruntung: number;
  hoaksMenyebar: number;
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
  difficulty: "siaga" | "awas" | "darurat";

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
  seaRouteOpen: boolean;
  rngSeed: number;
}

export type GameAction =
  | {
      type: "START_GAME";
      scenarioId: string;
      difficulty: "siaga" | "awas" | "darurat";
      players: { name: string; roleId: string }[];
      seed?: number;
    }
  // Fase 1
  | { type: "DRAW_DISASTER" }
  // Fase 2
  | { type: "DRAW_NEWS" }
  // Fase 3
  | { type: "MOVE_PLAYER"; playerId: PlayerId; targetTileIndex: number; viaSeaRoute?: boolean }
  | { type: "CALM_VILLAGER"; playerId: PlayerId; villagerId: string }
  | { type: "ESCORT_VILLAGER"; playerId: PlayerId; villagerIds: string[]; targetTileIndex: number; viaSeaRoute?: boolean }
  | { type: "INVESTIGATE"; playerId: PlayerId }
  | { type: "PLAY_EVIDENCE_LOCK"; playerId: PlayerId; evidenceId: string; lock: EvidenceCategory }
  | { type: "DISCARD_FOR_RESOURCE"; playerId: PlayerId; evidenceId: string; tradeWithPlayerId?: PlayerId; tradeGiveCardId?: string; targetVillagerId?: string }
  | { type: "BARTER"; playerId: PlayerId; withPlayerId: PlayerId; giveCardId: string; takeCardId: string }
  | { type: "USE_ACTIVE_ABILITY"; playerId: PlayerId; targetPlayerId?: PlayerId; deck?: "disaster" | "news"; evidenceIds?: string[]; lock?: EvidenceCategory }
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
