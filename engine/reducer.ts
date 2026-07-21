// Pure reducer: (state, action) => newState. No DOM, no React, no I/O.
import type {
  EvidenceCategory,
  GameAction,
  GamePhase,
  GameState,
  Player,
  TileState,
  VillagerToken,
} from "./types";
import { gameConfig } from "@/data/gameConfig";
import { eventCardById } from "@/data/eventCards";
import { evidenceCardById, buildEvidenceDeck } from "@/data/evidenceCards";
import { disasterCardById, buildDisasterDeck } from "@/data/disasterCards";
import { roleById } from "@/data/roles";
import { scenarioById } from "@/data/scenarios";
import {
  adjacentIndices,
  calmCost,
  checkGameOver,
  escortBlocked,
  escortCost,
  getScenario,
  isAdjacent,
  isPassable,
  isSafeZone,
  moveCost,
  nearestPanickedVillager,
  shuffled,
  stepTowardNearestSafeZone,
} from "./rules";

function log(s: GameState, message: string) {
  s.log.push({ round: s.round, phase: s.phase, message, timestamp: Date.now() });
}

function applyGameOverCheck(s: GameState) {
  if (s.phase === "game_over") return;
  const result = checkGameOver(s);
  if (result.over) {
    s.phase = "game_over";
    s.gameOverReason = result.reason!;
    log(s, `Game over: ${result.reason}`);
  }
}

function currentPlayer(s: GameState): Player {
  return s.players[s.currentPlayerIndex];
}

function findPlayer(s: GameState, playerId: string): Player | undefined {
  return s.players.find((p) => p.id === playerId);
}

/** Remove ONE instance of a card id from a hand (deck has duplicate ids). */
function removeFromHand(player: Player, cardId: string): boolean {
  const i = player.hand.indexOf(cardId);
  if (i === -1) return false;
  player.hand.splice(i, 1);
  return true;
}

function nextSeed(s: GameState): number {
  s.rngSeed = (Math.imul(s.rngSeed, 1103515245) + 12345) >>> 0;
  return s.rngSeed;
}

/** Draw one evidence card, reshuffling the discard pile into the deck if needed. */
function drawEvidence(s: GameState, player: Player, preferCategories?: EvidenceCategory[]) {
  if (s.evidenceDeck.length === 0 && s.evidenceDiscard.length > 0) {
    s.evidenceDeck = shuffled(s.evidenceDiscard, nextSeed(s));
    s.evidenceDiscard = [];
    log(s, "Evidence discard pile reshuffled into the deck.");
  }
  if (s.evidenceDeck.length === 0) return;
  let index = 0;
  if (preferCategories) {
    const found = s.evidenceDeck.findIndex((id) =>
      preferCategories.includes(evidenceCardById[id].category)
    );
    if (found !== -1) index = found;
  }
  const [id] = s.evidenceDeck.splice(index, 1);
  player.hand.push(id);
}

function calmVillager(v: VillagerToken) {
  if (v.status === "panic") v.status = "normal";
}

function panicTile(tile: TileState) {
  for (const v of tile.occupants) if (v.status === "normal") v.status = "panic";
}

