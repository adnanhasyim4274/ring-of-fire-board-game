// ============================================================================
// RING OF FIRE v2 — engine tests.
// Board features are located dynamically (search for a Pos Siaga, a tile with
// villagers) so these survive data tweaks.
// ============================================================================
import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import {
  checkGameOver,
  escortRefusal,
  isSeaLaneOpen,
  moveCost,
  openWaterOptions,
  resolveVerdict,
  rimNeighbors,
  seaLaneCost,
  seaLaneNeighbors,
} from "./rules";
import type {
  EvidenceCategory,
  GameAction,
  GameState,
  SectorId,
  TileState,
  Verdict,
  VillagerToken,
} from "./types";
import { evidenceCards, wildcardEvidenceId } from "@/data/evidenceCards";
import { newsCardById } from "@/data/newsCards";
import { scenarioById } from "@/data/scenarios";
import { roleById } from "@/data/roles";

// ——— Harness ————————————————————————————————————————————————————————

const SCENARIO_ID = Object.keys(scenarioById)[0];
/** Rim arithmetic is modulo the RING, never the tile count: the three Sea
 *  Lane tiles live outside it. */
const RING = scenarioById[SCENARIO_ID].ringSize;

/** A disaster with no movement penalty, no escort block and no tile damage. */
const CALM_DISASTER = "dis_atm_03";
/** Hokkaido sector, truth "fact" — keeps the Sunda sector untouched in tests. */
const TEAL_NEWS = "news_pse_03";

function act(state: GameState, action: GameAction): GameState {
  const next = reduce(state, action);
  expect(next).not.toBeNull();
  return next!;
}

function newGame(
  opts: {
    roles?: string[];
    seed?: number;
  } = {}): GameState {
  const roles = opts.roles ?? ["bald_eagle", "andean_llama"];
  const state = reduce(null, {
    type: "START_GAME",
    scenarioId: SCENARIO_ID,
    players: roles.map((roleId, i) => ({ name: `P${i + 1}`, roleId })),
    seed: opts.seed ?? 7,
  });
  expect(state).not.toBeNull();
  return state!;
}

/** Fase 1 + Fase 2, stopping at the start of Fase 3. */
function toTurnsPhase(
  state: GameState,
  opts: { disasterId?: string; newsId?: string } = {}): GameState {
  let s = state;
  s = act(s, { type: "DEBUG_SET_DISASTER_TOP", cardId: opts.disasterId ?? CALM_DISASTER });
  s = act(s, { type: "DRAW_DISASTER" });
  s = act(s, { type: "ADVANCE_PHASE" });
  s = act(s, { type: "DEBUG_SET_NEWS_TOP", cardId: opts.newsId ?? TEAL_NEWS });
  s = act(s, { type: "DRAW_NEWS" });
  s = act(s, { type: "ADVANCE_PHASE" });
  expect(s.phase).toBe("p3_turns");
  return s;
}

function endAllTurns(state: GameState): GameState {
  let s = state;
  for (let i = 0; i < s.players.length; i++) s = act(s, { type: "END_PLAYER_TURN" });
  return s;
}

/** Fase 1 → Fase 5, stopping inside p5_impact (before the round rolls over). */
function playRound(
  state: GameState,
  opts: { disasterId?: string; newsId?: string; verdict?: Verdict } = {}): GameState {
  let s = toTurnsPhase(state, opts);
  s = endAllTurns(s);
  if (opts.verdict && s.phase === "p4_verdict") {
    s = act(s, { type: "COMMIT_VERDICT", verdict: opts.verdict });
    s = act(s, { type: "FLIP_NEWS" });
  }
  s = act(s, { type: "ADVANCE_PHASE" });
  return s;
}

function evidenceIdFor(category: EvidenceCategory): string {
  const card =
    evidenceCards.find((c) => c.category === category && !c.isWildcard) ??
    evidenceCards.find((c) => c.category === category);
  if (!card) throw new Error(`no evidence card for ${category}`);
  return card.id;
}

/** Play a matching Evidence card onto `lock`, seeding the hand first. */
function openLock(state: GameState, lock: EvidenceCategory, evidenceId?: string): GameState {
  const id = evidenceId ?? evidenceIdFor(lock);
  const s = structuredClone(state);
  s.players[0].hand.push(id);
  return act(s, { type: "PLAY_EVIDENCE_LOCK", playerId: s.players[0].id, evidenceId: id, lock });
}

function posSiagaIndex(state: GameState): number {
  const i = state.tiles.findIndex((t) => t.isReadyPost);
  expect(i).toBeGreaterThanOrEqual(0);
  return i;
}

/** A tile that holds villagers and sits on the rim next to a Pos Siaga. */
function tileNextToPosSiaga(state: GameState): TileState {
  const pos = posSiagaIndex(state);
  const neighbour = rimNeighbors(pos, RING)
    .map((i) => state.tiles[i])
    .find((t) => !t.isReadyPost && t.occupants.length > 0);
  expect(neighbour).toBeTruthy();
  return neighbour!;
}

function villagerCountOnBoard(state: GameState): number {
  return state.tiles.reduce((n, t) => n + t.occupants.length, 0);
}

/** The first News card that points at `sector`, so a test can aim the round. */
function newsIdForSector(sector: SectorId): string {
  const card = Object.values(newsCardById).find((c) => c.targetSectorId === sector);
  if (!card) throw new Error(`no news card targets ${sector}`);
  return card.id;
}

/** A land tile in `sector` that is next to a Ready Post and holds a calm villager. */
function tileInSectorNextToPosSiaga(state: GameState, sector: SectorId): TileState {
  const tile = state.tiles.find(
    (t) =>
      t.sectorId === sector &&
      !t.hasCrisisToken &&
      t.occupants.length > 0 &&
      rimNeighbors(t.index, RING).some((i) => state.tiles[i]?.isReadyPost)
  );
  expect(tile).toBeTruthy();
  return tile!;
}

function posSiagaNextTo(state: GameState, index: number): number {
  const pos = rimNeighbors(index, RING).find((i) => state.tiles[i]?.isReadyPost);
  expect(pos).toBeDefined();
  return pos!;
}

/**
 * Drop `player` onto `tile`, calm everyone on it, and hand them a full turn.
 * Sub-mission tests care about what an action credits, not about the walk in.
 */
function stage(state: GameState, playerIndex: number, tileIndex: number): GameState {
  const s = structuredClone(state);
  s.currentPlayerIndex = playerIndex;
  s.players[playerIndex].position = tileIndex;
  s.tiles[tileIndex].occupants.forEach((v) => (v.status = "calm"));
  return s;
}

function progressOf(state: GameState, playerIndex: number): number {
  return state.players[playerIndex].subMissionProgress;
}

// ——— Setup ——————————————————————————————————————————————————————————

