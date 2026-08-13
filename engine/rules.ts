// ============================================================================
// RING OF FIRE v2 — pure rules helpers.
// No DOM, no React, no I/O, no Math.random. 100% unit-testable.
// Canonical rules: E:\archives\ringoffire\docs\00-MASTER-SPEC-v2.md
// ============================================================================
import type {
  ActiveAbilityKey,
  ChaosCard,
  ChaosEffectKey,
  EvidenceCategory,
  GameOverReason,
  GameState,
  Player,
  RewardEffectKey,
  Role,
  Scenario,
  SectorId,
  TileState,
  VerdictOutcome,
  VillagerToken,
} from "./types";
import { gameConfig } from "@/data/gameConfig";
import { scenarioById } from "@/data/scenarios";
import { roleById } from "@/data/roles";
import { chaosCardById } from "@/data/chaosCards";
import { rewardCardById } from "@/data/rewardCards";

// ——— Tunables ————————————————————————————————————————————————————————
// Balance numbers live in data/gameConfig.ts, but the engine keeps v2 defaults
// so it stays correct even while the data lane is mid-rewrite.

const rawConfig = gameConfig as unknown as Record<string, unknown>;

function cfg(key: string, fallback: number): number {
  const v = rawConfig[key];
  return typeof v === "number" ? v : fallback;
}

/** 4 AP per player per round (v2). */
export const BASE_AP = cfg("baseAP", 4);
export const STARTING_HAND = cfg("startingHandSize", 4);
export const HAND_LIMIT = cfg("handLimit", 4);
export const HAND_LIMIT_SCHOLAR = cfg("handLimitScholar", 6);
export const MOVE_COST = cfg("moveCost", 1);
export const RETAK_MOVE_COST = cfg("moveCostCracked", 2);
export const SEA_LANE_COST = cfg("seaLaneCost", 2);
export const ESCORT_COST = cfg("escortCost", 1);
export const CALM_COST = cfg("calmCost", 2);
export const CALM_COST_STORM = cfg("calmCostStorm", 3);
export const INVESTIGATE_COST = cfg("investigateCost", 1);
export const BARTER_COST = cfg("barterCost", 1);
export const SUB_MISSION_REPUTATION = cfg("reputationPerSubMission", 2);

// v3 has exactly ONE difficulty — no presets, no picker. The numbers live in
// data/gameConfig.ts and are tuned in engine/balance.test.ts.
export const TOTAL_VILLAGERS = cfg("totalVillagers", 18);
export const TARGET_EVACUATION = cfg("targetEvacuation", 15);
export const PANIC_METER_MAX = cfg("panicMeterMax", 6);
export const DISASTER_DECK_SIZE = cfg("disasterDeckSize", 12);
export const SEA_LANE_MAX_VILLAGERS = cfg("seaLaneMaxVillagers", 1);

/**
 * How many villagers must reach a Ready Post to win.
 *
 * Scales with the size of the table. See the note on
 * `gameConfig.targetEvacuationByPlayers` for why this is not a fixed number.
 */
export function targetEvacuation(state: GameState): number {
  const base = getScenario(state)?.targetEvacuation ?? TARGET_EVACUATION;
  const n = state.players?.length ?? 0;
  return gameConfig.targetEvacuationByPlayers[n] ?? base;
}

// ——— PRNG ————————————————————————————————————————————————————————————

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle, pure (returns a new array). */
export function shuffled<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ——— Scenario / roles ————————————————————————————————————————————————

export function getScenario(state: GameState): Scenario {
  const map = scenarioById as unknown as Record<string, Scenario | undefined>;
  return map[state.scenarioId] ?? (Object.values(map)[0] as Scenario);
}

export function roleOf(player: Player): Role | undefined {
  return (roleById as unknown as Record<string, Role | undefined>)[player.roleId];
}

/** Roles are identified by their FROZEN ability key, never by a data id string. */
export function hasAbility(player: Player, key: ActiveAbilityKey): boolean {
  return roleOf(player)?.activeKey === key;
}

/** 🦅 Elang — Navigasi Udara: immune to disaster movement penalties and Retak surcharges. */
export function isAirborne(player?: Player): boolean {
  return !!player && hasAbility(player, "recon");
}

// ——— Ring topology ——————————————————————————————————————————————————

export function ringSize(state: GameState): number {
  return getScenario(state)?.ringSize ?? state.tiles.length;
}

