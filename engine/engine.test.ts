// ============================================================================
// RING OF FIRE v2 — engine tests.
// Board features are located dynamically (search for a Pos Siaga, a tile with
// villagers) so these survive data tweaks.
// ============================================================================
import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import {
  checkGameOver,
  isSeaLaneOpen,
  moveCost,
  resolveVerdict,
  rimNeighbors,
  seaLaneNeighbors,
} from "./rules";
import type {
  EvidenceCategory,
  GameAction,
  GameState,
  TileState,
  Verdict,
  VillagerToken,
} from "./types";
import { evidenceCards, wildcardEvidenceId } from "@/data/evidenceCards";
import { newsCardById } from "@/data/newsCards";
import { scenarioById } from "@/data/scenarios";

// ——— Harness ————————————————————————————————————————————————————————

const SCENARIO_ID = Object.keys(scenarioById)[0];

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
  const neighbour = rimNeighbors(pos, state.tiles.length)
    .map((i) => state.tiles[i])
    .find((t) => !t.isReadyPost && t.occupants.length > 0);
  expect(neighbour).toBeTruthy();
  return neighbour!;
}

function villagerCountOnBoard(state: GameState): number {
  return state.tiles.reduce((n, t) => n + t.occupants.length, 0);
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

  it("uses one single difficulty — no presets", () => {
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
    expect(rimNeighbors(from, s.tiles.length)).not.toContain(to);

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

describe("Commit & Flip — the three outcomes", () => {
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
    const [rimTarget] = rimNeighbors(player.position, s.tiles.length).filter(
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
  it("menang — reaching the evacuation target", () => {
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

  it("panik — the panic meter maxes out", () => {
    let s = toTurnsPhase(newGame());
    s = act(s, { type: "DEBUG_SET_PANIC", value: s.panicMeterMax });
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("panic");
  });

  it("korban — too few villagers left to ever reach the target", () => {
    let s = toTurnsPhase(newGame({}));
    for (const tile of s.tiles) tile.occupants = [];
    s.evacuees = [];
    s = act(s, { type: "DEBUG_SET_PANIC", value: 0 });
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("casualties");
  });

  it("waktu — the disaster deck runs out before the target is met", () => {
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