describe("START_GAME", () => {
  it("builds the 27-tile board with 6 Ready Posts and 18 villagers", () => {
    const s = newGame();
    const scenario = scenarioById[SCENARIO_ID];
    expect(s.tiles).toHaveLength(scenario.layout.length);
    expect(scenario.ringSize).toBe(24);
    expect(s.tiles.filter((t) => t.isReadyPost)).toHaveLength(scenario.readyPostIndices.length);
    expect(villagerCountOnBoard(s)).toBe(scenario.totalVillagers);
    expect(s.phase).toBe("p1_disaster");
    expect(s.round).toBe(1);
  });

  it("gives every land tile a sectorId, and none to Ready Posts or Sea Lane", () => {
    const s = newGame();
    for (const tile of s.tiles) {
      if (tile.isReadyPost || tile.isSeaLane) expect(tile.sectorId).toBeNull();
      else expect(tile.sectorId).not.toBeNull();
    }
  });

  it("deals a starting hand and places players on Ready Posts", () => {
    const s = newGame({ roles: ["bald_eagle", "sumatran_tiger", "andean_llama"] });
    for (const p of s.players) {
      expect(p.hand.length).toBeGreaterThan(0);
      expect(s.tiles[p.position].isReadyPost).toBe(true);
    }
  });

  it("uses one single difficulty: no presets", () => {
    const s = newGame();
    expect(s.panicMeterMax).toBe(6);
    expect(s.decks.disaster).toHaveLength(12);
  });
});

// ——— Ring topology ————————————————————————————————————————————————

describe("ring adjacency", () => {
  it("wraps around the closed loop", () => {
    const s = newGame();
    const n = s.tiles.length;
    expect(rimNeighbors(n - 1, n).sort()).toEqual([0, n - 2].sort());
    expect(rimNeighbors(0, n).sort()).toEqual([1, n - 1].sort());
    expect(rimNeighbors(5, n).sort()).toEqual([4, 6]);
  });

  it("refuses a move between two non-adjacent rim tiles", () => {
    const s = toTurnsPhase(newGame());
    const p = s.players[0];
    const far = (p.position + 5) % s.tiles.length;
    const after = act(s, { type: "MOVE_PLAYER", playerId: p.id, targetTileIndex: far });
    expect(after.players[0].position).toBe(p.position);
  });
});

describe("sea routes", () => {
  it("links two adjacent Pos Siaga in a single move", () => {
    const s = toTurnsPhase(newGame());
    const scenario = scenarioById[SCENARIO_ID];
    const from = s.players[0].position;
    const [to] = seaLaneNeighbors(from, scenario);
    expect(to).toBeDefined();
    // Not reachable along the rim — that is the whole point of the shortcut.
    expect(rimNeighbors(from, RING)).not.toContain(to);

    const cost = moveCost(s, from, to, s.players[0], true);
    const apBefore = s.players[0].ap;
    const after = act(s, {
      type: "MOVE_PLAYER",
      playerId: s.players[0].id,
      targetTileIndex: to,
      viaSeaLane: true,
    });
    expect(after.players[0].position).toBe(to);
    expect(after.players[0].ap).toBe(apBefore - cost);
    expect(cost).toBe(2);
  });

  it("closes completely under an oceanic disaster", () => {
    const s = toTurnsPhase(newGame(), { disasterId: "dis_oce_01" });
    expect(s.activeDisaster?.category).toBe("oceanic");
    expect(isSeaLaneOpen(s)).toBe(false);

    const from = s.players[0].position;
    const [to] = seaLaneNeighbors(from, scenarioById[SCENARIO_ID]);
    const after = act(s, {
      type: "MOVE_PLAYER",
      playerId: s.players[0].id,
      targetTileIndex: to,
      viaSeaLane: true,
    });
    expect(after.players[0].position).toBe(from);
  });
});

// ——— Commit & Flip ————————————————————————————————————————————————

/** Drive to Fase 4 with a chosen news card, optionally opening its locks. */
function toVerdictPhase(newsId: string, locksToOpen: "both" | "one" | "none"): GameState {
  let s = toTurnsPhase(newGame(), { newsId });
  const news = newsCardById[newsId];
  const locks =
    locksToOpen === "both" ? news.locks : locksToOpen === "one" ? [news.locks[0]] : [];
  for (const lock of locks) s = openLock(s, lock);
  s = endAllTurns(s);
  expect(s.phase).toBe("p4_verdict");
  return s;
}

describe("Commit & Flip: the three outcomes", () => {
  const HOAX_NEWS = "news_soc_01"; // truth: hoax, locks HOW + WHEN

  it("verified: right verdict AND both locks -> +1 reputation, crisis cleared", () => {
    let s = toVerdictPhase(HOAX_NEWS, "both");
    expect(s.locksOpened).toHaveLength(2);
    const reputationBefore = s.reputation;

    s = act(s, { type: "COMMIT_VERDICT", verdict: "hoax" });
    s = act(s, { type: "FLIP_NEWS" });

    expect(s.newsRevealed).toBe(true);
    expect(s.lastOutcome).toBe("verified");
    expect(s.reputation).toBe(reputationBefore + 1);
    expect(s.stats.verified).toBe(1);
    expect(s.stats.hoaxDebunked).toBe(1);
    expect(s.tiles[s.newsTileIndex!].hasCrisisToken).toBe(false);
    expect(s.activeChaos).toHaveLength(0);
  });

  it("lucky_guess: right verdict but incomplete locks -> ZERO reputation", () => {
    let s = toVerdictPhase(HOAX_NEWS, "one");
    expect(s.locksOpened).toHaveLength(1);
    const reputationBefore = s.reputation;
    const panicBefore = s.panicMeter;

    s = act(s, { type: "COMMIT_VERDICT", verdict: "hoax" });
    s = act(s, { type: "FLIP_NEWS" });

    expect(s.lastOutcome).toBe("lucky_guess");
    // Guessing right is not literacy: no reward, and the crisis token stays.
    expect(s.reputation).toBe(reputationBefore);
    expect(s.stats.verified).toBe(0);
    expect(s.stats.luckyGuess).toBe(1);
    expect(s.panicMeter).toBe(panicBefore);
    expect(s.tiles[s.newsTileIndex!].hasCrisisToken).toBe(true);
    expect(s.activeChaos).toHaveLength(0);
  });

  it("lucky_guess also covers a right verdict with no locks at all", () => {
    let s = toVerdictPhase(HOAX_NEWS, "none");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "hoax" });
    s = act(s, { type: "FLIP_NEWS" });
    expect(s.lastOutcome).toBe("lucky_guess");
    expect(s.reputation).toBe(0);
  });

  it("rumour_spreads: wrong verdict -> +1 panic and a Chaos card", () => {
    let s = toVerdictPhase(HOAX_NEWS, "both");
    const panicBefore = s.panicMeter;
    // The outcome itself ticks +1; the card's own "ifIgnored" effect stacks on top.
    const cardPanic = newsCardById[HOAX_NEWS].ifIgnored.panic ?? 0;

    s = act(s, { type: "COMMIT_VERDICT", verdict: "fact" });
    s = act(s, { type: "FLIP_NEWS" });

    expect(s.lastOutcome).toBe("rumour_spreads");
    expect(s.panicMeter).toBe(panicBefore + 1 + cardPanic);
    expect(s.activeChaos).toHaveLength(1);
    expect(s.stats.rumourSpreads).toBe(1);
    expect(s.reputation).toBe(0);
  });

  it("rumour_spreads: abstain never scores, even with both locks open", () => {
    let s = toVerdictPhase(HOAX_NEWS, "both");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "abstain" });
    s = act(s, { type: "FLIP_NEWS" });
    expect(s.lastOutcome).toBe("rumour_spreads");
    expect(s.reputation).toBe(0);
    expect(s.activeChaos).toHaveLength(1);
  });

  it("validates a FAKTA card the same way", () => {
    const factNews = Object.values(newsCardById).find((c) => c.truth === "fact")!;
    let s = toVerdictPhase(factNews.id, "both");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "fact" });
    s = act(s, { type: "FLIP_NEWS" });
    expect(s.lastOutcome).toBe("verified");
    expect(s.stats.factsValidated).toBe(1);
    expect(s.stats.hoaxDebunked).toBe(0);
  });

  it("keeps the verdict immutable once committed", () => {
    let s = toVerdictPhase(HOAX_NEWS, "both");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "hoax" });
    expect(s.verdict).toBe("hoax");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "fact" });
    expect(s.verdict).toBe("hoax");
    s = act(s, { type: "COMMIT_VERDICT", verdict: "abstain" });
    expect(s.verdict).toBe("hoax");
  });

  it("refuses to flip before a verdict is committed", () => {
    const s = toVerdictPhase(HOAX_NEWS, "both");
    const after = act(s, { type: "FLIP_NEWS" });
    expect(after.newsRevealed).toBe(false);
    expect(after.lastOutcome).toBeNull();
  });

  it("resolveVerdict implements the truth table directly", () => {
    const base = toVerdictPhase(HOAX_NEWS, "both");
    expect(resolveVerdict({ ...base, verdict: "hoax" })).toBe("verified");
    expect(resolveVerdict({ ...base, verdict: "fact" })).toBe("rumour_spreads");
    expect(resolveVerdict({ ...base, verdict: "abstain" })).toBe("rumour_spreads");
    expect(resolveVerdict({ ...base, verdict: null })).toBe("rumour_spreads");
    expect(resolveVerdict({ ...base, verdict: "hoax", locksOpened: [] })).toBe("lucky_guess");
  });
});