/** The rim is a closed loop: (i-1+N)%N and (i+1)%N. */
export function rimNeighbors(i: number, size: number): number[] {
  if (size <= 0) return [];
  if (size === 1) return [];
  const prev = (i - 1 + size) % size;
  const next = (i + 1) % size;
  return prev === next ? [prev] : [prev, next];
}

/**
 * The Sea Lane is an explicit chain of tiles through the hole in the ring:
 *   Ready Post A <-> 24 <-> 25 <-> 26 <-> Ready Post B
 * Its indices sit OUTSIDE rim arithmetic, so they are never fed to rimNeighbors.
 */
export function seaLaneChain(scenario: Scenario): number[] {
  const lane = scenario?.seaLaneIndices ?? [];
  const [a, b] = scenario?.seaLaneEndpoints ?? [0, 0];
  return [a, ...lane, b];
}

export function isSeaLaneTile(scenario: Scenario, i: number): boolean {
  return (scenario?.seaLaneIndices ?? []).includes(i);
}

/** Neighbours along the Sea Lane chain only. */
export function seaLaneNeighbors(i: number, scenario: Scenario): number[] {
  const chain = seaLaneChain(scenario);
  const out: number[] = [];
  chain.forEach((node, k) => {
    if (node !== i) return;
    const prev = chain[k - 1];
    const next = chain[k + 1];
    if (prev !== undefined && !out.includes(prev)) out.push(prev);
    if (next !== undefined && !out.includes(next)) out.push(next);
  });
  return out;
}

/** The Sea Lane shuts completely while an Oceanic disaster is active. */
export function isSeaLaneOpen(state: GameState): boolean {
  if (state.activeDisaster?.category === "oceanic") return false;
  return state.seaLaneOpen !== false;
}

/** Rim neighbours plus any currently-open Sea Lane neighbours. */
export function allNeighbors(state: GameState, i: number): number[] {
  const scenario = getScenario(state);
  // Sea Lane tiles have no rim neighbours at all — only the chain.
  const out = isSeaLaneTile(scenario, i) ? [] : rimNeighbors(i, ringSize(state));
  if (isSeaLaneOpen(state)) {
    for (const n of seaLaneNeighbors(i, scenario)) {
      if (!out.includes(n)) out.push(n);
    }
  }
  return out;
}

export function areRimAdjacent(state: GameState, a: number, b: number): boolean {
  return rimNeighbors(a, ringSize(state)).includes(b);
}

export function areSeaLaneLinked(state: GameState, a: number, b: number): boolean {
  return seaLaneNeighbors(a, getScenario(state)).includes(b);
}

// ——— Tiles & villagers ————————————————————————————————————————————————

/** Hancur (damage 2) tiles can never be entered. Pos Siaga is damage-immune. */
export function isPassable(tile: TileState | undefined): boolean {
  if (!tile) return false;
  if (tile.isReadyPost) return true;
  return tile.damage < 2;
}

export function isReadyPost(tile: TileState | undefined): boolean {
  return !!tile?.isReadyPost;
}

export function villagersOnBoard(state: GameState): VillagerToken[] {
  return state.tiles.flatMap((t) => t.occupants);
}

export function findVillager(state: GameState, id: string): VillagerToken | undefined {
  for (const tile of state.tiles) {
    const v = tile.occupants.find((o) => o.id === id);
    if (v) return v;
  }
  return undefined;
}

export function sectorTiles(state: GameState, sectorId: SectorId): TileState[] {
  return state.tiles.filter((t) => t.sectorId === sectorId);
}

/** `affectedSectorIds: []` on a disaster card means "every sector". */
export function isSectorAffected(state: GameState, sectorId: SectorId | null): boolean {
  const d = state.activeDisaster;
  if (!d) return false;
  if (!d.affectedSectorIds || d.affectedSectorIds.length === 0) return true;
  return sectorId !== null && d.affectedSectorIds.includes(sectorId);
}

// ——— Chaos & Rewards ——————————————————————————————————————————————————

export function activeChaosCards(state: GameState): ChaosCard[] {
  const map = chaosCardById as unknown as Record<string, ChaosCard | undefined>;
  return state.activeChaos.map((id) => map[id]).filter((c): c is ChaosCard => !!c);
}

export function hasChaos(state: GameState, key: ChaosEffectKey): boolean {
  return activeChaosCards(state).some((c) => c.effectKey === key);
}

