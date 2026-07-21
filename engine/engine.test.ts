import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import { adjacentIndices, checkGameOver, isPassable, moveCost } from "./rules";
import type { GameAction, GameState } from "./types";
import { disasterCardById } from "@/data/disasterCards";
import { scenarioById } from "@/data/scenarios";

const SEED = 42;

function newGame(roleIds: string[] = ["eagle", "tiger", "monkey"]): GameState {
  const action: GameAction = {
    type: "START_GAME",
    scenarioId: "ring_of_fire",
    players: roleIds.map((roleId, i) => ({ name: `P${i + 1}`, roleId })),
    seed: SEED,
  };
  return reduce(null, action)!;
}

function dispatch(state: GameState, ...actions: GameAction[]): GameState {
  let s: GameState | null = state;
  for (const a of actions) s = reduce(s, a);
  return s!;
}

/** A passable neighbor of a tile, whatever the scenario geometry. */
function passableNeighbor(s: GameState, index: number): number {
  const scenario = scenarioById[s.scenarioId];
  const n = adjacentIndices(index, scenario.cols, scenario.rows).find((i) => isPassable(s.tiles[i]));
  if (n === undefined) throw new Error(`no passable neighbor of tile ${index}`);
  return n;
}

/** A safe-zone tile together with a passable neighbor to escort in from. */
function safeZoneWithNeighbor(s: GameState): { safe: number; neighbor: number } {
  const scenario = scenarioById[s.scenarioId];
  for (let i = 0; i < s.tiles.length; i++) {
    if (s.tiles[i].typeId !== "safe_zone") continue;
    const neighbor = adjacentIndices(i, scenario.cols, scenario.rows).find((j) => isPassable(s.tiles[j]));
    if (neighbor !== undefined) return { safe: i, neighbor };
  }
  throw new Error("no safe zone with a passable neighbor");
}

describe("setup", () => {
  it("starts a game with villagers, hands, and decks", () => {
    const s = newGame();
    expect(s.phase).toBe("phase1_influx");
    expect(s.tiles.flatMap((t) => t.occupants)).toHaveLength(15);
    expect(s.players).toHaveLength(3);
    for (const p of s.players) expect(p.hand).toHaveLength(4);
    expect(s.disasterDeck).toHaveLength(16);
    expect(s.evidenceDeck).toHaveLength(50 - 3 * 4);
  });
});

describe("phase 1 — incoming crisis", () => {
  it("places a crisis token and panics the target tile", () => {
    let s = newGame();
    s = dispatch(s, { type: "DEBUG_SET_EVENT_TOP", cardId: "evt_01" }, { type: "DRAW_EVENT_CARD" });
    expect(s.activeEventCard?.id).toBe("evt_01");
    const tile = s.tiles[s.activeEventTileIndex!];
    expect(tile.typeId).toBe("coast");
    expect(tile.hasCrisisToken).toBe(true);
    expect(tile.occupants.every((v) => v.status === "panic")).toBe(true);
  });

  it("monkey draws an extra evidence card each round", () => {
    let s = newGame(["monkey", "eagle"]);
    s = dispatch(s, { type: "DRAW_EVENT_CARD" });
    expect(s.players[0].hand).toHaveLength(4 + 1 + 1); // base draw + monkey bonus
    expect(s.players[1].hand).toHaveLength(4 + 1);
  });
});