// ——— Evidence & locks ————————————————————————————————————————————————

describe("evidence locks", () => {
  it("lets the 3-point HOW wildcard open a non-HOW lock", () => {
    const newsId = Object.values(newsCardById).find((c) => !c.locks.includes("HOW"))!.id;
    const news = newsCardById[newsId];
    const nonHowLock = news.locks.find((l) => l !== "HOW")!;
    const s = openLock(toTurnsPhase(newGame(), { newsId }), nonHowLock, wildcardEvidenceId);
    expect(s.locksOpened).toContain(nonHowLock);
  });

  it("rejects an evidence card whose category does not match the lock", () => {
    const newsId = "news_soc_01";
    const s = toTurnsPhase(newGame(), { newsId });
    const targetLock = s.activeNews!.locks[0];
    // A category the card does NOT ask for.
    const wrongCat = (["WHAT", "WHERE", "WHEN", "WHO", "WHY", "HOW"] as const).find(
      (c) => !s.activeNews!.locks.includes(c)
    )!;
    const wrong = evidenceIdFor(wrongCat);
    s.players[0].hand.push(wrong);
    const after = act(s, {
      type: "PLAY_EVIDENCE_LOCK",
      playerId: s.players[0].id,
      evidenceId: wrong,
      lock: targetLock,
    });
    expect(after.locksOpened).toHaveLength(0);
  });

  it("blocks the WHERE lock while a block_where disaster is active", () => {
    const newsId = Object.values(newsCardById).find((c) => c.locks.includes("WHERE"))!.id;
    const s = toTurnsPhase(newGame(), { newsId, disasterId: "dis_atm_02" });
    expect(s.activeDisaster?.roundEffectKey).toBe("block_where");
    const id = evidenceIdFor("WHERE");
    s.players[0].hand.push(id);
    const after = act(s, {
      type: "PLAY_EVIDENCE_LOCK",
      playerId: s.players[0].id,
      evidenceId: id,
      lock: "WHERE",
    });
    expect(after.locksOpened).not.toContain("WHERE");
  });

  it("will not open the same lock twice", () => {
    const newsId = "news_soc_01";
    let s = toTurnsPhase(newGame(), { newsId });
    const lock = s.activeNews!.locks[0];
    s = openLock(s, lock);
    s = openLock(s, lock);
    expect(s.locksOpened.filter((l) => l === lock)).toHaveLength(1);
  });
});

// ——— Escort ——————————————————————————————————————————————————————————

describe("escort", () => {
  it("refuses panicked villagers and delivers calm ones to a Pos Siaga", () => {
    let s = toTurnsPhase(newGame());
    const pos = posSiagaIndex(s);
    const tile = tileNextToPosSiaga(s);
    const player = s.players[0];
    s = act(s, { type: "MOVE_PLAYER", playerId: player.id, targetTileIndex: tile.index });
    expect(s.players[0].position).toBe(tile.index);

    // Panicked villagers refuse to move.
    s.tiles[tile.index].occupants[0].status = "panicked";
    const villagerId = s.tiles[tile.index].occupants[0].id;
    let after = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: player.id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(after.evacuees).toHaveLength(0);
    expect(after.players[0].position).toBe(tile.index);

    // Calm them and the same escort works.
    s.tiles[tile.index].occupants[0].status = "calm";
    const apBefore = s.players[0].ap;
    after = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: player.id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(after.evacuees).toHaveLength(1);
    expect(after.evacuees[0].id).toBe(villagerId);
    expect(after.evacuees[0].status).toBe("rescued");
    expect(after.players[0].position).toBe(pos);
    expect(after.players[0].ap).toBe(apBefore - 1);
    expect(after.tiles[tile.index].occupants.find((v) => v.id === villagerId)).toBeUndefined();
  });

  it("lets Harimau move two villagers for a single AP", () => {
    let s = toTurnsPhase(newGame({ roles: ["sumatran_tiger", "andean_llama"] }));
    const pos = posSiagaIndex(s);
    const tile = tileNextToPosSiaga(s);
    const player = s.players[0];
    s = act(s, { type: "MOVE_PLAYER", playerId: player.id, targetTileIndex: tile.index });

    // Seed a second calm villager on the same tile.
    const extra: VillagerToken = { id: "w-extra", status: "calm", tileIndex: tile.index };
    s.tiles[tile.index].occupants.forEach((v) => (v.status = "calm"));
    s.tiles[tile.index].occupants.push(extra);
    const ids = s.tiles[tile.index].occupants.map((v) => v.id);
    expect(ids.length).toBeGreaterThanOrEqual(2);

    const apBefore = s.players[0].ap;
    const after = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: player.id,
      villagerIds: ids.slice(0, 2),
      targetTileIndex: pos,
    });
    expect(after.evacuees).toHaveLength(2);
    expect(after.players[0].ap).toBe(apBefore - 1);
  });

  it("caps everyone else at one villager per escort", () => {
    let s = toTurnsPhase(newGame({ roles: ["andean_llama", "bald_eagle"] }));
    const pos = posSiagaIndex(s);
    const tile = tileNextToPosSiaga(s);
    const player = s.players[0];
    s = act(s, { type: "MOVE_PLAYER", playerId: player.id, targetTileIndex: tile.index });
    const extra: VillagerToken = { id: "w-extra", status: "calm", tileIndex: tile.index };
    s.tiles[tile.index].occupants.forEach((v) => (v.status = "calm"));
    s.tiles[tile.index].occupants.push(extra);
    const ids = s.tiles[tile.index].occupants.map((v) => v.id).slice(0, 2);

    const after = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: player.id,
      villagerIds: ids,
      targetTileIndex: pos,
    });
    expect(after.evacuees).toHaveLength(0);
  });
});