/** Resolve the active event: "success" (a required lock was opened) or "ignored". */
function resolveEvent(s: GameState, mode: "success" | "ignored") {
  const card = s.activeEventCard;
  if (!card || s.activeEventOutcome !== "pending") return;
  const targetTile = s.activeEventTileIndex !== null ? s.tiles[s.activeEventTileIndex] : null;

  if (mode === "success") {
    if (card.status === "fact") {
      s.activeEventOutcome = "validated";
      s.stats.factsValidated++;
      log(s, `"${card.title}" verified as FACT — the correct science spreads.`);
      if (targetTile) {
        targetTile.hasCrisisToken = false;
        targetTile.permanentPanic = false;
        if (card.validated?.calmTargetTile !== false) targetTile.occupants.forEach(calmVillager);
        if (card.validated?.moveTargetTowardSafe && targetTile.status === "normal") {
          const step = stepTowardNearestSafeZone(s, targetTile.index);
          if (step !== null) {
            const movers = [...targetTile.occupants];
            targetTile.occupants = [];
            for (const v of movers) {
              v.tileIndex = step;
              s.tiles[step].occupants.push(v);
            }
            log(s, "Villagers move one step away from the shore!");
          }
        }
      }
      if (card.validated?.calmTileType) {
        for (const tile of s.tiles) {
          if (tile.typeId === card.validated.calmTileType) {
            tile.occupants.forEach(calmVillager);
            tile.hasCrisisToken = false;
            tile.permanentPanic = false;
          }
        }
      }
    } else {
      s.activeEventOutcome = "debunked";
      s.stats.hoaxesDebunked++;
      log(s, `"${card.title}" DEBUNKED (${card.status}) — the crisis calms down.`);
      if (targetTile) {
        targetTile.hasCrisisToken = false;
        targetTile.permanentPanic = false;
        targetTile.occupants.forEach(calmVillager);
      }
    }
  } else {
    s.activeEventOutcome = "ignored";
    s.stats.eventsIgnored++;
    if (s.panicShield) {
      log(s, `"${card.title}" went unverified — but Mental Fortitude holds the Panic Meter steady.`);
    } else {
      s.panicMeter++;
      log(s, `"${card.title}" went unverified — Panic Meter rises to ${s.panicMeter}.`);
    }
    if (targetTile) {
      if (card.ignored?.panicTargetTile) panicTile(targetTile);
      if (card.ignored?.permanentPanic) {
        targetTile.permanentPanic = true;
        log(s, "Villagers there refuse all normal help — only special actions can calm them now.");
      }
    }
    if (card.ignored?.apPenaltyFirstPlayer) {
      const first = s.players[s.firstPlayerIndex];
      s.pendingApBonus[first.id] = (s.pendingApBonus[first.id] ?? 0) - 1;
      log(s, `${first.name} loses 1 AP next phase dealing with the fallout.`);
    }
    // Monkey's vulnerability: a hoax going un-debunked costs them 1 AP next round.
    if (card.status !== "fact") {
      for (const p of s.players) {
        if (p.roleId === "monkey") {
          s.monkeyPenalty[p.id] = true;
          log(s, `${p.name} (Monkey) is swamped by the rumor mill — 1 AP penalty next round.`);
        }
      }
    }
    applyGameOverCheck(s);
  }
}

/** Phase 3 entry: reset AP (base + bonuses − penalties), reset per-round flags. */
function enterEvacuationPhase(s: GameState) {
  s.phase = "phase3_evacuation";
  for (const p of s.players) {
    let ap = gameConfig.baseAP + (s.pendingApBonus[p.id] ?? 0);
    if (s.monkeyPenalty[p.id]) ap -= 1;
    p.ap = Math.max(0, ap);
    if (p.roleId === "tiger") s.tigerEscortBonus[p.id] = true;
  }
  s.pendingApBonus = {};
  s.monkeyPenalty = {};
  s.playersEndedTurn = [];
  s.currentPlayerIndex = s.firstPlayerIndex;
  log(s, "Rescue phase — spend your Action Points!");
}

/** Phase 4 → next round: rotate first player, activate the incoming disaster. */
function startNextRound(s: GameState) {
  s.round++;
  s.firstPlayerIndex = (s.firstPlayerIndex + 1) % s.players.length;
  s.currentPlayerIndex = s.firstPlayerIndex;
  s.activeDisasterEffect = s.incomingDisaster;
  s.incomingDisaster = null;
  s.activeEventCard = null;
  s.activeEventTileIndex = null;
  s.activeEventLocksOpened = [];
  s.activeEventOutcome = "pending";
  s.panicShield = false;
  s.abilityUsed = {};
  s.peek = null;
  s.phase = "phase1_influx";
  log(s, `Round ${s.round} begins. First player: ${s.players[s.firstPlayerIndex].name}.`);

  const effect = s.activeDisasterEffect;
  if (effect?.roundEffectKey === "panic_spread_fault") {
    const scenario = getScenario(s);
    const affected = new Set<number>();
    for (const tile of s.tiles) {
      if (tile.typeId === "fault_zone") {
        affected.add(tile.index);
        for (const n of adjacentIndices(tile.index, scenario.cols, scenario.rows)) affected.add(n);
      }
    }
    for (const i of affected) panicTile(s.tiles[i]);
    log(s, "Aftershock Swarm! Villagers on and around the fault line panic.");
  }
  if (effect?.roundEffectKey === "peek_disaster" && s.disasterDeck.length > 0) {
    s.peek = { kind: "disaster", cardId: s.disasterDeck[0] };
    log(s, "Fleeing wildlife reveals what the mountain will do next — the team peeks at the Disaster Deck.");
  }
}