export function hasReward(state: GameState, key: RewardEffectKey): boolean {
  const map = rewardCardById as unknown as Record<string, { effectKey: RewardEffectKey } | undefined>;
  return state.ownedRewards.some((id) => map[id]?.effectKey === key);
}

/**
 * Put a Chaos card into force and apply its one-shot part.
 * Mutates the working clone — the reducer only ever calls this on its own copy.
 */
export function applyChaos(state: GameState, chaosId: string): ChaosCard | undefined {
  const map = chaosCardById as unknown as Record<string, ChaosCard | undefined>;
  const card = map[chaosId];
  if (!card) return undefined;
  if (!state.activeChaos.includes(chaosId)) state.activeChaos.push(chaosId);
  // The only Chaos effect that resolves immediately; the rest are standing rules
  // consulted by hasChaos() wherever they bite.
  if (card.effectKey === "reputation_tax") {
    state.reputation = Math.max(0, state.reputation - 1);
  }
  return card;
}

/** Evidence of this category cannot be played onto a lock right now. */
export function isCategoryBlocked(state: GameState, category: EvidenceCategory): boolean {
  if (state.activeDisaster?.roundEffectKey === "block_where" && category === "WHERE") return true;
  return activeChaosCards(state).some(
    (c) => c.effectKey === "block_category" && c.blockedCategory === category
  );
}

// ——— Costs ————————————————————————————————————————————————————————————

/** AP a player starts Fase 3 with: 4 ± pending bonuses, Rewards and Chaos. */
export function startingAp(state: GameState, player: Player): number {
  let ap = BASE_AP + (state.pendingApBonus[player.id] ?? 0);
  if (hasReward(state, "ap_up")) ap += 1;
  if (hasChaos(state, "ap_down")) ap -= 1;
  return Math.max(0, ap);
}

/** 🦧 Orangutan holds 6; everyone else 4, modified by Reward/Chaos. */
export function handLimit(state: GameState, player: Player): number {
  let limit = hasAbility(player, "data_mining") ? HAND_LIMIT_SCHOLAR : HAND_LIMIT;
  if (hasReward(state, "hand_limit_up")) limit += 2;
  if (hasChaos(state, "hand_limit_down")) limit -= 1;
  return Math.max(1, limit);
}

/** AP for one Sea Route hop — 2, or 1 once the team owns "Peta Evakuasi". */
export function seaLaneCost(state: GameState): number {
  return hasReward(state, "sea_lane_cheap") ? 1 : SEA_LANE_COST;
}

function terrainAndWeather(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  player: Player | undefined,
  viaSeaLane: boolean
): number {
  if (isAirborne(player)) return 0; // Elang ignores terrain + weather entirely
  let extra = 0;
  const to = state.tiles[toIndex];
  const from = state.tiles[fromIndex];
  if (!viaSeaLane && to && to.damage === 1) extra += RETAK_MOVE_COST - MOVE_COST;
  const key = state.activeDisaster?.roundEffectKey;
  if (key === "move_penalty") extra += 1;
  if (key === "coast_exit_penalty" && from && isSectorAffected(state, from.sectorId)) extra += 1;
  return extra;
}

/** AP to walk from one tile to a neighbouring tile. */
export function moveCost(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  player?: Player,
  viaSeaLane = false
): number {
  const base = viaSeaLane ? seaLaneCost(state) : MOVE_COST;
  let extra = terrainAndWeather(state, fromIndex, toIndex, player, viaSeaLane);
  // "Jalur Alternatif" cancels one terrain/weather penalty.
  if (player?.altRouteReady && extra > 0) extra = 0;
  return Math.max(0, base + extra);
}

/** AP to walk a villager (or two, if Harimau) to a neighbouring tile. */
export function escortCost(
  state: GameState,
  fromIndex: number,
  toIndex: number,
  player?: Player,
  viaSeaLane = false
): number {
  const base = viaSeaLane ? seaLaneCost(state) : ESCORT_COST;
  let extra = terrainAndWeather(state, fromIndex, toIndex, player, viaSeaLane);
  if (player?.altRouteReady && extra > 0) extra = 0;
  return Math.max(0, base + extra);
}

/** AP to turn one Panik villager Tenang. */
export function calmCost(state: GameState): number {
  let cost = state.activeDisaster?.roundEffectKey === "calm_cost_up" ? CALM_COST_STORM : CALM_COST;
  if (hasChaos(state, "calm_cost_up_perm")) cost += 1;
  if (hasReward(state, "calm_cheap")) cost -= 1;
  return Math.max(1, cost);
}