// ——— Damage ————————————————————————————————————————————————————————

describe("2-stage tile damage", () => {
  it("cracks first, destroys second, and only then loses the villagers", () => {
    // dis_tek_02 damages one tile in sector merah every round.
    const opts = { disasterId: "dis_tec_02", newsId: TEAL_NEWS, verdict: "fact" as Verdict };
    let s = playRound(newGame({}), opts);
    expect(s.phase).toBe("p5_impact");

    const cracked = s.tiles.filter((t) => t.damage === 1);
    expect(cracked.length).toBeGreaterThan(0);
    const victim = cracked[0].index;
    const villagersThere = s.tiles[victim].occupants.length;
    expect(s.casualties).toHaveLength(0);

    s = act(s, { type: "ADVANCE_PHASE" }); // next round
    s = playRound(s, opts);

    expect(s.tiles[victim].damage).toBe(2);
    expect(s.tiles[victim].occupants).toHaveLength(0);
    expect(s.casualties.length).toBeGreaterThanOrEqual(villagersThere);
    for (const v of s.casualties) expect(v.status).toBe("lost");
  });

  it("never damages a Pos Siaga tile", () => {
    let s = newGame({});
    for (let round = 0; round < 4 && s.phase !== "game_over"; round++) {
      s = playRound(s, { newsId: TEAL_NEWS, verdict: "fact" });
      if (s.phase === "p5_impact") s = act(s, { type: "ADVANCE_PHASE" });
    }
    for (const tile of s.tiles) {
      if (tile.isReadyPost) expect(tile.damage).toBe(0);
    }
  });

  it("makes a Hancur tile impassable and a Retak tile cost more", () => {
    const s = toTurnsPhase(newGame());
    const player = s.players[0];
    const [rimTarget] = rimNeighbors(player.position, RING).filter(
      (i) => !s.tiles[i].isReadyPost
    );

    s.tiles[rimTarget].damage = 1;
    expect(moveCost(s, player.position, rimTarget, s.players[1])).toBe(2);

    s.tiles[rimTarget].damage = 2;
    const after = act(s, {
      type: "MOVE_PLAYER",
      playerId: player.id,
      targetTileIndex: rimTarget,
    });
    expect(after.players[0].position).toBe(player.position);
  });
});

// ——— Turn economy ————————————————————————————————————————————————————

describe("turn economy", () => {
  it("hands out 4 AP per player in Fase 3", () => {
    const s = toTurnsPhase(newGame({ roles: ["bald_eagle", "andean_llama", "sumatran_tiger"] }));
    for (const p of s.players) expect(p.ap).toBe(4);
  });

  it("passes the turn round the table and then opens Fase 4", () => {
    let s = toTurnsPhase(newGame({ roles: ["bald_eagle", "andean_llama", "sumatran_tiger"] }));
    expect(s.currentPlayerIndex).toBe(0);
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(s.currentPlayerIndex).toBe(1);
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(s.currentPlayerIndex).toBe(2);
    expect(s.phase).toBe("p3_turns");
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(s.phase).toBe("p4_verdict");
  });

  it("enforces the hand limit at end of turn (4, but 6 for Orangutan)", () => {
    let s = toTurnsPhase(newGame({ roles: ["andean_llama", "japanese_macaque"] }));
    s.players[0].hand = Array.from({ length: 9 }, () => evidenceIdFor("WHO"));
    s.players[1].hand = Array.from({ length: 9 }, () => evidenceIdFor("WHO"));
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(s.players[0].hand).toHaveLength(4);
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(s.players[1].hand).toHaveLength(6);
  });

  it("spends AP on investigate and refuses actions without enough AP", () => {
    let s = toTurnsPhase(newGame());
    const id = s.players[0].id;
    const handBefore = s.players[0].hand.length;
    s = act(s, { type: "INVESTIGATE", playerId: id });
    expect(s.players[0].ap).toBe(3);
    expect(s.players[0].hand).toHaveLength(handBefore + 1);

    s.players[0].ap = 0;
    const after = act(s, { type: "INVESTIGATE", playerId: id });
    expect(after.players[0].hand).toHaveLength(handBefore + 1);
  });

  it("guards actions to their own phase", () => {
    const s = newGame(); // still p1_disaster
    const before = s.players[0].position;
    const after = act(s, {
      type: "MOVE_PLAYER",
      playerId: s.players[0].id,
      targetTileIndex: (before + 1) % s.tiles.length,
    });
    expect(after.players[0].position).toBe(before);
    expect(act(s, { type: "DRAW_NEWS" }).activeNews).toBeNull();
  });
});

// ——— Role abilities ————————————————————————————————————————————————

describe("active abilities", () => {
  it("is limited to once per round", () => {
    let s = toTurnsPhase(newGame({ roles: ["bald_eagle", "andean_llama"] }));
    s = act(s, { type: "USE_ACTIVE_ABILITY", playerId: s.players[0].id, deck: "disaster" });
    expect(s.players[0].activeUsedThisRound).toBe(true);
    expect(s.peek?.kind).toBe("disaster");

    s = act(s, { type: "CLEAR_PEEK" });
    s = act(s, { type: "USE_ACTIVE_ABILITY", playerId: s.players[0].id, deck: "news" });
    expect(s.peek).toBeNull();
  });

  it("lets Komodo calm up to 3 panicked villagers at once for 0 AP", () => {
    let s = toTurnsPhase(newGame({ roles: ["andean_llama", "bald_eagle"] }));
    const tile = tileNextToPosSiaga(s);
    const player = s.players[0];
    s = act(s, { type: "MOVE_PLAYER", playerId: player.id, targetTileIndex: tile.index });
    for (let i = 0; i < 3; i++) {
      s.tiles[tile.index].occupants.push({
        id: `panic-${i}`,
        status: "panicked",
        tileIndex: tile.index,
      });
    }
    const apBefore = s.players[0].ap;
    s = act(s, { type: "USE_ACTIVE_ABILITY", playerId: player.id });
    expect(s.players[0].ap).toBe(apBefore);
    expect(s.tiles[tile.index].occupants.filter((v) => v.status === "panicked")).toHaveLength(0);
  });

  it("lets Orangutan force a lock open by discarding two evidence cards", () => {
    const newsId = "news_soc_01";
    let s = toTurnsPhase(newGame({ roles: ["japanese_macaque", "andean_llama"] }), { newsId });
    const dataMiningLock = s.activeNews!.locks[0];
    const a = evidenceIdFor("WHY");
    const b = evidenceIdFor("WHO");
    s.players[0].hand.push(a, b);
    s = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      evidenceIds: [a, b],
      lock: dataMiningLock,
    });
    expect(s.locksOpened).toContain(dataMiningLock);
  });
});