function startGame(action: Extract<GameAction, { type: "START_GAME" }>): GameState {
  const scenario = scenarioById[action.scenarioId] ?? scenarioById[gameConfig.defaultScenarioId];
  const seed = (action.seed ?? 1) >>> 0;

  const tiles: TileState[] = scenario.layout.map((typeId, index) => ({
    index,
    typeId,
    status: "normal",
    occupants: [],
    hasCrisisToken: false,
    permanentPanic: false,
  }));
  let vCount = 0;
  scenario.villagerSetup.forEach((count, index) => {
    for (let k = 0; k < count; k++) {
      vCount++;
      tiles[index].occupants.push({ id: `v${vCount}`, status: "normal", tileIndex: index });
    }
  });

  const safeIndex = Math.max(0, scenario.layout.findIndex((t) => t === "safe_zone"));
  const players: Player[] = action.players.map((p, i) => ({
    id: `p${i + 1}`,
    name: p.name.trim() || roleById[p.roleId]?.name || `Player ${i + 1}`,
    roleId: p.roleId,
    ap: 0,
    hand: [],
    position: safeIndex,
    altRouteReady: false,
  }));

  const s: GameState = {
    phase: "phase1_influx",
    round: 1,
    scenarioId: scenario.id,
    players,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    tiles,
    panicMeter: 0,
    panicMeterMax: gameConfig.panicMeterMax,
    activeEventCard: null,
    activeEventTileIndex: null,
    activeEventLocksOpened: [],
    activeEventOutcome: "pending",
    eventDeck: shuffled(Object.keys(eventCardById), seed + 1),
    eventDiscard: [],
    evidenceDeck: shuffled(buildEvidenceDeck(), seed + 2),
    evidenceDiscard: [],
    disasterDeck: shuffled(buildDisasterDeck(scenario.disasterDeckSize), seed + 3),
    activeDisasterEffect: null,
    incomingDisaster: null,
    evacuees: [],
    casualties: [],
    gameOverReason: null,
    log: [],
    stats: { hoaxesDebunked: 0, factsValidated: 0, eventsIgnored: 0 },
    pendingApBonus: {},
    monkeyPenalty: {},
    panicShield: false,
    abilityUsed: {},
    tigerEscortBonus: {},
    playersEndedTurn: [],
    peek: null,
    rngSeed: seed,
  };
  for (const p of s.players) {
    for (let i = 0; i < gameConfig.startingHandSize; i++) drawEvidence(s, p);
  }
  log(s, `The Guardian Wildlife assemble at ${scenario.name}. Round 1 begins!`);
  return s;
}