describe("phase 2 — verification with the HOW wildcard", () => {
  it("the wildcard resolves an event whose locks are WHAT/WHERE", () => {
    let s = newGame();
    s = dispatch(s, { type: "DEBUG_SET_EVENT_TOP", cardId: "evt_01" }, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    s.players[0].hand.push("evd_how_01"); // give P1 the wildcard
    s = dispatch(s, { type: "USE_EVIDENCE_FOR_VERIFICATION", playerId: "p1", evidenceId: "evd_how_01" });
    expect(s.activeEventOutcome).toBe("debunked");
    expect(s.stats.hoaxesDebunked).toBe(1);
    expect(s.panicMeter).toBe(0);
    const tile = s.tiles.find((t) => t.typeId === "coast")!;
    expect(tile.hasCrisisToken).toBe(false);
    expect(tile.occupants.every((v) => v.status === "normal")).toBe(true);
  });

  it("a non-matching category is rejected", () => {
    let s = newGame();
    s = dispatch(s, { type: "DEBUG_SET_EVENT_TOP", cardId: "evt_04" }, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    s.players[0].hand.push("evd_what_01"); // evt_04 only accepts HOW
    s = dispatch(s, { type: "USE_EVIDENCE_FOR_VERIFICATION", playerId: "p1", evidenceId: "evd_what_01" });
    expect(s.activeEventOutcome).toBe("pending");
    expect(s.players[0].hand).toContain("evd_what_01"); // not consumed
  });

  it("ignoring an event raises the panic meter and flags the monkey", () => {
    let s = newGame(["monkey", "eagle"]);
    s = dispatch(s, { type: "DEBUG_SET_EVENT_TOP", cardId: "evt_01" }, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    s = dispatch(s, { type: "RESOLVE_VERIFICATION" });
    expect(s.activeEventOutcome).toBe("ignored");
    expect(s.panicMeter).toBe(1);
    expect(s.monkeyPenalty["p1"]).toBe(true);
    // Monkey pays the penalty at the phase-3 AP reset
    s = dispatch(s, { type: "ADVANCE_PHASE" });
    expect(s.players[0].ap).toBe(2);
    expect(s.players[1].ap).toBe(3);
  });

  it("validating a fact applies its bonus effect", () => {
    let s = newGame();
    s = dispatch(s, { type: "DEBUG_SET_EVENT_TOP", cardId: "evt_05" }, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    const coastIndex = s.activeEventTileIndex!;
    const beforeCount = s.tiles[coastIndex].occupants.length;
    expect(beforeCount).toBeGreaterThan(0);
    s.players[0].hand.push("evd_how_02");
    s = dispatch(s, { type: "USE_EVIDENCE_FOR_VERIFICATION", playerId: "p1", evidenceId: "evd_how_02" });
    expect(s.activeEventOutcome).toBe("validated");
    expect(s.stats.factsValidated).toBe(1);
    expect(s.tiles[coastIndex].occupants).toHaveLength(0); // moved a step inland
  });
});

describe("phase 3 — evacuation & disaster round effects", () => {
  function toPhase3(s: GameState): GameState {
    return dispatch(s, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" }, { type: "RESOLVE_VERIFICATION" }, { type: "ADVANCE_PHASE" });
  }

  it("Volcanic Ashfall makes movement cost +1 AP", () => {
    let s = toPhase3(newGame());
    s.activeDisasterEffect = disasterCardById["dis_02"];
    const player = s.players[s.currentPlayerIndex];
    const from = s.tiles[player.position];
    expect(moveCost(s, from)).toBe(2);
    const target = passableNeighbor(s, player.position);
    const apBefore = player.ap;
    s = dispatch(s, { type: "MOVE_PLAYER", playerId: player.id, targetTileIndex: target });
    expect(s.players[s.currentPlayerIndex].ap).toBe(apBefore - 2);
  });

  it("escorting a calm villager into the safe zone evacuates them", () => {
    let s = toPhase3(newGame());
    const player = s.players[s.currentPlayerIndex];
    // Put a calm villager on a tile next to a safe zone, with the player there too.
    const { safe, neighbor } = safeZoneWithNeighbor(s);
    const v = s.tiles.flatMap((t) => t.occupants).find((x) => x.status === "normal")!;
    s.tiles[v.tileIndex].occupants = s.tiles[v.tileIndex].occupants.filter((x) => x.id !== v.id);
    v.tileIndex = neighbor;
    s.tiles[neighbor].occupants.push(v);
    player.position = neighbor;
    s = dispatch(s, { type: "ESCORT_VILLAGER", playerId: player.id, villagerId: v.id, targetTileIndex: safe });
    expect(s.evacuees).toHaveLength(1);
    expect(s.evacuees[0].status).toBe("evacuated");
  });

  it("tiger's first escort each round is discounted", () => {
    let s = toPhase3(newGame(["tiger", "eagle"]));
    const tiger = s.players.find((p) => p.roleId === "tiger")!;
    s.currentPlayerIndex = s.players.indexOf(tiger);
    const { safe, neighbor } = safeZoneWithNeighbor(s);
    const v = s.tiles.flatMap((t) => t.occupants).find((x) => x.status === "normal")!;
    s.tiles[v.tileIndex].occupants = s.tiles[v.tileIndex].occupants.filter((x) => x.id !== v.id);
    v.tileIndex = neighbor;
    s.tiles[neighbor].occupants.push(v);
    tiger.position = neighbor;
    const apBefore = tiger.ap;
    s = dispatch(s, { type: "ESCORT_VILLAGER", playerId: tiger.id, villagerId: v.id, targetTileIndex: safe });
    expect(s.players.find((p) => p.roleId === "tiger")!.ap).toBe(apBefore); // free
    expect(s.tigerEscortBonus[tiger.id]).toBe(false);
  });
});

describe("phase 4 — escalation", () => {
  it("tsunami destroys a coastal tile and claims villagers left there", () => {
    let s = newGame();
    s = dispatch(
      s,
      { type: "DRAW_EVENT_CARD" },
      { type: "ADVANCE_PHASE" },
      { type: "RESOLVE_VERIFICATION" },
      { type: "ADVANCE_PHASE" },
      { type: "ADVANCE_PHASE" },
      { type: "DEBUG_SET_DISASTER_TOP", cardId: "dis_01" },
      { type: "DRAW_DISASTER_CARD" }
    );
    const destroyed = s.tiles.find((t) => t.status === "destroyed")!;
    expect(destroyed.typeId).toBe("coast");
    expect(s.casualties.length).toBeGreaterThan(0);
    expect(s.casualties.every((v) => v.status === "lost")).toBe(true);
  });
});

describe("checkGameOver — win + all three lose conditions", () => {
  it("win: evacuation target reached", () => {
    const s = newGame();
    const scenario = scenarioById[s.scenarioId];
    for (let i = 0; i < scenario.targetEvacuation; i++) {
      s.evacuees.push({ id: `w${i}`, status: "evacuated", tileIndex: 8 });
    }
    expect(checkGameOver(s)).toEqual({ over: true, reason: "win" });
  });

  it("panic: meter at max = MIL fail", () => {
    const s = newGame();
    s.panicMeter = s.panicMeterMax;
    expect(checkGameOver(s)).toEqual({ over: true, reason: "panic" });
  });

  it("casualties: not enough villagers left to reach the target", () => {
    const s = newGame();
    // Lose 8 of 15 villagers → only 7 remain < target 8.
    let lost = 0;
    for (const tile of s.tiles) {
      while (tile.occupants.length > 0 && lost < 8) {
        const v = tile.occupants.pop()!;
        v.status = "lost";
        s.casualties.push(v);
        lost++;
      }
    }
    expect(checkGameOver(s)).toEqual({ over: true, reason: "casualties" });
  });

  it("timeout: last disaster card drawn without meeting the target", () => {
    let s = newGame();
    s = dispatch(
      s,
      { type: "DRAW_EVENT_CARD" },
      { type: "ADVANCE_PHASE" },
      { type: "RESOLVE_VERIFICATION" },
      { type: "ADVANCE_PHASE" },
      { type: "ADVANCE_PHASE" },
      { type: "DEBUG_SET_DISASTER_TOP", cardId: "dis_08" }, // non-destructive card
      { type: "DEBUG_EMPTY_DISASTER_DECK" },
      { type: "DRAW_DISASTER_CARD" }
    );
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("timeout");
  });

  it("panic loss triggers immediately when an ignored event maxes the meter", () => {
    let s = newGame();
    s = dispatch(s, { type: "DEBUG_SET_PANIC", value: 4 }, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" }, { type: "RESOLVE_VERIFICATION" });
    expect(s.phase).toBe("game_over");
    expect(s.gameOverReason).toBe("panic");
  });
});

describe("evidence resource effects", () => {
  it("Mental Fortitude prevents the panic rise this round", () => {
    let s = newGame();
    s = dispatch(s, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    s.players[0].hand.push("evd_how_01");
    s = dispatch(
      s,
      { type: "DISCARD_EVIDENCE_FOR_RESOURCE", playerId: "p1", evidenceId: "evd_how_01" },
      { type: "RESOLVE_VERIFICATION" }
    );
    expect(s.panicShield).toBe(true);
    expect(s.panicMeter).toBe(0);
    expect(s.activeEventOutcome).toBe("ignored");
  });

  it("Emergency Sprint before phase 3 becomes a pending AP bonus", () => {
    let s = newGame();
    s = dispatch(s, { type: "DRAW_EVENT_CARD" }, { type: "ADVANCE_PHASE" });
    s.players[0].hand.push("evd_what_01");
    s = dispatch(
      s,
      { type: "DISCARD_EVIDENCE_FOR_RESOURCE", playerId: "p1", evidenceId: "evd_what_01" },
      { type: "RESOLVE_VERIFICATION" },
      { type: "ADVANCE_PHASE" }
    );
    expect(s.players[0].ap).toBe(3 + 2);
  });
});