// ——— Resources ————————————————————————————————————————————————————

describe("discard for resource", () => {
  it("grants +2 AP for a Sprint Darurat card", () => {
    let s = toTurnsPhase(newGame());
    const card = evidenceCards.find((c) => c.resourceKind === "ap2")!;
    s.players[0].hand.push(card.id);
    const apBefore = s.players[0].ap;
    s = act(s, {
      type: "DISCARD_FOR_RESOURCE",
      playerId: s.players[0].id,
      evidenceId: card.id,
    });
    expect(s.players[0].ap).toBe(apBefore + 2);
  });

  it("raises a panic shield that blocks the rumour_spreads panic tick", () => {
    const newsId = "news_soc_01";
    let s = toTurnsPhase(newGame(), { newsId });
    const card = evidenceCards.find((c) => c.resourceKind === "panic_shield")!;
    s.players[0].hand.push(card.id);
    s = act(s, {
      type: "DISCARD_FOR_RESOURCE",
      playerId: s.players[0].id,
      evidenceId: card.id,
    });
    expect(s.panicShield).toBe(true);

    s = endAllTurns(s);
    s = act(s, { type: "COMMIT_VERDICT", verdict: "fact" });
    s = act(s, { type: "FLIP_NEWS" });
    expect(s.lastOutcome).toBe("rumour_spreads");
    expect(s.panicMeter).toBe(0);
  });
});

// ——— Rewards ————————————————————————————————————————————————————————

describe("reputation economy", () => {
  it("buys a Reward card in Fase 5 and spends the reputation", () => {
    let s = playRound(newGame({}), {
      newsId: TEAL_NEWS,
      verdict: "fact",
    });
    expect(s.phase).toBe("p5_impact");
    s = act(s, { type: "DEBUG_SET_REPUTATION", value: 9 });
    s = act(s, { type: "BUY_REWARD", rewardId: "rew_peta_evakuasi" });
    expect(s.ownedRewards).toContain("rew_peta_evakuasi");
    expect(s.reputation).toBe(7);

    // Not affordable / already owned -> no change.
    const again = act(s, { type: "BUY_REWARD", rewardId: "rew_peta_evakuasi" });
    expect(again.reputation).toBe(7);
    expect(again.ownedRewards).toHaveLength(1);
  });
});

// ——— Win / lose ————————————————————————————————————————————————————

describe("game over", () => {
  it("menang: reaching the evacuation target", () => {
    let s = toTurnsPhase(newGame({}));
    const target = scenarioById[SCENARIO_ID].targetEvacuation;
    const pos = posSiagaIndex(s);
    const tile = tileNextToPosSiaga(s);
    s = act(s, {
      type: "MOVE_PLAYER",
      playerId: s.players[0].id,
      targetTileIndex: tile.index,
    });
    // One short of the target, then walk the last villager in.
    s.evacuees = Array.from({ length: target - 1 }, (_, i) => ({
      id: `pre-${i}`,
      status: "rescued" as const,
      tileIndex: pos,
    }));
    s.tiles[tile.index].occupants.forEach((v) => (v.status = "calm"));
    const villagerId = s.tiles[tile.index].occupants[0].id;
    s = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: s.players[0].id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(s.evacuees).toHaveLength(target);
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("win");
  });

  it("panik: the panic meter maxes out", () => {
    let s = toTurnsPhase(newGame());
    s = act(s, { type: "DEBUG_SET_PANIC", value: s.panicMeterMax });
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("panic");
  });

  it("korban: too few villagers left to ever reach the target", () => {
    let s = toTurnsPhase(newGame({}));
    for (const tile of s.tiles) tile.occupants = [];
    s.evacuees = [];
    s = act(s, { type: "DEBUG_SET_PANIC", value: 0 });
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("casualties");
  });

  it("waktu: the disaster deck runs out before the target is met", () => {
    let s = newGame({});
    s = act(s, { type: "DEBUG_SET_DISASTER_TOP", cardId: CALM_DISASTER });
    s = act(s, { type: "DEBUG_TRIM_DISASTER_DECK" });
    expect(s.decks.disaster).toHaveLength(1);

    s = playRound(s, { newsId: TEAL_NEWS, verdict: "fact" });
    expect(s.decks.disaster).toHaveLength(0);
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("timeout");
  });

  it("checkGameOver reports every reason from a raw state", () => {
    const base = newGame({});
    expect(checkGameOver(base).over).toBe(false);

    const won = structuredClone(base);
    won.evacuees = Array.from({ length: scenarioById[SCENARIO_ID].targetEvacuation }, (_, i) => ({
      id: `e${i}`,
      status: "rescued" as const,
      tileIndex: 0,
    }));
    expect(checkGameOver(won)).toEqual({ over: true, reason: "win" });

    const panicked = structuredClone(base);
    panicked.panicMeter = panicked.panicMeterMax;
    expect(checkGameOver(panicked)).toEqual({ over: true, reason: "panic" });

    const wiped = structuredClone(base);
    for (const t of wiped.tiles) t.occupants = [];
    expect(checkGameOver(wiped)).toEqual({ over: true, reason: "casualties" });

    const outOfTime = structuredClone(base);
    outOfTime.decks.disaster = [];
    expect(checkGameOver(outOfTime, { endOfRound: true })).toEqual({
      over: true,
      reason: "timeout",
    });
    // ...but not mid-round, while the current round is still being played.
    expect(checkGameOver(outOfTime).over).toBe(false);
  });

  it("freezes the state once the game is over", () => {
    let s = toTurnsPhase(newGame());
    s = act(s, { type: "DEBUG_SET_PANIC", value: s.panicMeterMax });
    const frozen = act(s, { type: "ADVANCE_PHASE" });
    expect(frozen).toBe(s);
  });
});

// ——— Sub-missions ——————————————————————————————————————————————————
//
// There was no coverage here at all, which is how two of the six shipped
// permanently unreachable: the Sumatran Tiger's counted an escort the reducer
// refuses two lines earlier, and the Whale Shark's needed villagers on a Sea
// Lane tile that nothing could put them on. Every key gets a test now.