export function reduce(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === "RESET_GAME") return null;
  if (action.type === "START_GAME") return startGame(action);
  if (!state) return state;

  const s = structuredClone(state);
  const isDebug = action.type.startsWith("DEBUG_");
  if (s.phase === "game_over" && !isDebug) return state;

  switch (action.type) {
    case "DRAW_EVENT_CARD": {
      if (s.phase !== "phase1_influx" || s.activeEventCard) return state;
      if (s.eventDeck.length === 0) {
        s.eventDeck = shuffled(s.eventDiscard, nextSeed(s));
        s.eventDiscard = [];
      }
      const id = s.eventDeck.shift()!;
      const card = eventCardById[id];
      s.activeEventCard = card;
      s.activeEventLocksOpened = [];
      s.activeEventOutcome = "pending";
      const targetIndex = s.tiles.findIndex(
        (t) => t.typeId === card.targetTileType && t.status === "normal"
      );
      s.activeEventTileIndex = targetIndex >= 0 ? targetIndex : null;
      if (targetIndex >= 0) {
        const tile = s.tiles[targetIndex];
        tile.hasCrisisToken = true;
        panicTile(tile);
      }
      // Round replenishment: everyone draws; Monkey draws an extra WHY/WHO card.
      for (const p of s.players) {
        for (let i = 0; i < gameConfig.evidencePerRound; i++) drawEvidence(s, p);
        if (p.roleId === "monkey") drawEvidence(s, p, ["WHY", "WHO"]);
      }
      log(s, `Breaking news: "${card.title}" — panic spreads near the target area.`);
      return s;
    }

    case "USE_EVIDENCE_FOR_VERIFICATION": {
      if (s.phase !== "phase2_verification" || !s.activeEventCard) return state;
      if (s.activeEventOutcome !== "pending") return state;
      const player = findPlayer(s, action.playerId);
      const card = evidenceCardById[action.evidenceId];
      if (!player || !card) return state;
      if (s.activeDisasterEffect?.roundEffectKey === "block_where" && card.category === "WHERE") {
        log(s, "Communications Blackout! WHERE evidence can't be checked this round.");
        return s;
      }
      const required = s.activeEventCard.requiredLocks;
      const matches = card.isWildcard || required.includes(card.category);
      if (!matches) {
        log(s, `"${card.title}" (${card.category}) doesn't match this event's locks.`);
        return s;
      }
      if (!removeFromHand(player, card.id)) return state;
      s.evidenceDiscard.push(card.id);
      const opened = card.isWildcard && !required.includes(card.category) ? required[0] : card.category;
      if (!s.activeEventLocksOpened.includes(opened)) s.activeEventLocksOpened.push(opened);
      log(s, `${player.name} plays "${card.title}" — the [${opened}] lock opens!`);
      if (card.bonus === "refund_ap") {
        s.pendingApBonus[player.id] = (s.pendingApBonus[player.id] ?? 0) + 1;
        log(s, `${player.name} gets 1 AP refunded (2-point bonus).`);
      }
      if (card.bonus === "calm_nearest") {
        const v = nearestPanickedVillager(s, player.position);
        if (v) {
          calmVillager(v);
          log(s, "The clear explanation calms the nearest panicked villager (2-point bonus).");
        }
      }
      // requiredLocks is an OR — one opened lock resolves the event.
      resolveEvent(s, "success");
      return s;
    }

    case "DISCARD_EVIDENCE_FOR_RESOURCE": {
      if (s.phase !== "phase2_verification" && s.phase !== "phase3_evacuation") return state;
      const player = findPlayer(s, action.playerId);
      const card = evidenceCardById[action.evidenceId];
      if (!player || !card) return state;
      if (s.phase === "phase3_evacuation" && player.id !== currentPlayer(s).id) return state;
      if (card.resourceKind === "trade" && s.activeDisasterEffect?.roundEffectKey === "block_trade") {
        log(s, "Total Gridlock! Cards can't be traded this round.");
        return s;
      }
      if (!removeFromHand(player, card.id)) return state;
      s.evidenceDiscard.push(card.id);
      switch (card.resourceKind) {
        case "ap2":
          if (s.phase === "phase3_evacuation") player.ap += 2;
          else s.pendingApBonus[player.id] = (s.pendingApBonus[player.id] ?? 0) + 2;
          log(s, `${player.name} sprints — +2 AP!`);
          break;
        case "alt_route":
          player.altRouteReady = true;
          log(s, `${player.name} scouts an alternate route — the next terrain penalty is ignored.`);
          break;
        case "trade": {
          const other = action.tradeWithPlayerId ? findPlayer(s, action.tradeWithPlayerId) : undefined;
          if (other && other.id !== player.id && action.tradeGiveCardId) {
            if (removeFromHand(player, action.tradeGiveCardId)) {
              const received = other.hand.shift();
              other.hand.push(action.tradeGiveCardId);
              if (received) player.hand.push(received);
              log(s, `${player.name} trades a card with ${other.name}.`);
            }
          } else {
            log(s, `${player.name} shares logistics info with the team.`);
          }
          break;
        }
        case "calm_free": {
          let v: VillagerToken | null =
            (action.targetVillagerId
              ? s.tiles.flatMap((t) => t.occupants).find((x) => x.id === action.targetVillagerId)
              : undefined) ?? null;
          if (!v || v.status !== "panic") v = nearestPanickedVillager(s, player.position);
          if (v) {
            calmVillager(v);
            log(s, `${player.name} uses the loudspeaker — a villager calms down (0 AP).`);
          } else {
            log(s, "No panicked villagers to calm right now.");
          }
          break;
        }
        case "panic_shield":
          s.panicShield = true;
          log(s, `${player.name} steadies everyone's nerves — the Panic Meter won't rise this round.`);
          break;
      }
      return s;
    }

    case "RESOLVE_VERIFICATION": {
      if (s.phase !== "phase2_verification" || !s.activeEventCard) return state;
      if (s.activeEventOutcome === "pending") resolveEvent(s, "ignored");
      return s;
    }

    case "MOVE_PLAYER": {
      if (s.phase !== "phase3_evacuation") return state;
      const player = currentPlayer(s);
      if (action.playerId !== player.id) return state;
      const scenario = getScenario(s);
      const target = s.tiles[action.targetTileIndex];
      if (!target || !isPassable(target)) return state;
      if (!isAdjacent(player.position, action.targetTileIndex, scenario)) return state;
      const fromTile = s.tiles[player.position];
      const cost = moveCost(s, fromTile, player);
      if (player.ap < cost) {
        log(s, `Not enough AP to move (needs ${cost}).`);
        return s;
      }
      if (player.altRouteReady && moveCost(s, fromTile) > gameConfig.moveCost) {
        player.altRouteReady = false;
        log(s, `${player.name} takes the alternate route — penalty ignored.`);
      }
      player.ap -= cost;
      player.position = action.targetTileIndex;
      return s;
    }

    case "CALM_VILLAGER": {
      if (s.phase !== "phase3_evacuation") return state;
      const player = currentPlayer(s);
      if (action.playerId !== player.id) return state;
      const tile = s.tiles[player.position];
      const villager = tile.occupants.find((v) => v.id === action.villagerId);
      if (!villager || villager.status !== "panic") return state;
      if (tile.permanentPanic) {
        log(s, "They won't listen! The hoax stuck — only special help (an ability or a free calm) works here.");
        return s;
      }
      const cost = calmCost(s);
      if (player.ap < cost) {
        log(s, `Not enough AP to calm (needs ${cost}).`);
        return s;
      }
      player.ap -= cost;
      villager.status = "normal";
      log(s, `${player.name} calms a villager down.`);
      return s;
    }

    case "ESCORT_VILLAGER": {
      if (s.phase !== "phase3_evacuation") return state;
      const player = currentPlayer(s);
      if (action.playerId !== player.id) return state;
      const scenario = getScenario(s);
      const fromTile = s.tiles[player.position];
      const target = s.tiles[action.targetTileIndex];
      if (!target || !isPassable(target)) return state;
      if (!isAdjacent(player.position, action.targetTileIndex, scenario)) return state;
      const villager = fromTile.occupants.find((v) => v.id === action.villagerId);
      if (!villager) return state;
      if (villager.status !== "normal") {
        log(s, "Panicked villagers won't follow — calm them first!");
        return s;
      }
      if (escortBlocked(s, fromTile, target)) {
        log(s, "Liquefaction! Nobody can be escorted through the sinking city this round.");
        return s;
      }
      let cost = escortCost(s, fromTile, player);
      if (s.tigerEscortBonus[player.id]) cost = Math.max(0, cost - 1);
      if (player.ap < cost) {
        log(s, `Not enough AP to escort (needs ${cost}).`);
        return s;
      }
      if (s.tigerEscortBonus[player.id]) {
        s.tigerEscortBonus[player.id] = false;
        log(s, `${player.name} (Tiger) leads the evacuation — escort discount used!`);
      }
      if (player.altRouteReady && escortCost(s, fromTile) > gameConfig.escortCost) {
        player.altRouteReady = false;
      }
      player.ap -= cost;
      fromTile.occupants = fromTile.occupants.filter((v) => v.id !== villager.id);
      player.position = action.targetTileIndex;
      if (isSafeZone(target)) {
        villager.status = "evacuated";
        villager.tileIndex = action.targetTileIndex;
        s.evacuees.push(villager);
        log(s, `${player.name} escorts a villager to safety! (${s.evacuees.length}/${scenarioById[s.scenarioId].targetEvacuation})`);
        applyGameOverCheck(s);
      } else {
        villager.tileIndex = action.targetTileIndex;
        target.occupants.push(villager);
        log(s, `${player.name} escorts a villager toward safety.`);
      }
      return s;
    }

    case "END_PLAYER_TURN": {
      if (s.phase !== "phase3_evacuation") return state;
      const player = currentPlayer(s);
      if (!s.playersEndedTurn.includes(player.id)) s.playersEndedTurn.push(player.id);
      if (s.playersEndedTurn.length >= s.players.length) {
        s.phase = "phase4_escalation";
        log(s, "All Guardians have acted. The Ring of Fire stirs…");
        return s;
      }
      for (let step = 1; step <= s.players.length; step++) {
        const idx = (s.currentPlayerIndex + step) % s.players.length;
        if (!s.playersEndedTurn.includes(s.players[idx].id)) {
          s.currentPlayerIndex = idx;
          break;
        }
      }
      log(s, `${currentPlayer(s).name}'s turn.`);
      return s;
    }

    case "DRAW_DISASTER_CARD": {
      if (s.phase !== "phase4_escalation" || s.incomingDisaster) return state;
      if (s.disasterDeck.length === 0) {
        s.gameOverReason = "timeout";
        s.phase = "game_over";
        log(s, "The Disaster Deck is empty — the megathrust arrives. Time has run out.");
        return s;
      }
      const id = s.disasterDeck.shift()!;
      const card = disasterCardById[id];
      s.incomingDisaster = card;
      log(s, `Disaster: "${card.title}" — its effect looms over the next round.`);
      if (card.destroysTile) {
        const tileIndex = s.tiles.findIndex(
          (t) => card.affectedTileTypeIds.includes(t.typeId) && t.status === "normal"
        );
        if (tileIndex >= 0) {
          const tile = s.tiles[tileIndex];
          tile.status = "destroyed";
          tile.hasCrisisToken = false;
          for (const v of tile.occupants) {
            v.status = "lost";
            s.casualties.push(v);
          }
          const lostCount = tile.occupants.length;
          tile.occupants = [];
          log(
            s,
            lostCount > 0
              ? `A tile is swept away — ${lostCount} villager${lostCount > 1 ? "s" : ""} lost!`
              : "A tile is swept away — thankfully nobody was left there."
          );
          // Guardians on the tile scramble to an adjacent tile (never casualties).
          const scenario = getScenario(s);
          for (const p of s.players) {
            if (p.position === tileIndex) {
              const escape = adjacentIndices(tileIndex, scenario.cols, scenario.rows).find(
                (n) => isPassable(s.tiles[n])
              );
              p.position = escape ?? Math.max(0, s.tiles.findIndex((t) => t.typeId === "safe_zone"));
              log(s, `${p.name} scrambles clear just in time!`);
            }
          }
        }
      }
      if (card.roundEffectKey === "peek_disaster" && s.disasterDeck.length > 0) {
        s.peek = { kind: "disaster", cardId: s.disasterDeck[0] };
      }
      applyGameOverCheck(s);
      if (s.gameOverReason === null && s.disasterDeck.length === 0) {
        const scenario = getScenario(s);
        if (s.evacuees.length < scenario.targetEvacuation) {
          s.gameOverReason = "timeout";
          s.phase = "game_over";
          log(s, "That was the final disaster card — the evacuation target wasn't met. Time out!");
        }
      }
      return s;
    }

    case "ADVANCE_PHASE": {
      switch (s.phase) {
        case "phase1_influx":
          if (!s.activeEventCard) return state;
          s.phase = "phase2_verification";
          log(s, "Verification phase — is this news real? Check the evidence!");
          return s;
        case "phase2_verification":
          if (s.activeEventOutcome === "pending") resolveEvent(s, "ignored");
          if (s.gameOverReason !== null) return s;
          if (s.activeEventCard) s.eventDiscard.push(s.activeEventCard.id);
          enterEvacuationPhase(s);
          return s;
        case "phase3_evacuation":
          s.phase = "phase4_escalation";
          log(s, "The Ring of Fire stirs…");
          return s;
        case "phase4_escalation":
          if (!s.incomingDisaster) return state;
          startNextRound(s);
          return s;
        default:
          return state;
      }
    }

    case "USE_ROLE_ABILITY": {
      if (s.phase === "game_over" || s.phase === "setup") return state;
      const player = findPlayer(s, action.playerId);
      if (!player) return state;
      if (s.abilityUsed[player.id]) {
        log(s, `${player.name} already used their ability this round.`);
        return s;
      }
      const role = roleById[player.roleId];
      switch (role?.abilityType) {
        case "peek_disaster":
          if (s.disasterDeck.length === 0) return state;
          s.peek = { kind: "disaster", cardId: s.disasterDeck[0] };
          log(s, `${player.name} (Eagle) scouts ahead at the Disaster Deck.`);
          break;
        case "peek_event":
          if (s.eventDeck.length === 0) return state;
          s.peek = { kind: "event", cardId: s.eventDeck[0] };
          log(s, `${player.name} (Orangutan) studies the next incoming news.`);
          break;
        case "cancel_panic": {
          const tile = s.tiles[player.position];
          tile.occupants.forEach(calmVillager);
          tile.hasCrisisToken = false;
          tile.permanentPanic = false;
          log(s, `${player.name} (Komodo Dragon) grounds the panic on their tile.`);
          break;
        }
        default:
          log(s, `${role?.name}'s ability is passive — it's always working.`);
          return s;
      }
      s.abilityUsed[player.id] = true;
      return s;
    }

    case "CLEAR_PEEK": {
      if (!s.peek) return state;
      s.peek = null;
      return s;
    }

    // ——— Debug / playtest actions ———
    case "DEBUG_SET_PANIC": {
      s.panicMeter = Math.max(0, Math.min(s.panicMeterMax, action.value));
      log(s, `[debug] Panic Meter set to ${s.panicMeter}.`);
      applyGameOverCheck(s);
      return s;
    }
    case "DEBUG_SET_PHASE": {
      s.phase = action.phase as GamePhase;
      if (s.phase === "phase3_evacuation") enterEvacuationPhase(s);
      log(s, `[debug] Phase set to ${action.phase}.`);
      return s;
    }
    case "DEBUG_SET_EVENT_TOP": {
      s.eventDeck = [action.cardId, ...s.eventDeck.filter((id) => id !== action.cardId)];
      log(s, `[debug] Event deck top set to ${action.cardId}.`);
      return s;
    }
    case "DEBUG_SET_DISASTER_TOP": {
      s.disasterDeck = [action.cardId, ...s.disasterDeck.filter((id) => id !== action.cardId)];
      log(s, `[debug] Disaster deck top set to ${action.cardId}.`);
      return s;
    }
    case "DEBUG_EMPTY_DISASTER_DECK": {
      s.disasterDeck = s.disasterDeck.slice(0, 1);
      log(s, `[debug] Disaster deck trimmed to 1 card.`);
      return s;
    }

    default:
      return state;
  }
}