/** Escort is blocked in/out of a sector the active disaster has cut off. */
export function escortBlocked(state: GameState, from: TileState, to: TileState): boolean {
  if (from.evacuationLocked) return true;
  if (state.activeDisaster?.roundEffectKey !== "block_escort") return false;
  return isSectorAffected(state, from.sectorId) || isSectorAffected(state, to.sectorId);
}

/** How many villagers one escort action may take. */
export function maxEscortGroup(player: Player | undefined, viaSeaLane: boolean): number {
  if (viaSeaLane) return 1; // Rute Laut: maks 1 warga, always
  return player && hasAbility(player, "tactical_escort") ? 2 : 1;
}

// ——— Pathing ——————————————————————————————————————————————————————————

/** One step from `from` toward the nearest Pos Siaga. BFS over passable tiles. */
export function stepTowardNearestReadyPost(state: GameState, from: number): number | null {
  const visited = new Set<number>([from]);
  const queue: { index: number; first: number | null }[] = [{ index: from, first: null }];
  while (queue.length > 0) {
    const { index, first } = queue.shift()!;
    if (index !== from && isReadyPost(state.tiles[index])) return first;
    for (const n of allNeighbors(state, index)) {
      if (visited.has(n)) continue;
      if (!isPassable(state.tiles[n])) continue;
      visited.add(n);
      queue.push({ index: n, first: first ?? n });
    }
  }
  return null;
}

/** Nearest panicked villager, BFS outward from `from`. */
export function nearestPanickedVillager(state: GameState, from: number): VillagerToken | null {
  const visited = new Set<number>([from]);
  const queue: number[] = [from];
  while (queue.length > 0) {
    const index = queue.shift()!;
    const panicked = state.tiles[index]?.occupants.find((v) => v.status === "panicked");
    if (panicked) return panicked;
    for (const n of allNeighbors(state, index)) {
      if (visited.has(n)) continue;
      visited.add(n);
      queue.push(n);
    }
  }
  return null;
}

/** Nearest passable tile a displaced player can scramble to. */
export function nearestSafeStep(state: GameState, from: number): number | null {
  for (const n of allNeighbors(state, from)) {
    if (isPassable(state.tiles[n])) return n;
  }
  const anyPos = state.tiles.find((t) => t.isReadyPost);
  return anyPos ? anyPos.index : null;
}

// ——— Commit & Flip ————————————————————————————————————————————————————

export function bothLocksOpened(state: GameState): boolean {
  const news = state.activeNews;
  if (!news) return false;
  return news.locks.every((lock) => state.locksOpened.includes(lock));
}

/**
 * THE TRUTH TABLE.
 *
 *  verdict === truth  &&  both locks opened  ->  terverifikasi
 *  verdict === truth  &&  locks incomplete   ->  lucky_guess
 *  verdict !== truth  ||  abstain / none     ->  rumour_spreads
 *
 * `lucky_guess` is the educational heart: guessing right is not literacy.
 */
export function resolveVerdict(state: GameState): VerdictOutcome {
  const news = state.activeNews;
  if (!news) return "rumour_spreads";
  const verdict = state.verdict;
  if (verdict === null || verdict === "abstain") return "rumour_spreads";
  if (verdict !== news.truth) return "rumour_spreads";
  return bothLocksOpened(state) ? "verified" : "lucky_guess";
}

// ——— Win / lose ————————————————————————————————————————————————————————

/**
 * menang — evacuees >= target
 * panik  — panic meter maxed (Gagal Literasi)
 * korban — evacuees + villagers still alive < target (target now impossible)
 * waktu  — disaster deck exhausted and target not met (end-of-round only)
 */
export function checkGameOver(
  state: GameState,
  opts: { endOfRound?: boolean } = {}
): { over: boolean; reason?: GameOverReason } {
  const target = targetEvacuation(state);
  if (state.evacuees.length >= target) return { over: true, reason: "win" };
  if (state.panicMeter >= state.panicMeterMax) return { over: true, reason: "panic" };

  const alive = villagersOnBoard(state).filter((v) => v.status !== "lost").length;
  if (state.evacuees.length + alive < target) return { over: true, reason: "casualties" };

  const timeIsUp = opts.endOfRound === true || state.phase === "p5_impact";
  if (timeIsUp && state.decks.disaster.length === 0) return { over: true, reason: "timeout" };

  return { over: false };
}