describe("sub-missions: every key can actually be advanced", () => {
  it("🐯 rescue_crisis counts villagers pulled out of the round's news sector", () => {
    const newsId = newsIdForSector("sunda");
    let s = toTurnsPhase(newGame({ roles: ["sumatran_tiger", "andean_llama"] }), { newsId });
    expect(s.activeNews?.targetSectorId).toBe("sunda");

    const tile = tileInSectorNextToPosSiaga(s, "sunda");
    const pos = posSiagaNextTo(s, tile.index);
    s = stage(s, 0, tile.index);
    const villagerId = s.tiles[tile.index].occupants[0].id;
    expect(progressOf(s, 0)).toBe(0);

    s = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: s.players[0].id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(s.evacuees).toHaveLength(1);
    expect(progressOf(s, 0)).toBe(1);
  });

  it("🐯 rescue_crisis ignores a rescue out of any other sector", () => {
    const newsId = newsIdForSector("sunda");
    let s = toTurnsPhase(newGame({ roles: ["sumatran_tiger", "andean_llama"] }), { newsId });
    const tile = tileInSectorNextToPosSiaga(s, "cascadia");
    const pos = posSiagaNextTo(s, tile.index);
    s = stage(s, 0, tile.index);
    const villagerId = s.tiles[tile.index].occupants[0].id;

    s = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: s.players[0].id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(s.evacuees).toHaveLength(1);
    expect(progressOf(s, 0)).toBe(0);
  });

  it("🐯 the old reading was unreachable: a Crisis Token refuses the escort outright", () => {
    // The guard this whole redefinition exists to preserve. If it ever stops
    // holding, the media-literacy mechanic becomes optional.
    const newsId = newsIdForSector("sunda");
    let s = toTurnsPhase(newGame({ roles: ["sumatran_tiger", "andean_llama"] }), { newsId });
    const tile = tileInSectorNextToPosSiaga(s, "sunda");
    const pos = posSiagaNextTo(s, tile.index);
    s = stage(s, 0, tile.index);
    s.tiles[tile.index].hasCrisisToken = true;
    const villagerId = s.tiles[tile.index].occupants[0].id;

    const after = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: s.players[0].id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(after.evacuees).toHaveLength(0);
    expect(progressOf(after, 0)).toBe(0);
    expect(after.tiles[tile.index].occupants.map((v) => v.id)).toContain(villagerId);
  });

  it("🦅 critical_mapping counts each damaged tile once, not each visit", () => {
    let s = toTurnsPhase(newGame({ roles: ["bald_eagle", "andean_llama"] }));
    const damaged = s.tiles.find((t) => !t.isReadyPost && !t.isSeaLane)!.index;
    s = stage(s, 0, damaged);
    s.tiles[damaged].damage = 1;

    s = act(s, { type: "END_PLAYER_TURN" });
    expect(progressOf(s, 0)).toBe(1);

    // Round the table and stand on the very same tile again.
    s = act(s, { type: "END_PLAYER_TURN" });
    s = act(s, { type: "DEBUG_SET_PHASE", phase: "p3_turns" });
    s = stage(s, 0, damaged);
    s = act(s, { type: "END_PLAYER_TURN" });
    expect(progressOf(s, 0)).toBe(1);
  });

  it("🐒 collect_3pt snapshots three 3-point cards held at once", () => {
    let s = toTurnsPhase(newGame({ roles: ["japanese_macaque", "andean_llama"] }));
    const threePointer = evidenceCards.find((c) => c.points === 3)!.id;
    s.players[0].hand = [threePointer, threePointer, threePointer];
    s = act(s, { type: "INVESTIGATE", playerId: s.players[0].id });
    expect(progressOf(s, 0)).toBeGreaterThanOrEqual(3);
  });

  it("🦙 calm_six counts one per calm, and three at once for Calm the Crowd", () => {
    let s = toTurnsPhase(newGame({ roles: ["andean_llama", "bald_eagle"] }));
    const tile = tileNextToPosSiaga(s);
    s = stage(s, 0, tile.index);
    for (let i = 0; i < 4; i++) {
      s.tiles[tile.index].occupants.push({
        id: `panic-${i}`,
        status: "panicked",
        tileIndex: tile.index,
      });
    }
    s = act(s, {
      type: "CALM_VILLAGER",
      playerId: s.players[0].id,
      villagerId: "panic-0",
    });
    expect(progressOf(s, 0)).toBe(1);

    s = act(s, { type: "USE_ACTIVE_ABILITY", playerId: s.players[0].id });
    expect(progressOf(s, 0)).toBe(4); // 1 + the 3 the ability settles
  });

  it("🦜 catalyst counts a bartered card that cracks the news the same round", () => {
    const newsId = "news_soc_01";
    // Pin the Disaster too: an unpinned draw can land on a block_trade round,
    // which refuses the barter this test is about.
    let s = toTurnsPhase(newGame({ roles: ["kea_parrot", "andean_llama"] }), {
      newsId,
      disasterId: "dis_tec_01",
    });
    const lock = s.activeNews!.locks[0];
    const key = evidenceIdFor(lock);
    const spare = evidenceIdFor(s.activeNews!.locks[1]);
    s.players[0].hand = [spare];
    s.players[1].hand = [key];
    // BARTER is refused unless the barterer is the Guardian whose turn it is.
    s.currentPlayerIndex = 0;

    s = act(s, {
      type: "BARTER",
      playerId: s.players[0].id,
      withPlayerId: s.players[1].id,
      giveCardId: spare,
      takeCardId: key,
    });
    expect(s.players[0].hand).toContain(key);

    s = act(s, {
      type: "PLAY_EVIDENCE_LOCK",
      playerId: s.players[0].id,
      evidenceId: key,
      lock,
    });
    expect(s.locksOpened).toContain(lock);
    expect(progressOf(s, 0)).toBe(1);
  });

  it("pays +2 Reputation in Phase 5, exactly once", () => {
    const newsId = newsIdForSector("sunda");
    let s = toTurnsPhase(newGame({ roles: ["sumatran_tiger", "andean_llama"] }), { newsId });
    const target = roleById.sumatran_tiger.subMissionTarget;
    const tile = tileInSectorNextToPosSiaga(s, "sunda");
    const pos = posSiagaNextTo(s, tile.index);
    s = stage(s, 0, tile.index);
    s.players[0].subMissionProgress = target - 1;
    const villagerId = s.tiles[tile.index].occupants[0].id;

    s = act(s, {
      type: "ESCORT_VILLAGER",
      playerId: s.players[0].id,
      villagerIds: [villagerId],
      targetTileIndex: pos,
    });
    expect(progressOf(s, 0)).toBe(target);
    expect(s.players[0].subMissionDone).toBe(false); // awarded in Phase 5, not on the spot

    const reputationBefore = s.reputation;
    s = endAllTurns(s);
    s = act(s, { type: "COMMIT_VERDICT", verdict: "abstain" });
    s = act(s, { type: "FLIP_NEWS" });
    s = act(s, { type: "ADVANCE_PHASE" });
    expect(s.phase).toBe("p5_impact");
    expect(s.players[0].subMissionDone).toBe(true);
    expect(s.reputation).toBe(reputationBefore + 2);
    expect(s.stats.subMissionsDone).toBe(1);

    // A second Phase 5 must not pay for the same Sub-Mission again.
    const repAfter = s.reputation;
    s = act(s, { type: "ADVANCE_PHASE" });
    s = playRound(s, { newsId, verdict: "abstain" });
    expect(s.stats.subMissionsDone).toBe(1);
    expect(s.reputation).toBeLessThanOrEqual(repAfter + 1); // +1 verification at most
  });
});

// ——— 🐋 Whale Shark ————————————————————————————————————————————————

