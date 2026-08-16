// ============================================================================
// RING OF FIRE v2 — balance & educational-integrity guards.
//
// These are not correctness tests; they protect two design properties that are
// easy to break accidentally while rebalancing:
//   1. A competent team CAN win (the demo is not a brick wall).
//   2. A team that ignores verification MOSTLY CANNOT win — MIL must stay
//      load-bearing, not decorative. If someone raises AP, lowers costs, or
//      weakens the Crisis Token lock, this test is what catches it.
// ============================================================================
import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import { allNeighbors, isPassable, rimNeighbors } from "./rules";
import type { GameAction, GameState } from "./types";
import { scenarioById } from "@/data/scenarios";
import { roleById } from "@/data/roles";
import { evidenceCards } from "@/data/evidenceCards";

const SID = Object.keys(scenarioById)[0];
const go = (s: GameState, a: GameAction) => reduce(s, a)!;

/** The reference table the balance numbers are tuned against. */
const FULL_TABLE = ["bald_eagle", "japanese_macaque", "sumatran_tiger", "andean_llama"];
/** The smallest table the game supports, added when minPlayers dropped to 2. */
const DUO_TABLE = ["bald_eagle", "andean_llama"];
const TRIO_TABLE = ["bald_eagle", "andean_llama", "sumatran_tiger"];

function start(seed: number, roster: readonly string[] = FULL_TABLE): GameState {
  return reduce(null, {
    type: "START_GAME",
    scenarioId: SID,
    players: roster.map((r, i) => ({ name: `P${i + 1}`, roleId: r })),
    seed,
  } as GameAction)!;
}

/** BFS hop count over passable tiles, respecting open sea routes. */
function dist(s: GameState, from: number, to: number): number {
  if (from === to) return 0;
  const seen = new Set([from]);
  let frontier = [from];
  let d = 0;
  while (frontier.length && d < 40) {
    d++;
    const next: number[] = [];
    for (const i of frontier) {
      for (const n of allNeighbors(s, i)) {
        if (seen.has(n) || !isPassable(s.tiles[n])) continue;
        if (n === to) return d;
        seen.add(n);
        next.push(n);
      }
    }
    frontier = next;
  }
  return 99;
}

