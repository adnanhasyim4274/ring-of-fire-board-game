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
import { evidenceCards } from "@/data/evidenceCards";

const SID = Object.keys(scenarioById)[0];
const go = (s: GameState, a: GameAction) => reduce(s, a)!;

function start(seed: number, difficulty: GameState["difficulty"] = "awas"): GameState {
  return reduce(null, {
    type: "START_GAME",
    scenarioId: SID,
    difficulty,
    players: ["elang", "orangutan", "harimau", "monyet"].map((r, i) => ({
      name: `P${i + 1}`,
      roleId: r,
    })),
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
    if (!t.isPosSiaga) return;
    const d = dist(s, from, i);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

/** One step of a greedy rescue bot for the active player. Returns null if it should pass. */
function rescueStep(s: GameState): GameAction | null {
  const p = s.players[s.currentPlayerIndex];
  const tile = s.tiles[p.position];

  // Escort a calm villager toward safety.
  const calm = tile.occupants.filter((v) => v.status === "tenang");
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
        const carry = calm.slice(0, p.roleId === "harimau" ? 2 : 1).map((v) => v.id);
        return {
          type: "ESCORT_VILLAGER",
          playerId: p.id,
          villagerIds: carry,
          targetTileIndex: bestN,
          viaSeaRoute: !rimNeighbors(p.position, s.tiles.length).includes(bestN),
        };
      }
    }
  }

  // Calm a panicking villager here.
  const panicked = tile.occupants.find((v) => v.status === "panik");
  if (panicked) {
    return { type: "CALM_VILLAGER", playerId: p.id, villagerId: panicked.id };
  }

  // Walk toward the nearest villager still on the board.
  let target = -1, td = 99;
  s.tiles.forEach((t, i) => {
    if (t.occupants.length === 0 || t.isPosSiaga) return;
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
        viaSeaRoute: !rimNeighbors(p.position, s.tiles.length).includes(bestN),
      };
    }
  }
  return null;
}

function playGame(seed: number, difficulty: GameState["difficulty"] = "awas") {
  let s = start(seed, difficulty);
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
        const act = rescueStep(s);
        if (act) {
          const next = go(s, act);
          // Only accept real progress, else pass the turn.
          if (next.players[s.currentPlayerIndex].ap < p.ap || next.evacuees.length > s.evacuees.length) {
            s = next; break;
          }
        }
        s = go(s, { type: "END_PLAYER_TURN" });
        break;
      }
      case "p4_verdict":
        if (!s.verdict) {
          s = go(s, { type: "COMMIT_VERDICT", verdict: s.activeNews!.truth === "hoax" ? "hoax" : "fakta" });
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

describe("BALANCE — is the demo winnable by a competent team?", () => {
  it("reports outcomes across 12 seeds on Awas (normal)", () => {
    const results: Record<string, number> = {};
    let totalEvac = 0, totalRep = 0, wins = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const s = playGame(seed);
      const key = s.gameOverReason ?? "none";
      results[key] = (results[key] ?? 0) + 1;
      totalEvac += s.evacuees.length;
      totalRep += s.reputation;
      if (s.gameOverReason === "menang") wins++;
    }
    console.log(
      `[BALANCE awas] outcomes=${JSON.stringify(results)} ` +
        `avgEvac=${(totalEvac / 12).toFixed(1)}/10 avgRep=${(totalRep / 12).toFixed(1)} wins=${wins}/12`
    );
    // The bar: a greedy bot must at least be able to rescue meaningfully.
    expect(totalEvac / 12).toBeGreaterThan(2);
  });

  it("INTEGRITY — a team that ignores verification must NOT be able to win", () => {
    // This bot never opens a lock and always abstains: pure rescue, zero MIL.
    // If it can still win, the educational core of the game is skippable.
    function playIgnoringMil(seed: number): GameState {
      let s = start(seed);
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

    const outcomes: Record<string, number> = {};
    let wins = 0;
    for (let seed = 1; seed <= 12; seed++) {
      const s = playIgnoringMil(seed);
      const key = s.gameOverReason ?? "none";
      outcomes[key] = (outcomes[key] ?? 0) + 1;
      if (s.gameOverReason === "menang") wins++;
    }
    console.log(`[INTEGRITY ignore-MIL] outcomes=${JSON.stringify(outcomes)} wins=${wins}/12`);
    // Skipping verification must be punished. A rare lucky win is healthy — a
    // hard 0% wall would feel arbitrary — but it must be the exception.
    expect(wins).toBeLessThanOrEqual(2);
  });

  it("reports Siaga (easy) outcomes", () => {
    let wins = 0, totalEvac = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const s = playGame(seed, "siaga");
      totalEvac += s.evacuees.length;
      if (s.gameOverReason === "menang") wins++;
    }
    console.log(`[BALANCE siaga] avgEvac=${(totalEvac / 8).toFixed(1)}/8 wins=${wins}/8`);
    expect(totalEvac).toBeGreaterThan(0);
  });
});