describe("Whale Shark: Open Water and Deep Current", () => {
  it("passive: the Navigator crosses for 1 AP where everyone else pays 2", () => {
    const s = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const navigator = s.players[0];
    const other = s.players[1];
    expect(seaLaneCost(s, navigator)).toBe(1);
    expect(seaLaneCost(s, other)).toBe(2);
    expect(seaLaneCost(s)).toBe(2);

    const from = navigator.position;
    const [to] = seaLaneNeighbors(from, scenarioById[SCENARIO_ID]);
    expect(moveCost(s, from, to, navigator, true)).toBe(1);
    expect(moveCost(s, from, to, other, true)).toBe(2);

    const apBefore = navigator.ap;
    const after = act(s, {
      type: "MOVE_PLAYER",
      playerId: navigator.id,
      targetTileIndex: to,
      viaSeaLane: true,
    });
    expect(after.players[0].position).toBe(to);
    expect(after.players[0].ap).toBe(apBefore - 1);
  });

  it("Deep Current is the only way a villager ever reaches a Sea Lane tile", () => {
    let s = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const scenario = scenarioById[SCENARIO_ID];
    // Nothing starts in the water, and no ordinary action can put anyone there.
    for (const i of scenario.seaLaneIndices) expect(s.tiles[i].occupants).toHaveLength(0);

    const mouth = s.players[0].position;
    const lane = seaLaneNeighbors(mouth, scenario).find((i) => scenario.seaLaneIndices.includes(i))!;
    const source = rimNeighbors(mouth, RING).find(
      (i) => s.tiles[i].occupants.length > 0
    )!;
    s.tiles[source].occupants.forEach((v) => (v.status = "calm"));
    const villagerId = s.tiles[source].occupants[0].id;

    const options = openWaterOptions(s, s.players[0]);
    expect(options.some((o) => o.villagerId === villagerId && o.toIndex === lane)).toBe(true);

    const apBefore = s.players[0].ap;
    s = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      villagerId,
      targetTileIndex: lane,
    });
    expect(s.tiles[lane].occupants.map((v) => v.id)).toContain(villagerId);
    expect(s.tiles[source].occupants.map((v) => v.id)).not.toContain(villagerId);
    expect(s.players[0].ap).toBe(apBefore); // 0 AP
    expect(s.players[0].activeUsedThisRound).toBe(true);
  });

  it("carries that villager across the lane and credits safe_passage on arrival", () => {
    let s = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const scenario = scenarioById[SCENARIO_ID];
    const mouth = s.players[0].position;
    const chain = [mouth, ...scenario.seaLaneIndices];
    const farMouth = scenario.seaLaneEndpoints.find((i) => i !== mouth)!;
    const source = rimNeighbors(mouth, RING).find(
      (i) => s.tiles[i].occupants.length > 0
    )!;
    s.tiles[source].occupants.forEach((v) => (v.status = "calm"));
    const villagerId = s.tiles[source].occupants[0].id;

    s = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      villagerId,
      targetTileIndex: chain[1],
    });
    // Swim out to meet them, then walk them the length of the lane. 1 AP a hop
    // for the Navigator, so the whole crossing fits inside one turn's 4 AP.
    s = act(s, {
      type: "MOVE_PLAYER",
      playerId: s.players[0].id,
      targetTileIndex: chain[1],
      viaSeaLane: true,
    });
    const hops = [...scenario.seaLaneIndices.slice(1), farMouth];
    for (const next of hops) {
      s = act(s, {
        type: "ESCORT_VILLAGER",
        playerId: s.players[0].id,
        villagerIds: [villagerId],
        targetTileIndex: next,
        viaSeaLane: true,
      });
    }
    expect(s.players[0].position).toBe(farMouth);
    expect(s.evacuees.map((v) => v.id)).toContain(villagerId);
    expect(progressOf(s, 0)).toBe(1);
    expect(s.players[0].ap).toBeGreaterThanOrEqual(0);
  });

  it("delivers straight to the far Ready Post from the last lane tile", () => {
    let s = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const scenario = scenarioById[SCENARIO_ID];
    const last = scenario.seaLaneIndices[scenario.seaLaneIndices.length - 1];
    const farMouth = seaLaneNeighbors(last, scenario).find((i) => s.tiles[i].isReadyPost)!;
    s = stage(s, 0, last);
    s.tiles[last].occupants.push({ id: "swimmer", status: "calm", tileIndex: last });

    const option = openWaterOptions(s, s.players[0]).find(
      (o) => o.villagerId === "swimmer" && o.toIndex === farMouth
    );
    expect(option?.rescues).toBe(true);

    s = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      villagerId: "swimmer",
      targetTileIndex: farMouth,
    });
    expect(s.evacuees.map((v) => v.id)).toContain("swimmer");
    expect(progressOf(s, 0)).toBe(1);
  });

  it("refuses a Crisis Token tile, exactly like an ordinary escort", () => {
    const s = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const mouth = s.players[0].position;
    const source = rimNeighbors(mouth, RING).find(
      (i) => s.tiles[i].occupants.length > 0
    )!;
    s.tiles[source].occupants.forEach((v) => (v.status = "calm"));
    const villagerId = s.tiles[source].occupants[0].id;
    s.tiles[source].hasCrisisToken = true;

    expect(openWaterOptions(s, s.players[0]).some((o) => o.villagerId === villagerId)).toBe(
      false
    );
    const after = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      villagerId,
      targetTileIndex: seaLaneNeighbors(mouth, scenarioById[SCENARIO_ID])[0],
    });
    expect(after.tiles[source].occupants.map((v) => v.id)).toContain(villagerId);
    // A refusal must not burn the once-per-round ability either.
    expect(after.players[0].activeUsedThisRound).toBe(false);
  });

  it("refuses panicked villagers and a lane closed by an oceanic disaster", () => {
    const calm = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }));
    const mouth = calm.players[0].position;
    rimNeighbors(mouth, RING).forEach((i) =>
      calm.tiles[i].occupants.forEach((v) => (v.status = "panicked"))
    );
    expect(openWaterOptions(calm, calm.players[0])).toHaveLength(0);

    const stormy = toTurnsPhase(newGame({ roles: ["whale_shark", "bald_eagle"] }), {
      disasterId: "dis_oce_01",
    });
    expect(isSeaLaneOpen(stormy)).toBe(false);
    stormy.tiles.forEach((t) => t.occupants.forEach((v) => (v.status = "calm")));
    expect(openWaterOptions(stormy, stormy.players[0])).toHaveLength(0);
  });

  it("offers nothing to a Guardian who is not the Navigator", () => {
    const s = toTurnsPhase(newGame({ roles: ["bald_eagle", "andean_llama"] }));
    expect(openWaterOptions(s, s.players[0])).toHaveLength(0);
  });
});

// ——— 🦜 Network Sync ————————————————————————————————————————————————

describe("Kea Parrot: Network Sync", () => {
  it("swaps the two named cards, not just a look at the hand", () => {
    let s = toTurnsPhase(newGame({ roles: ["kea_parrot", "andean_llama"] }));
    const mine = evidenceIdFor("WHO");
    const theirs = evidenceIdFor("WHY");
    s.players[0].hand = [mine];
    s.players[1].hand = [theirs];

    s = act(s, {
      type: "USE_ACTIVE_ABILITY",
      playerId: s.players[0].id,
      targetPlayerId: s.players[1].id,
      evidenceIds: [mine, theirs],
    });
    expect(s.players[0].hand).toEqual([theirs]);
    expect(s.players[1].hand).toEqual([mine]);
    expect(s.peek).toEqual({ kind: "hand", playerId: s.players[1].id });
    expect(s.players[0].activeUsedThisRound).toBe(true);
  });
});