function nearestPosSiaga(s: GameState, from: number): number {
  let best = -1;
  let bd = 99;
  s.tiles.forEach((t, i) => {
    if (!t.isReadyPost) return;
    const d = dist(s, from, i);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** One step of a greedy rescue bot for the active player. Returns null if it should pass. */
function rescueStep(s: GameState): GameAction | null {
  const p = s.players[s.currentPlayerIndex];
  const tile = s.tiles[p.position];

  // A competent team uses its free once-per-round abilities. The Andean Llama
  // clearing a Crisis Token matters most: an unresolved rumour locks evacuation
  // out of that tile entirely, so without this the bot strands whole sectors.
  if (!p.activeUsedThisRound) {
    const role = roleById[p.roleId];
    if (role?.activeKey === "suppress" && (tile.hasCrisisToken || tile.occupants.some((v) => v.status === "panicked"))) {
      return { type: "USE_ACTIVE_ABILITY", playerId: p.id };
    }
    if (role?.activeKey === "tactical_escort" && tile.occupants.length > 0) {
      return { type: "USE_ACTIVE_ABILITY", playerId: p.id };
    }
  }

  // Escort a calm villager toward safety.
  const calm = tile.occupants.filter((v) => v.status === "calm");
  if (calm.length > 0) {
    const goal = nearestPosSiaga(s, p.position);
    if (goal >= 0) {
      const opts = allNeighbors(s, p.position).filter((n) => isPassable(s.tiles[n]));
      let bestN = -1, bd = dist(s, p.position, goal);
      for (const n of opts) {
        const d = dist(s, n, goal);
        if (d < bd) { bd = d; bestN = n; }
      }
      if (bestN >= 0) {
        const carry = calm.slice(0, roleById[p.roleId]?.activeKey === "tactical_escort" ? 2 : 1).map((v) => v.id);
        return {
          type: "ESCORT_VILLAGER",
          playerId: p.id,
          villagerIds: carry,
          targetTileIndex: bestN,
          viaSeaLane: !rimNeighbors(p.position, scenarioById[SID].ringSize).includes(bestN),
        };
      }
    }
  }

  // Calm a panicking villager here.
  const panicked = tile.occupants.find((v) => v.status === "panicked");
  if (panicked) {
    return { type: "CALM_VILLAGER", playerId: p.id, villagerId: panicked.id };
  }

  // Walk toward the nearest villager still on the board.
  let target = -1, td = 99;
  s.tiles.forEach((t, i) => {
    if (t.occupants.length === 0 || t.isReadyPost) return;
    const d = dist(s, p.position, i);
    if (d < td) { td = d; target = i; }
  });
  if (target >= 0) {
    const opts = allNeighbors(s, p.position).filter((n) => isPassable(s.tiles[n]));
    let bestN = -1, bd = td;
    for (const n of opts) {
      const d = dist(s, n, target);
      if (d < bd) { bd = d; bestN = n; }
    }
    if (bestN >= 0) {
      return {
        type: "MOVE_PLAYER",
        playerId: p.id,
        targetTileIndex: bestN,
        viaSeaLane: !rimNeighbors(p.position, scenarioById[SID].ringSize).includes(bestN),
      };
    }
  }
  return null;
}

function playGame(seed: number, roster: readonly string[] = FULL_TABLE) {
  let s = start(seed, roster);
  let guard = 0;
  while (s.phase !== "game_over" && guard < 3000) {
    guard++;
    switch (s.phase) {
      case "p1_disaster":
        s = s.activeDisaster ? go(s, { type: "ADVANCE_PHASE" }) : go(s, { type: "DRAW_DISASTER" });
        break;
      case "p2_news":
        s = s.activeNews ? go(s, { type: "ADVANCE_PHASE" }) : go(s, { type: "DRAW_NEWS" });
        break;
      case "p3_turns": {
        const p = s.players[s.currentPlayerIndex];
        // Open both locks when a matching card is in this player's hand.
        const lock = s.activeNews!.locks.find((l) => !s.locksOpened.includes(l));
        const card = lock
          ? p.hand.find((h) => {
              const c = evidenceCards.find((e) => e.id === h);
              return c && (c.category === lock || c.isWildcard);
            })
          : undefined;
        if (lock && card) {
          const next = go(s, { type: "PLAY_EVIDENCE_LOCK", playerId: p.id, evidenceId: card, lock });
          if (next.locksOpened.length > s.locksOpened.length) { s = next; break; }
        }
        // Free abilities cost 0 AP, so firing one must not end the turn.
        const act = rescueStep(s);
        if (act) {
          const next = go(s, act);
          const free = act.type === "USE_ACTIVE_ABILITY";
          const progressed =
            next.players[s.currentPlayerIndex].ap < p.ap ||
            next.evacuees.length > s.evacuees.length ||
            (free && next.players[s.currentPlayerIndex].activeUsedThisRound);
          if (progressed) { s = next; break; }
        }
        s = go(s, { type: "END_PLAYER_TURN" });
        break;
      }
      case "p4_verdict":
        if (!s.verdict) {
          s = go(s, { type: "COMMIT_VERDICT", verdict: s.activeNews!.truth === "hoax" ? "hoax" : "fact" });
        } else if (!s.newsRevealed) {
          s = go(s, { type: "FLIP_NEWS" });
        } else {
          s = go(s, { type: "ADVANCE_PHASE" });
        }
        break;
      case "p5_impact":
        s = go(s, { type: "ADVANCE_PHASE" });
        break;
    }
  }
  return s;
}

describe("BALANCE: is the demo winnable by a competent team?", () => {
  it("reports outcomes across 12 seeds on Awas (normal)", () => {
    const results: Record<string, number> = {};
    let totalEvac = 0, totalRep = 0, wins = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const s = playGame(seed);
      const key = s.gameOverReason ?? "none";
      results[key] = (results[key] ?? 0) + 1;
      totalEvac += s.evacuees.length;
      totalRep += s.reputation;
      if (s.gameOverReason === "win") wins++;
    }
    console.log(
      `[BALANCE] outcomes=${JSON.stringify(results)} ` +
        `avgEvac=${(totalEvac / 12).toFixed(1)}/12 avgRep=${(totalRep / 12).toFixed(1)} wins=${wins}/12`
    );
    // The bar: a greedy bot must at least be able to rescue meaningfully.
    expect(totalEvac / 12).toBeGreaterThan(2);
  }, 60_000);

  it("a two-Guardian table is still a real game, not an arithmetic wall", () => {
    // Two players have half the action economy of four against the same
    // 12-card clock, so the evacuation target scales down to match. This guard
    // exists because raising the target back to a flat number would silently
    // turn the smallest supported table into an unwinnable one.
    const results: Record<string, number> = {};
    let totalEvac = 0;
    let wins = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const s = playGame(seed, DUO_TABLE);
      const key = s.gameOverReason ?? "none";
      results[key] = (results[key] ?? 0) + 1;
      totalEvac += s.evacuees.length;
      if (s.gameOverReason === "win") wins++;
    }
    console.log(
      `[BALANCE duo] outcomes=${JSON.stringify(results)} ` +
        `avgEvac=${(totalEvac / 12).toFixed(1)} wins=${wins}/12`
    );
    // Winnable, but not a formality: the same band the four-player table sits in.
    expect(wins).toBeGreaterThanOrEqual(5);
    expect(wins).toBeLessThanOrEqual(11);
  }, 60_000);

  it("a three-Guardian table sits in the same band", () => {
    let wins = 0;
    const results: Record<string, number> = {};
    for (let seed = 1; seed <= 12; seed++) {
      const s = playGame(seed, TRIO_TABLE);
      const key = s.gameOverReason ?? "none";
      results[key] = (results[key] ?? 0) + 1;
      if (s.gameOverReason === "win") wins++;
    }
    console.log(`[BALANCE trio] outcomes=${JSON.stringify(results)} wins=${wins}/12`);
    expect(wins).toBeGreaterThanOrEqual(5);
    expect(wins).toBeLessThanOrEqual(11);
  }, 60_000);

  it("INTEGRITY: a team that ignores verification must NOT be able to win", () => {
    // This bot never opens a lock and always abstains: pure rescue, zero MIL.
    // If it can still win, the educational core of the game is skippable.
    function playIgnoringMil(seed: number, roster: readonly string[] = FULL_TABLE): GameState {
      let s = start(seed, roster);
      let guard = 0;
      while (s.phase !== "game_over" && guard < 3000) {
        guard++;
        switch (s.phase) {
          case "p1_disaster":
            s = s.activeDisaster ? go(s, { type: "ADVANCE_PHASE" }) : go(s, { type: "DRAW_DISASTER" });
            break;
          case "p2_news":
            s = s.activeNews ? go(s, { type: "ADVANCE_PHASE" }) : go(s, { type: "DRAW_NEWS" });
            break;
          case "p3_turns": {
            const p = s.players[s.currentPlayerIndex];
            const act = rescueStep(s);
            if (act) {
              const next = go(s, act);
              if (
                next.players[s.currentPlayerIndex].ap < p.ap ||
                next.evacuees.length > s.evacuees.length
              ) {
                s = next;
                break;
              }
            }
            s = go(s, { type: "END_PLAYER_TURN" });
            break;
          }
          case "p4_verdict":
            if (!s.verdict) s = go(s, { type: "COMMIT_VERDICT", verdict: "abstain" });
            else if (!s.newsRevealed) s = go(s, { type: "FLIP_NEWS" });
            else s = go(s, { type: "ADVANCE_PHASE" });
            break;
          case "p5_impact":
            s = go(s, { type: "ADVANCE_PHASE" });
            break;
        }
      }
      return s;
    }

    // The guard has to hold at every table size, not just the reference one.
    // A smaller table plays against a lower evacuation target, so if the target
    // were ever scaled down too far, a pure-rescue team could start winning at
    // two players while the four-player test still looked healthy.
    for (const [label, roster] of [
      ["4p", FULL_TABLE],
      ["3p", TRIO_TABLE],
      ["2p", DUO_TABLE],
    ] as const) {
      const outcomes: Record<string, number> = {};
      let wins = 0;
      for (let seed = 1; seed <= 12; seed++) {
        const s = playIgnoringMil(seed, roster);
        const key = s.gameOverReason ?? "none";
        outcomes[key] = (outcomes[key] ?? 0) + 1;
        if (s.gameOverReason === "win") wins++;
      }
      console.log(
        `[INTEGRITY ignore-MIL ${label}] outcomes=${JSON.stringify(outcomes)} wins=${wins}/12`
      );
      // Skipping verification must be punished. A rare lucky win is healthy, a
      // hard 0% wall would feel arbitrary, but it must stay the exception.
      expect(wins, `ignore-MIL wins at ${label}`).toBeLessThanOrEqual(2);
    }
  }, 60_000);

});
