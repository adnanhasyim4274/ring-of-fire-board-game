// Pure rules helpers — no DOM, no React, 100% unit-testable.
import type { GameOverReason, GameState, Player, Scenario, TileState, VillagerToken } from "./types";
import { gameConfig } from "@/data/gameConfig";
import { tileTypeById } from "@/data/tileTypes";
import { scenarioById } from "@/data/scenarios";

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

export function getScenario(state: GameState): Scenario {
  return scenarioById[state.scenarioId];
}

/** Orthogonal neighbors on the scenario grid. */
export function adjacentIndices(index: number, cols: number, rows: number): number[] {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const out: number[] = [];
  if (row > 0) out.push(index - cols);
  if (row < rows - 1) out.push(index + cols);
  if (col > 0) out.push(index - 1);
  if (col < cols - 1) out.push(index + 1);
  return out;
}

export function isAdjacent(a: number, b: number, scenario: Scenario): boolean {
  return adjacentIndices(a, scenario.cols, scenario.rows).includes(b);
}

export function isSafeZone(tile: TileState): boolean {
  return !!tileTypeById[tile.typeId]?.isSafeZone;
}

/** Ocean tiles are board water — never enterable, never traversable. */
export function isPassable(tile: TileState): boolean {
  return tile.status === "normal" && tile.typeId !== "ocean";
}

export function villagersOnBoard(state: GameState): VillagerToken[] {
  return state.tiles.flatMap((t) => t.occupants);
}

/** AP cost to move (or escort) from one tile to an adjacent tile. */
export function moveCost(state: GameState, fromTile: TileState, player?: Player): number {
  let cost = gameConfig.moveCost;
  const effect = state.activeDisasterEffect;
  if (effect?.roundEffectKey === "move_penalty") cost += 1;
  if (effect?.roundEffectKey === "coast_exit_penalty" && fromTile.typeId === "coast") cost += 1;
  // "Alternate Route" cancels the terrain/weather penalty for one move.
  if (player?.altRouteReady && cost > gameConfig.moveCost) cost = gameConfig.moveCost;
  return cost;
}

export function calmCost(state: GameState): number {
  return state.activeDisasterEffect?.roundEffectKey === "calm_cost_up"
    ? gameConfig.calmCostStorm
    : gameConfig.calmCost;
}

/** Escort = walking together, so movement penalties apply on top of the base cost. */
export function escortCost(state: GameState, fromTile: TileState, player?: Player): number {
  const movePenalty = moveCost(state, fromTile, player) - gameConfig.moveCost;
  return gameConfig.escortCost + movePenalty;
}

export function escortBlocked(state: GameState, fromTile: TileState, toTile: TileState): boolean {
  const effect = state.activeDisasterEffect;
  if (effect?.roundEffectKey !== "block_escort") return false;
  return (
    effect.affectedTileTypeIds.includes(fromTile.typeId) ||
    effect.affectedTileTypeIds.includes(toTile.typeId)
  );
}

/**
 * The three lose conditions + the win condition (spec 5.5–5.6).
 * `deckExhausted` = the last disaster card has been drawn and resolved.
 */
export function checkGameOver(state: GameState): { over: boolean; reason?: GameOverReason } {
  const scenario = getScenario(state);
  if (state.evacuees.length >= scenario.targetEvacuation) return { over: true, reason: "win" };
  if (state.panicMeter >= state.panicMeterMax) return { over: true, reason: "panic" };
  const stillPossible = state.evacuees.length + villagersOnBoard(state).length;
  if (stillPossible < scenario.targetEvacuation) return { over: true, reason: "casualties" };
  return { over: false };
}

/** Step a tile index one tile toward the nearest safe zone (BFS over normal tiles). */
export function stepTowardNearestSafeZone(state: GameState, from: number): number | null {
  const scenario = getScenario(state);
  const visited = new Set<number>([from]);
  const queue: { index: number; first: number | null }[] = [{ index: from, first: null }];
  while (queue.length > 0) {
    const { index, first } = queue.shift()!;
    const tile = state.tiles[index];
    if (index !== from && isSafeZone(tile)) return first;
    for (const n of adjacentIndices(index, scenario.cols, scenario.rows)) {
      if (visited.has(n)) continue;
      if (!isPassable(state.tiles[n])) continue;
      visited.add(n);
      queue.push({ index: n, first: first ?? n });
    }
  }
  return null;
}

/** Find the nearest tile (BFS from `from`) containing a panicked villager. */
export function nearestPanickedVillager(state: GameState, from: number): VillagerToken | null {
  const scenario = getScenario(state);
  const visited = new Set<number>([from]);
  const queue: number[] = [from];
  while (queue.length > 0) {
    const index = queue.shift()!;
    const panicked = state.tiles[index].occupants.find((v) => v.status === "panic");
    if (panicked) return panicked;
    for (const n of adjacentIndices(index, scenario.cols, scenario.rows)) {
      if (!visited.has(n) && state.tiles[n].typeId !== "ocean") {
        visited.add(n);
        queue.push(n);
      }
    }
  }
  return null;
}