// ——— Escort refusals ————————————————————————————————————————————————

describe("escort refusals carry a reason", () => {
  it("names the Crisis Token first, then the news lock, then the disaster", () => {
    const s = toTurnsPhase(newGame(), { disasterId: "dis_tec_03" });
    const from = s.tiles.find((t) => !t.isReadyPost && !t.isSeaLane)!;
    const to = s.tiles[rimNeighbors(from.index, RING)[0]];
    expect(escortRefusal(s, from, to)).toBeNull();

    const locked = structuredClone(s);
    locked.tiles[from.index].evacuationLocked = true;
    expect(escortRefusal(locked, locked.tiles[from.index], locked.tiles[to.index])).toBe(
      "evacuation_locked"
    );

    const crisis = structuredClone(locked);
    crisis.tiles[from.index].hasCrisisToken = true;
    expect(escortRefusal(crisis, crisis.tiles[from.index], crisis.tiles[to.index])).toBe(
      "crisis_token"
    );
  });

  it("reports block_escort for a sector the disaster has cut off", () => {
    const s = toTurnsPhase(newGame(), { disasterId: "dis_atm_01" });
    if (s.activeDisaster?.roundEffectKey !== "block_escort") return;
    const sectors = s.activeDisaster.affectedSectorIds;
    const from = s.tiles.find(
      (t) => t.sectorId !== null && (sectors.length === 0 || sectors.includes(t.sectorId))
    )!;
    const to = s.tiles[rimNeighbors(from.index, RING)[0]];
    expect(escortRefusal(s, from, to)).toBe("block_escort");
  });
});

// ——— Reward duplicates ————————————————————————————————————————————————

describe("Reward shop: no dead purchases", () => {
  /** Every effect key is printed on two cards; only one of each can do anything. */
  function toShop(): GameState {
    let s = playRound(newGame({}), { newsId: TEAL_NEWS, verdict: "fact" });
    expect(s.phase).toBe("p5_impact");
    s = act(s, { type: "DEBUG_SET_REPUTATION", value: 15 });
    return s;
  }

  it("refuses a second card carrying the same standing bonus, and keeps the Reputation", () => {
    let s = toShop();
    s = act(s, { type: "BUY_REWARD", rewardId: "rew_peta_evakuasi" }); // sea_lane_cheap, 2
    expect(s.ownedRewards).toContain("rew_peta_evakuasi");
    const repAfterFirst = s.reputation;

    // rew_dermaga_darurat carries the identical effect for 3 more Reputation.
    s = act(s, { type: "BUY_REWARD", rewardId: "rew_dermaga_darurat" });
    expect(s.ownedRewards).not.toContain("rew_dermaga_darurat");
    expect(s.reputation).toBe(repAfterFirst);
  });

  it("covers all four duplicated standing bonuses", () => {
    const pairs: [string, string][] = [
      ["rew_peta_evakuasi", "rew_dermaga_darurat"],       // sea_lane_cheap
      ["rew_pengeras_suara_desa", "rew_sekolah_siaga"],   // calm_cheap
      ["rew_radio_komunitas", "rew_drone_pemantau"],      // ap_up
      ["rew_pusat_data_warga", "rew_jaringan_relawan"],   // hand_limit_up
    ];
    for (const [first, second] of pairs) {
      let s = toShop();
      s = act(s, { type: "BUY_REWARD", rewardId: first });
      const rep = s.reputation;
      s = act(s, { type: "BUY_REWARD", rewardId: second });
      expect(s.ownedRewards, `${second} after ${first}`).not.toContain(second);
      expect(s.reputation, `${second} after ${first}`).toBe(rep);
    }
  });

  it("still allows a second clear_chaos, because that one is a one-shot", () => {
    let s = toShop();
    s = act(s, { type: "BUY_REWARD", rewardId: "rew_kampanye_klarifikasi" });
    s = act(s, { type: "BUY_REWARD", rewardId: "rew_klinik_lapangan" });
    expect(s.ownedRewards).toContain("rew_kampanye_klarifikasi");
    expect(s.ownedRewards).toContain("rew_klinik_lapangan");
  });
});

// ——— Smoke test ————————————————————————————————————————————————————

describe("full game smoke test", () => {
  it("plays many rounds to a terminal state without throwing", () => {
    const verdicts: Verdict[] = ["hoax", "fact", "abstain"];
    let s = newGame({ roles: ["bald_eagle", "japanese_macaque", "sumatran_tiger", "kea_parrot", "andean_llama"], seed: 42 });
    let guard = 0;

    while (s.phase !== "game_over" && guard < 60) {
      guard++;
      s = act(s, { type: "DRAW_DISASTER" });
      if (s.phase === "game_over") break;
      s = act(s, { type: "ADVANCE_PHASE" });
      s = act(s, { type: "DRAW_NEWS" });
      s = act(s, { type: "ADVANCE_PHASE" });

      // Everyone investigates once, then ends their turn.
      for (let i = 0; i < s.players.length; i++) {
        const p = s.players[s.currentPlayerIndex];
        s = act(s, { type: "INVESTIGATE", playerId: p.id });
        s = act(s, { type: "END_PLAYER_TURN" });
      }
      expect(s.phase).toBe("p4_verdict");

      if (s.activeNews) {
        for (const lock of s.activeNews.locks) {
          if (guard % 2 === 0) s = openLock(s, lock);
        }
      }
      s = act(s, { type: "COMMIT_VERDICT", verdict: verdicts[guard % verdicts.length] });
      s = act(s, { type: "FLIP_NEWS" });
      if (s.phase === "game_over") break;

      s = act(s, { type: "ADVANCE_PHASE" }); // -> p5_impact
      if (s.phase === "game_over") break;
      s = act(s, { type: "ADVANCE_PHASE" }); // -> next round
    }

    expect(s.phase).toBe("game_over");
    expect(["win", "panic", "casualties", "timeout"]).toContain(s.gameOverReason);
    expect(s.round).toBeGreaterThan(1);
    // Bookkeeping stayed coherent all the way through.
    const scenario = scenarioById[SCENARIO_ID];
    const accounted =
      villagerCountOnBoard(s) + s.evacuees.length + s.casualties.length;
    expect(accounted).toBe(scenario.totalVillagers);
    for (const p of s.players) expect(p.ap).toBeGreaterThanOrEqual(0);
    expect(s.panicMeter).toBeGreaterThanOrEqual(0);
    expect(s.log.length).toBeGreaterThan(10);
  });

  it("rotates the first player each round", () => {
    let s = playRound(newGame({}), {
      newsId: TEAL_NEWS,
      verdict: "fact",
    });
    expect(s.firstPlayerIndex).toBe(0);
    s = act(s, { type: "ADVANCE_PHASE" });
    expect(s.round).toBe(2);
    expect(s.firstPlayerIndex).toBe(1 % s.players.length);
    expect(s.phase).toBe("p1_disaster");
    expect(s.activeDisaster).toBeNull();
    expect(s.activeNews).toBeNull();
    expect(s.verdict).toBeNull();
    expect(s.newsRevealed).toBe(false);
  });
});
