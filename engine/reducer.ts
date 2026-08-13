// ============================================================================
// RING OF FIRE v2 — pure reducer: (state, action) => newState.
// No DOM, no React, no I/O, no Math.random (seeded PRNG only).
// Phase order: p1_disaster -> p2_news -> p3_turns -> p4_verdict -> p5_impact
// ============================================================================
import type {
  ChaosCard,
  EvidenceCard,
  GameAction,
  GameState,
  NewsEffect,
  Player,
  Scenario,
  SectorId,
  SubMissionKey,
  TileDamage,
  TileState,
  VillagerToken,
} from "./types";
import { scenarioById } from "@/data/scenarios";
import { roleById } from "@/data/roles";
import { newsCardById } from "@/data/newsCards";
import { evidenceCardById, buildEvidenceDeck } from "@/data/evidenceCards";
import { disasterCardById, buildDisasterDeck } from "@/data/disasterCards";
import { chaosCardById } from "@/data/chaosCards";
import { rewardCardById } from "@/data/rewardCards";
import {
  BARTER_COST,
  DISASTER_DECK_SIZE,
  INVESTIGATE_COST,
  PANIC_METER_MAX,
  STARTING_HAND,
  SUB_MISSION_REPUTATION,
  allNeighbors,
  applyChaos,
  areRimAdjacent,
  areSeaLaneLinked,
  calmCost,
  checkGameOver,
  escortBlocked,
  escortCost,
  handLimit,
  hasAbility,
  hasChaos,
  isCategoryBlocked,
  isPassable,
  isSeaLaneOpen,
  maxEscortGroup,
  moveCost,
  mulberry32,
  nearestPanickedVillager,
  nearestSafeStep,
  resolveVerdict,
  roleOf,
  sectorTiles,
  shuffled,
  startingAp,
  stepTowardNearestReadyPost,
} from "./rules";

// ——— Loose data views (the data lane owns these modules) ————————————————
const scenarioMap = scenarioById as unknown as Record<string, Scenario | undefined>;
const newsMap = newsCardById as unknown as Record<string, GameState["activeNews"]>;
const disasterMap = disasterCardById as unknown as Record<string, GameState["activeDisaster"]>;
const evidenceMap = evidenceCardById as unknown as Record<string, EvidenceCard | undefined>;
const chaosMap = chaosCardById as unknown as Record<string, ChaosCard | undefined>;
const rewardMap = rewardCardById as unknown as Record<
  string,
  { id: string; cost: number; title: string; effectKey: string } | undefined
>;

// ——— Small utilities ——————————————————————————————————————————————————

function log(s: GameState, message: string) {
  s.log.push({ round: s.round, phase: s.phase, message, timestamp: s.log.length });
}

function nextSeed(s: GameState): number {
  s.rngSeed = (Math.imul(s.rngSeed, 1103515245) + 12345) >>> 0;
  return s.rngSeed;
}

function currentPlayer(s: GameState): Player | undefined {
  return s.players[s.currentPlayerIndex];
}

function findPlayer(s: GameState, playerId: string): Player | undefined {
  return s.players.find((p) => p.id === playerId);
}

/** Remove ONE instance of a card id from a hand (decks contain duplicates). */
function removeFromHand(player: Player, cardId: string): boolean {
  const i = player.hand.indexOf(cardId);
  if (i === -1) return false;
  player.hand.splice(i, 1);
  return true;
}

function applyGameOverCheck(s: GameState, endOfRound = false) {
  if (s.phase === "game_over") return;
  const result = checkGameOver(s, { endOfRound });
  if (result.over) {
    s.phase = "game_over";
    s.gameOverReason = result.reason!;
    log(s, `Game over: ${result.reason}.`);
  }
}

// ——— Decks ————————————————————————————————————————————————————————————

/** Draw one Evidence card. Reshuffles the discard pile when the deck runs dry. */
function drawEvidence(s: GameState, player: Player): boolean {
  if (s.decks.evidence.length === 0) {
    if (s.discards.evidence.length > 0) {
      s.decks.evidence = shuffled(s.discards.evidence, nextSeed(s));
      s.discards.evidence = [];
      log(s, "The Evidence discard pile was reshuffled into a fresh deck.");
    } else {
      s.decks.evidence = shuffled(buildEvidenceDeck(), nextSeed(s));
    }
  }
  const id = s.decks.evidence.shift();
  if (!id) return false;
  player.hand.push(id);
  return true;
}

function drawNewsId(s: GameState): string | null {
  if (s.decks.news.length === 0) {
    const pool = s.discards.news.length > 0 ? s.discards.news : Object.keys(newsMap);
    s.decks.news = shuffled(pool, nextSeed(s));
    s.discards.news = [];
    log(s, "The News deck was reshuffled.");
  }
  return s.decks.news.shift() ?? null;
}

function drawChaosId(s: GameState): string | null {
  if (s.decks.chaos.length === 0) {
    const all = Object.keys(chaosMap);
    const fresh = all.filter((id) => !s.activeChaos.includes(id));
    s.decks.chaos = shuffled(fresh.length > 0 ? fresh : all, nextSeed(s));
  }
  return s.decks.chaos.shift() ?? null;
}

// ——— Villagers & tiles ————————————————————————————————————————————————

function calmVillager(v: VillagerToken) {
  if (v.status === "panicked") v.status = "calm";
}

/** 🦎 Komodo — Aura Otoritas: no auto-panic on the tile they are standing on. */
function panicTile(s: GameState, tile: TileState) {
  const grounded = s.players.some((p) => p.position === tile.index && hasAbility(p, "suppress"));
  if (grounded) {
    log(s, "Steady Herd holds the panic on that tile.");
    return;
  }
  for (const v of tile.occupants) if (v.status === "calm") v.status = "panicked";
}

function allSectorIds(s: GameState): SectorId[] {
  const out: SectorId[] = [];
  for (const t of s.tiles) {
    if (t.sectorId && !out.includes(t.sectorId)) out.push(t.sectorId);
  }
  return out;
}

/** Deterministic pick: most villagers, ties broken by lowest ring index. */
function pickMostVillagers(candidates: TileState[]): TileState | undefined {
  let best: TileState | undefined;
  for (const t of candidates) {
    if (!best || t.occupants.length > best.occupants.length) best = t;
  }
  return best;
}

/** 2-stage damage: 0 -> 1 Retak -> 2 Hancur. Pos Siaga never takes damage. */
function damageTile(s: GameState, index: number) {
  const tile = s.tiles[index];
  if (!tile || tile.isReadyPost || tile.damage >= 2) return;
  tile.damage = (tile.damage + 1) as TileDamage;
  if (tile.damage === 1) {
    log(s, `Tile ${index} is CRACKED — entering it now costs more.`);
    return;
  }
  const lost = [...tile.occupants];
  for (const v of lost) {
    v.status = "lost";
    s.casualties.push(v);
  }
  tile.occupants = [];
  tile.hasCrisisToken = false;
  log(
    s,
    lost.length > 0
      ? `Tile ${index} is DESTROYED — ${lost.length} lost!`
      : `Tile ${index} is DESTROYED — thankfully nobody was on it.`
  );
  for (const p of s.players) {
    if (p.position !== index) continue;
    const step = nearestSafeStep(s, index);
    if (step !== null) {
      p.position = step;
      log(s, `${p.name} melompat ke ubin ${step} tepat pada waktunya!`);
    }
  }
}

/** Chaos "Panic Exodus": villagers wander to a random neighbouring tile. */
function driftVillagers(s: GameState, count: number) {
  const rng = mulberry32(nextSeed(s));
  for (let k = 0; k < count; k++) {
    const movable = s.tiles.filter((t) => !t.isReadyPost && t.occupants.length > 0);
    if (movable.length === 0) return;
    const tile = movable[Math.floor(rng() * movable.length)];
    const options = allNeighbors(s, tile.index).filter((n) => isPassable(s.tiles[n]));
    if (options.length === 0) continue;
    const target = s.tiles[options[Math.floor(rng() * options.length)]];
    const villager = tile.occupants.shift();
    if (!villager) continue;
    villager.tileIndex = target.index;
    if (target.isReadyPost) {
      villager.status = "rescued";
      s.evacuees.push(villager);
    } else {
      target.occupants.push(villager);
    }
  }
  log(s, "Panic Exodus — villagers scatter with no direction.");
}

// ——— Sub-missions ——————————————————————————————————————————————————————

function bumpSubMission(
  s: GameState,
  player: Player,
  key: SubMissionKey,
  amount = 1
) {
  const role = roleOf(player);
  if (!role || role.subMissionKey !== key || player.subMissionDone) return;
  player.subMissionProgress += amount;
}

/** 🦧 "Epistemic Collector" is a snapshot condition, so re-evaluate on hand change. */
function refreshCollector(s: GameState) {
  for (const p of s.players) {
    const role = roleOf(p);
    if (!role || role.subMissionKey !== "collect_3pt" || p.subMissionDone) continue;
    const threePointers = p.hand.filter((id) => evidenceMap[id]?.points === 3).length;
    if (threePointers > p.subMissionProgress) p.subMissionProgress = threePointers;
  }
}

function awardSubMissions(s: GameState) {
  for (const p of s.players) {
    const role = roleOf(p);
    if (!role || p.subMissionDone) continue;
    const target = role.subMissionTarget ?? 3;
    if (p.subMissionProgress < target) continue;
    p.subMissionDone = true;
    s.reputation += SUB_MISSION_REPUTATION;
    s.stats.subMissionsDone += 1;
    log(s, `Sub-Mission "${role.subMissionName}" complete — +${SUB_MISSION_REPUTATION} Reputation!`);
  }
}

// ——— News effects ——————————————————————————————————————————————————————

function moveVillagerTo(s: GameState, villager: VillagerToken, fromTile: TileState, toIndex: number) {
  fromTile.occupants = fromTile.occupants.filter((v) => v.id !== villager.id);
  const target = s.tiles[toIndex];
  villager.tileIndex = toIndex;
  if (target?.isReadyPost) {
    villager.status = "rescued";
    s.evacuees.push(villager);
  } else if (target) {
    target.occupants.push(villager);
  }
}

function applyNewsEffect(s: GameState, effect: NewsEffect | undefined) {
  if (!effect) return;
  const tile = s.newsTileIndex !== null ? s.tiles[s.newsTileIndex] : null;
  const sectorId = s.activeNews?.targetSectorId ?? null;

  if (effect.panic) {
    if (s.panicShield) {
      log(s, "Mental Fortitude holds the Panic Meter this round.");
    } else {
      s.panicMeter += effect.panic;
      log(s, `The Panic Meter climbs to ${s.panicMeter}.`);
    }
  }
  if (effect.panicTargetSector && sectorId) {
    for (const t of sectorTiles(s, sectorId)) panicTile(s, t);
  }
  if (effect.calmTargetSector && sectorId) {
    for (const t of sectorTiles(s, sectorId)) t.occupants.forEach(calmVillager);
    log(s, "Good information calms the target sector.");
  }
  if (effect.lockEvacuationSector && sectorId) {
    for (const t of sectorTiles(s, sectorId)) t.evacuationLocked = true;
    log(s, "Evacuation in the target sector is locked for one round.");
  }
  if (effect.apPenaltyFirstPlayer) {
    const first = s.players[s.firstPlayerIndex];
    if (first) {
      s.pendingApBonus[first.id] = (s.pendingApBonus[first.id] ?? 0) - effect.apPenaltyFirstPlayer;
      log(s, `${first.name} loses ${effect.apPenaltyFirstPlayer} AP next round.`);
    }
  }
  if (effect.stepTowardReadyPost && tile) {
    const step = stepTowardNearestReadyPost(s, tile.index);
    if (step !== null) {
      for (const v of [...tile.occupants]) moveVillagerTo(s, v, tile, step);
      log(s, "Villagers step once toward the nearest Ready Post.");
    }
  }
  if (effect.removeCrisisToken && tile) {
    tile.hasCrisisToken = false;
  }
  if (effect.apBonus) {
    for (const p of s.players) {
      s.pendingApBonus[p.id] = (s.pendingApBonus[p.id] ?? 0) + effect.apBonus;
    }
    log(s, `Every Guardian gets +${effect.apBonus} AP next round.`);
  }
  if (effect.drawEvidence) {
    for (const p of s.players) {
      for (let i = 0; i < effect.drawEvidence; i++) drawEvidence(s, p);
    }
    refreshCollector(s);
  }
}

// ——— Phase transitions ————————————————————————————————————————————————

/** Fase 3 entry: hand out AP (4 ± pending bonuses / Reward / Chaos), reset flags. */
function enterTurnsPhase(s: GameState) {
  s.phase = "p3_turns";
  for (const p of s.players) {
    p.ap = startingAp(s, p);
    p.activeUsedThisRound = false;
    p.escortBonusAp = 0;
  }
  // pendingApBonus is a one-round carry: granted last round, consumed right here.
  s.pendingApBonus = {};
  s.playersEndedTurn = [];
  s.currentPlayerIndex = s.firstPlayerIndex;
  log(s, "Phase 3 — Guardian Turns. Spend your Action Points!");
}

function enterVerdictPhase(s: GameState) {
  s.phase = "p4_verdict";
  // "Evacuation locked" lasts exactly one round; it expires here, before a new
  // Fase 4 can set it again.
  for (const t of s.tiles) t.evacuationLocked = false;
  log(s, "Phase 4 — The Verdict. Open the locks, commit, then flip the card.");
}

/** Commit & Flip resolution — the heart of the game. */
function resolveFlip(s: GameState) {
  const news = s.activeNews;
  if (!news || s.newsRevealed) return;
  s.newsRevealed = true;
  const outcome = resolveVerdict(s);
  s.lastOutcome = outcome;
  const tile = s.newsTileIndex !== null ? s.tiles[s.newsTileIndex] : null;

  if (outcome === "verified") {
    s.reputation += 1;
    s.stats.verified += 1;
    if (news.truth === "hoax") s.stats.hoaxDebunked += 1;
    else s.stats.factsValidated += 1;
    if (tile) tile.hasCrisisToken = false;
    log(s, `VERIFIED — "${news.title}" was ${news.truth.toUpperCase()}. +1 Reputation.`);
    applyNewsEffect(s, news.ifValidated);
  } else if (outcome === "lucky_guess") {
    s.stats.luckyGuess += 1;
    log(
      s,
      `LUCKY GUESS — your verdict was right, but the locks were not both open. ` +
        `No Reputation, and the Crisis Token stays on the board.`
    );
  } else {
    s.stats.rumourSpreads += 1;
    if (s.panicShield) {
      log(s, "RUMOUR SPREADS — but Mental Fortitude holds the Panic Meter this round.");
    } else {
      s.panicMeter += 1;
      log(s, `RUMOUR SPREADS — the Panic Meter climbs to ${s.panicMeter}.`);
    }
    const chaosId = drawChaosId(s);
    if (chaosId) {
      const card = applyChaos(s, chaosId);
      if (card) log(s, `Chaos card: "${card.title}" — ${card.description}`);
    }
    applyNewsEffect(s, news.ifIgnored);
  }
  applyGameOverCheck(s);
}

function applyDisasterDamage(s: GameState) {
  const d = s.activeDisaster;
  if (!d || d.damageTarget === "none") return;
  const targets: number[] = [];
  if (d.damageTarget === "most_villagers") {
    const t = pickMostVillagers(s.tiles.filter((x) => !x.isReadyPost && x.damage < 2));
    if (t) targets.push(t.index);
  } else {
    const sectors = d.affectedSectorIds?.length ? d.affectedSectorIds : allSectorIds(s);
    for (const sec of sectors) {
      const t = pickMostVillagers(
        s.tiles.filter((x) => x.sectorId === sec && !x.isReadyPost && x.damage < 2)
      );
      if (t && !targets.includes(t.index)) targets.push(t.index);
    }
  }
  if (targets.length > 0) log(s, `Konsekuensi Akhir: ${d.endEffect}`);
  for (const i of targets) damageTile(s, i);
}

/** Fase 5 — Dampak & Eskalasi. */
function enterImpactPhase(s: GameState) {
  // A table that never flipped the card is treated as an abstain.
  if (s.activeNews && !s.newsRevealed) {
    if (s.verdict === null) s.verdict = "abstain";
    resolveFlip(s);
  }
  if (s.phase === "game_over") return;

  s.phase = "p5_impact";
  log(s, "Phase 5 — Impact & Escalation.");
  applyDisasterDamage(s);
  if (hasChaos(s, "villager_drift")) driftVillagers(s, 2);
  refreshCollector(s);
  awardSubMissions(s);
  applyGameOverCheck(s, true);
}

function startNextRound(s: GameState) {
  if (s.activeNews) s.discards.news.push(s.activeNews.id);
  s.round += 1;
  s.firstPlayerIndex = s.players.length > 0 ? (s.firstPlayerIndex + 1) % s.players.length : 0;
  s.currentPlayerIndex = s.firstPlayerIndex;
  s.activeDisaster = null;
  s.activeNews = null;
  s.newsTileIndex = null;
  s.locksOpened = [];
  s.verdict = null;
  s.newsRevealed = false;
  s.lastOutcome = null;
  s.panicShield = false;
  s.playersEndedTurn = [];
  s.peek = null;
  s.seaLaneOpen = true;
  for (const p of s.players) {
    p.activeUsedThisRound = false;
    p.altRouteReady = false;
    p.escortBonusAp = 0;
  }
  s.phase = "p1_disaster";
  const first = s.players[s.firstPlayerIndex];
  log(s, `Round ${s.round} begins. First player: ${first ? first.name : "-"}.`);
  applyGameOverCheck(s);
}

// ——— START_GAME ————————————————————————————————————————————————————————

function buildTiles(scenario: Scenario): TileState[] {
  // Every tile, rim AND Sea Lane — the layout array is the source of truth for
  // length (27), while `ringSize` (24) governs rim arithmetic only.
  const size = scenario.layout?.length || scenario.ringSize || 27;
  const readyPosts = new Set(scenario.readyPostIndices ?? []);
  const seaLane = new Set(scenario.seaLaneIndices ?? []);
  const sectorOf = (i: number): SectorId | null =>
    (scenario.sectors ?? []).find((sec) => sec.tileIndices.includes(i))?.id ?? null;
  return Array.from({ length: size }, (_, index) => ({
    index,
    typeId:
      scenario.layout?.[index] ??
      (readyPosts.has(index) ? "ready_post" : seaLane.has(index) ? "sea_lane" : "sector"),
    // Ready Posts and Sea Lane tiles belong to no sector.
    sectorId: readyPosts.has(index) || seaLane.has(index) ? null : sectorOf(index),
    isReadyPost: readyPosts.has(index),
    isSeaLane: seaLane.has(index),
    damage: 0 as TileDamage,
    occupants: [],
    hasCrisisToken: false,
    evacuationLocked: false,
  }));
}

function seedVillagers(scenario: Scenario, tiles: TileState[]) {
  const total = scenario.totalVillagers || 16;
  let placed = 0;
  const put = (index: number) => {
    const tile = tiles[index];
    if (!tile || tile.isReadyPost) return;
    placed += 1;
    tile.occupants.push({ id: `w${placed}`, status: "calm", tileIndex: index });
  };
  (scenario.villagerSetup ?? []).forEach((count, index) => {
    for (let k = 0; k < count && placed < total; k++) put(index);
  });
  // Fallback so the board is never empty if villagerSetup is missing/short.
  if (placed < total) {
    const open = tiles.filter((t) => !t.isReadyPost).map((t) => t.index);
    let cursor = 0;
    while (placed < total && open.length > 0) {
      put(open[cursor % open.length]);
      cursor += 1;
    }
  }
}

function startGame(action: Extract<GameAction, { type: "START_GAME" }>): GameState {
  const scenario = scenarioMap[action.scenarioId] ?? (Object.values(scenarioMap)[0] as Scenario);
  const seed = (action.seed ?? 1) >>> 0;

  const tiles = buildTiles(scenario);
  seedVillagers(scenario, tiles);

  const posList = scenario.readyPostIndices?.length ? scenario.readyPostIndices : [0];
  const players: Player[] = action.players.map((p, i) => ({
    id: `p${i + 1}`,
    name:
      p.name.trim() ||
      (roleById as unknown as Record<string, { name?: string } | undefined>)[p.roleId]?.name ||
      `Player ${i + 1}`,
    roleId: p.roleId,
    ap: 0,
    hand: [],
    position: posList[i % posList.length],
    activeUsedThisRound: false,
    altRouteReady: false,
    escortBonusAp: 0,
    subMissionProgress: 0,
    subMissionDone: false,
    damagedTilesVisited: [],
  }));

  const s: GameState = {
    phase: "p1_disaster",
    round: 1,
    scenarioId: scenario.id,
    players,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    playersEndedTurn: [],
    tiles,
    panicMeter: 0,
    panicMeterMax: PANIC_METER_MAX,
    reputation: 0,
    activeDisaster: null,
    activeNews: null,
    newsTileIndex: null,
    locksOpened: [],
    verdict: null,
    newsRevealed: false,
    lastOutcome: null,
    decks: {
      disaster: shuffled(buildDisasterDeck((scenario.disasterDeckSize ?? DISASTER_DECK_SIZE)), seed + 3).slice(
        0,
        (scenario.disasterDeckSize ?? DISASTER_DECK_SIZE)
      ),
      news: shuffled(Object.keys(newsMap), seed + 1),
      evidence: shuffled(buildEvidenceDeck(), seed + 2),
      chaos: shuffled(Object.keys(chaosMap), seed + 4),
    },
    discards: { disaster: [], news: [], evidence: [] },
    activeChaos: [],
    ownedRewards: [],
    evacuees: [],
    casualties: [],
    gameOverReason: null,
    log: [],
    stats: {
      verified: 0,
      luckyGuess: 0,
      rumourSpreads: 0,
      hoaxDebunked: 0,
      factsValidated: 0,
      subMissionsDone: 0,
    },
    pendingApBonus: {},
    panicShield: false,
    peek: null,
    seaLaneOpen: true,
    rngSeed: seed,
  };

  for (const p of s.players) {
    for (let i = 0; i < STARTING_HAND; i++) drawEvidence(s, p);
  }
  refreshCollector(s);
  log(s, `Satwa Penjaga berkumpul di ${scenario.name}. Ronde 1 dimulai!`);
  return s;
}

// ——— The reducer ——————————————————————————————————————————————————————

export function reduce(state: GameState | null, action: GameAction): GameState | null {
  if (action.type === "RESET_GAME") return null;
  if (action.type === "START_GAME") return startGame(action);
  if (!state) return state;

  const s = structuredClone(state);
  const isDebug = action.type.startsWith("DEBUG_");
  if (s.phase === "game_over" && !isDebug) return state;

  switch (action.type) {
    // ——— Fase 1 — Murka Cincin Api ———————————————————————————————————
    case "DRAW_DISASTER": {
      if (s.phase !== "p1_disaster" || s.activeDisaster) return state;
      if (s.decks.disaster.length === 0) {
        s.phase = "game_over";
        s.gameOverReason = "timeout";
        log(s, "The Disaster deck is empty — the megathrust arrives. Out of time.");
        return s;
      }
      const id = s.decks.disaster.shift()!;
      const card = disasterMap[id];
      if (!card) return state;
      s.activeDisaster = card;
      s.discards.disaster.push(id);
      // Rute Laut tertutup total saat bencana Oseanografi.
      s.seaLaneOpen = card.category !== "oceanic";
      log(s, `Bencana: "${card.title}" — ${card.roundEffect}`);
      if (!s.seaLaneOpen) log(s, "The Sea Lane is CLOSED this round.");

      if (card.roundEffectKey === "panic_spread") {
        const sectors = card.affectedSectorIds?.length ? card.affectedSectorIds : allSectorIds(s);
        for (const sec of sectors) for (const t of sectorTiles(s, sec)) panicTile(s, t);
        log(s, "Aftershock swarm — villagers in the affected sector panic.");
      }
      if (card.roundEffectKey === "peek_disaster" && s.decks.disaster.length > 0) {
        s.peek = { kind: "disaster", cardId: s.decks.disaster[0] };
        log(s, "Wildlife comes down the mountain — the team may peek at the next Disaster Card.");
      }
      return s;
    }

    // ——— Fase 2 — Kabar Mengudara ————————————————————————————————————
    case "DRAW_NEWS": {
      if (s.phase !== "p2_news" || s.activeNews) return state;
      const id = drawNewsId(s);
      if (!id) return state;
      const card = newsMap[id];
      if (!card) return state;
      s.activeNews = card;
      s.newsRevealed = false;
      s.verdict = null;
      s.locksOpened = [];
      s.lastOutcome = null;

      const inSector = s.tiles.filter(
        (t) => t.sectorId === card.targetSectorId && !t.isReadyPost && t.damage < 2
      );
      const pool = inSector.length > 0 ? inSector : s.tiles.filter((t) => !t.isReadyPost && t.damage < 2);
      const target = pickMostVillagers(pool);
      s.newsTileIndex = target ? target.index : null;
      log(s, `Berita masuk: "${card.title}" (${card.category}).`);
      if (target) {
        target.hasCrisisToken = true;
        panicTile(s, target);
        log(s, `A Crisis Token lands on tile ${target.index} — everyone there panics.`);
      }
      return s;
    }

    // ——— Fase 3 — Giliran Pemain —————————————————————————————————————
    case "MOVE_PLAYER": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      const active = currentPlayer(s);
      if (!player || !active || player.id !== active.id) return state;
      const to = action.targetTileIndex;
      const target = s.tiles[to];
      if (!target || !isPassable(target)) return state;
      const viaSea = !!action.viaSeaLane;
      if (viaSea) {
        if (!isSeaLaneOpen(s)) {
          log(s, "The Sea Lane is closed this round.");
          return s;
        }
        if (!areSeaLaneLinked(s, player.position, to)) return state;
      } else if (!areRimAdjacent(s, player.position, to)) {
        return state;
      }
      const cost = moveCost(s, player.position, to, player, viaSea);
      if (player.ap < cost) {
        log(s, `Not enough AP to move (needs ${cost}).`);
        return s;
      }
      const rawCost = moveCost(s, player.position, to, { ...player, altRouteReady: false }, viaSea);
      if (player.altRouteReady && rawCost > cost) {
        player.altRouteReady = false;
        log(s, `${player.name} takes an alternate route — penalty ignored.`);
      }
      player.ap -= cost;
      player.position = to;
      log(s, `${player.name} bergerak ke ubin ${to} (${cost} AP).`);
      return s;
    }

    case "CALM_VILLAGER": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      const active = currentPlayer(s);
      if (!player || !active || player.id !== active.id) return state;
      const tile = s.tiles[player.position];
      const villager = tile?.occupants.find((v) => v.id === action.villagerId);
      if (!villager) return state;
      if (villager.status !== "panicked") return state;
      const cost = calmCost(s);
      if (player.ap < cost) {
        log(s, `Not enough AP to calm (needs ${cost}).`);
        return s;
      }
      player.ap -= cost;
      villager.status = "calm";
      bumpSubMission(s, player, "calm_six", 1);
      log(s, `${player.name} calms a villager (${cost} AP).`);
      return s;
    }

    case "ESCORT_VILLAGER": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      const active = currentPlayer(s);
      if (!player || !active || player.id !== active.id) return state;
      const from = s.tiles[player.position];
      const to = action.targetTileIndex;
      const target = s.tiles[to];
      if (!from || !target || !isPassable(target)) return state;
      const viaSea = !!action.viaSeaLane;
      if (viaSea) {
        if (!isSeaLaneOpen(s)) {
          log(s, "The Sea Lane is closed this round.");
          return s;
        }
        if (!areSeaLaneLinked(s, player.position, to)) return state;
      } else if (!areRimAdjacent(s, player.position, to)) {
        return state;
      }

      const ids = action.villagerIds ?? [];
      if (ids.length === 0) return state;
      const limit = maxEscortGroup(player, viaSea);
      if (ids.length > limit) {
        log(s, `You can escort at most ${limit} villagers at once.`);
        return s;
      }
      const group: VillagerToken[] = [];
      for (const id of ids) {
        const v = from.occupants.find((o) => o.id === id);
        if (!v) return state;
        group.push(v);
      }
      if (group.some((v) => v.status !== "calm")) {
        log(s, "Panicking villagers will not follow — calm them first!");
        return s;
      }
      if (escortBlocked(s, from, target)) {
        log(s, "Evacuation along that route is locked this round.");
        return s;
      }
      // Rumor yang belum dibongkar mengunci evakuasi: warga terlalu gaduh untuk
      // digiring. Menenangkan satu per satu tidak cukup — Token Krisis hanya
      // hilang lewat verifikasi yang berhasil atau kemampuan Komodo.
      // Inilah yang membuat mekanik MIL menjadi penentu, bukan pelengkap.
      if (from.hasCrisisToken) {
        log(
          s,
          "They refuse to be led — the story on this tile is still unproven. " +
            "Settle the story first!"
        );
        return s;
      }

      const cost = escortCost(s, player.position, to, player, viaSea);
      // 🐯 Tactical Escort: a dedicated +1 AP usable only for evacuation.
      const pool = hasAbility(player, "tactical_escort") ? Math.min(player.escortBonusAp, cost) : 0;
      if (player.ap < cost - pool) {
        log(s, `Not enough AP to escort (needs ${cost}).`);
        return s;
      }
      const rawCost = escortCost(s, player.position, to, { ...player, altRouteReady: false }, viaSea);
      if (player.altRouteReady && rawCost > cost) player.altRouteReady = false;
      player.escortBonusAp -= pool;
      player.ap -= cost - pool;

      const fromCrisis = from.hasCrisisToken;
      for (const v of group) {
        moveVillagerTo(s, v, from, to);
        if (target.isReadyPost && fromCrisis) bumpSubMission(s, player, "rescue_crisis", 1);
        if (target.isReadyPost && viaSea) bumpSubMission(s, player, "safe_passage", 1);
      }
      player.position = to;
      if (target.isReadyPost) {
        log(
          s,
          `${player.name} brings ${group.length} to a Ready Post — SAFE! ` +
            `(${s.evacuees.length} terselamatkan)`
        );
        applyGameOverCheck(s);
      } else {
        log(s, `${player.name} escorts ${group.length} to tile ${to} (${cost} AP).`);
      }
      return s;
    }

    case "INVESTIGATE": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      const active = currentPlayer(s);
      if (!player || !active || player.id !== active.id) return state;
      if (player.ap < INVESTIGATE_COST) {
        log(s, `Not enough AP to investigate (needs ${INVESTIGATE_COST}).`);
        return s;
      }
      player.ap -= INVESTIGATE_COST;
      drawEvidence(s, player);
      refreshCollector(s);
      log(s, `${player.name} investigates and draws 1 Evidence card.`);
      return s;
    }

    case "PLAY_EVIDENCE_LOCK": {
      const openWindow = s.phase === "p3_turns" || (s.phase === "p4_verdict" && s.verdict === null);
      if (!openWindow) return state;
      const news = s.activeNews;
      if (!news) return state;
      const player = findPlayer(s, action.playerId);
      const card = evidenceMap[action.evidenceId];
      if (!player || !card) return state;
      if (!news.locks.includes(action.lock)) {
        log(s, `This News Card has no [${action.lock}] lock.`);
        return s;
      }
      if (s.locksOpened.includes(action.lock)) {
        log(s, `The [${action.lock}] lock is already open.`);
        return s;
      }
      if (isCategoryBlocked(s, action.lock)) {
        log(s, `The [${action.lock}] lock cannot be opened this round.`);
        return s;
      }
      if (isCategoryBlocked(s, card.category)) {
        log(s, `${card.category} evidence cannot be used right now.`);
        return s;
      }
      const matches = card.isWildcard || card.category === action.lock;
      if (!matches) {
        log(s, `"${card.title}" (${card.category}) does not fit the [${action.lock}] lock.`);
        return s;
      }
      if (!removeFromHand(player, card.id)) return state;
      s.discards.evidence.push(card.id);
      s.locksOpened.push(action.lock);
      log(s, `${player.name} memasang "${card.title}" — gembok [${action.lock}] terbuka!`);

      if (card.bonus === "refund_ap") {
        if (s.phase === "p3_turns") player.ap += 1;
        else s.pendingApBonus[player.id] = (s.pendingApBonus[player.id] ?? 0) + 1;
        log(s, `${player.name} mendapat 1 AP kembali (bonus kartu 2 poin).`);
      }
      if (card.bonus === "calm_nearest") {
        const v = nearestPanickedVillager(s, player.position);
        if (v) {
          calmVillager(v);
          log(s, "A clear explanation calms the nearest panicking villager.");
        }
      }
      // 🐒 Katalisator Informasi: a bartered card used to crack the news this round.
      if (hasAbility(player, "network_sync") && player.escortBonusAp > 0) {
        player.escortBonusAp -= 1;
        bumpSubMission(s, player, "catalyst", 1);
      }
      refreshCollector(s);
      return s;
    }

    case "DISCARD_FOR_RESOURCE": {
      if (s.phase !== "p3_turns" && s.phase !== "p4_verdict") return state;
      const player = findPlayer(s, action.playerId);
      const card = evidenceMap[action.evidenceId];
      if (!player || !card) return state;
      const roundKey = s.activeDisaster?.roundEffectKey;
      if (card.resourceKind === "trade" && roundKey === "block_trade") {
        log(s, "Total gridlock — cards cannot be swapped this round.");
        return s;
      }
      if (
        (card.resourceKind === "ap2" || card.resourceKind === "alt_route") &&
        roundKey === "no_evidence_move"
      ) {
        log(s, "Evidence cannot be discarded for movement this round.");
        return s;
      }
      if (!removeFromHand(player, card.id)) return state;
      s.discards.evidence.push(card.id);

      switch (card.resourceKind) {
        case "ap2": {
          if (s.phase === "p3_turns") player.ap += 2;
          else s.pendingApBonus[player.id] = (s.pendingApBonus[player.id] ?? 0) + 2;
          log(s, `${player.name} melakukan Sprint Darurat — +2 AP!`);
          break;
        }
        case "alt_route": {
          player.altRouteReady = true;
          log(s, `${player.name} menemukan Jalur Alternatif — penalti berikutnya diabaikan.`);
          break;
        }
        case "trade": {
          const other = action.tradeWithPlayerId ? findPlayer(s, action.tradeWithPlayerId) : undefined;
          if (other && other.id !== player.id && action.tradeGiveCardId) {
            if (removeFromHand(player, action.tradeGiveCardId)) {
              const received = other.hand.shift();
              other.hand.push(action.tradeGiveCardId);
              if (received) player.hand.push(received);
              log(s, `${player.name} bertukar kartu dengan ${other.name} (Bantuan Logistik).`);
            }
          } else {
            log(s, `${player.name} membagikan info logistik ke tim.`);
          }
          break;
        }
        case "calm_free": {
          let v: VillagerToken | null = null;
          if (action.targetVillagerId) {
            for (const t of s.tiles) {
              const found = t.occupants.find((o) => o.id === action.targetVillagerId);
              if (found) v = found;
            }
          }
          if (!v || v.status !== "panicked") v = nearestPanickedVillager(s, player.position);
          if (v) {
            calmVillager(v);
            bumpSubMission(s, player, "calm_six", 1);
            log(s, `${player.name} uses the loudspeaker — 1 villager calms down (0 AP).`);
          } else {
            log(s, "Nobody here is panicking.");
          }
          break;
        }
        case "panic_shield": {
          s.panicShield = true;
          log(s, `${player.name} steadies the team — the Panic Meter holds this round.`);
          break;
        }
      }
      refreshCollector(s);
      return s;
    }

    case "BARTER": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      const active = currentPlayer(s);
      const other = findPlayer(s, action.withPlayerId);
      if (!player || !active || player.id !== active.id) return state;
      if (!other || other.id === player.id) return state;
      if (s.activeDisaster?.roundEffectKey === "block_trade") {
        log(s, "Total gridlock — no bartering this round.");
        return s;
      }
      // 🐒 Sinyal Repeater: Monyet barters at any range; everyone else must share a tile.
      if (!hasAbility(player, "network_sync") && player.position !== other.position) {
        log(s, "Barter only works with a player on the same tile.");
        return s;
      }
      if (player.ap < BARTER_COST) {
        log(s, `Not enough AP to barter (needs ${BARTER_COST}).`);
        return s;
      }
      if (!player.hand.includes(action.giveCardId) || !other.hand.includes(action.takeCardId)) {
        return state;
      }
      player.ap -= BARTER_COST;
      removeFromHand(player, action.giveCardId);
      removeFromHand(other, action.takeCardId);
      player.hand.push(action.takeCardId);
      other.hand.push(action.giveCardId);
      if (hasAbility(player, "network_sync")) player.escortBonusAp += 1;
      refreshCollector(s);
      log(s, `${player.name} barter kartu dengan ${other.name}.`);
      return s;
    }

    case "USE_ACTIVE_ABILITY": {
      if (s.phase !== "p3_turns") return state;
      const player = findPlayer(s, action.playerId);
      if (!player) return state;
      if (player.activeUsedThisRound) {
        log(s, `${player.name} already used their Active ability this round.`);
        return s;
      }
      const role = roleOf(player);
      if (!role) return state;

      switch (role.activeKey) {
        case "recon": {
          const which = action.deck === "news" ? "news" : "disaster";
          const deck = which === "news" ? s.decks.news : s.decks.disaster;
          if (deck.length === 0) {
            log(s, "That deck is empty — nothing to peek at.");
            return s;
          }
          s.peek = { kind: which, cardId: deck[0] };
          log(s, `${player.name} (Elang) melakukan Reconnaissance ke dek ${which}.`);
          break;
        }
        case "data_mining": {
          const news = s.activeNews;
          const ids = action.evidenceIds ?? [];
          const lock = action.lock;
          if (!news || !lock || ids.length < 2) return state;
          if (!news.locks.includes(lock) || s.locksOpened.includes(lock)) {
            log(s, `There is no [${lock}] lock on this card.`);
            return s;
          }
          const snapshot = [...player.hand];
          if (!ids.slice(0, 2).every((id) => removeFromHand(player, id))) {
            player.hand = snapshot;
            return state;
          }
          s.discards.evidence.push(...ids.slice(0, 2));
          s.locksOpened.push(lock);
          log(s, `${player.name} (Japanese Macaque) mines the archive — the [${lock}] lock is forced open!`);
          refreshCollector(s);
          break;
        }
        case "tactical_escort": {
          player.escortBonusAp += 1;
          log(s, `${player.name} (Harimau) siap Tactical Escort — +1 AP khusus evakuasi.`);
          break;
        }
        case "network_sync": {
          const other = action.targetPlayerId ? findPlayer(s, action.targetPlayerId) : undefined;
          if (!other || other.id === player.id) return state;
          s.peek = { kind: "hand", playerId: other.id };
          const ids = action.evidenceIds ?? [];
          if (ids.length >= 2) {
            const [mine, theirs] = ids;
            if (player.hand.includes(mine) && other.hand.includes(theirs)) {
              removeFromHand(player, mine);
              removeFromHand(other, theirs);
              player.hand.push(theirs);
              other.hand.push(mine);
              refreshCollector(s);
            }
          }
          log(s, `${player.name} (Monyet) Sinkronisasi Jaringan dengan ${other.name}.`);
          break;
        }
        case "suppress": {
          const tile = s.tiles[player.position];
          let calmed = 0;
          for (const v of tile?.occupants ?? []) {
            if (calmed >= 3) break;
            if (v.status === "panicked") {
              v.status = "calm";
              calmed += 1;
            }
          }
          bumpSubMission(s, player, "calm_six", calmed);
          // Komodo is the one escape hatch from a Crisis Token without
          // verifying — it costs the team their whole once-per-round ability,
          // so MIL stays the cheap path and this stays the emergency one.
          const hadCrisis = !!tile?.hasCrisisToken;
          if (tile) tile.hasCrisisToken = false;
          log(
            s,
            `${player.name} (Andean Llama) calms the crowd — ${calmed} villagers settle` +
              (hadCrisis ? ", and the Crisis Token here is lifted." : ".")
          );
          break;
        }
        default:
          return state;
      }
      player.activeUsedThisRound = true;
      return s;
    }

    case "END_PLAYER_TURN": {
      if (s.phase !== "p3_turns") return state;
      const player = currentPlayer(s);
      if (!player) return state;

      const limit = handLimit(s, player);
      while (player.hand.length > limit) {
        const dropped = player.hand.pop()!;
        s.discards.evidence.push(dropped);
        log(s, `${player.name} melebihi batas tangan (${limit}) — 1 kartu dibuang.`);
      }
      refreshCollector(s);

      const tile = s.tiles[player.position];
      // 🦅 Pemetaan Kritis: end a turn on 3 different damaged tiles.
      if (tile && tile.damage > 0 && !player.damagedTilesVisited.includes(tile.index)) {
        player.damagedTilesVisited.push(tile.index);
        bumpSubMission(s, player, "critical_mapping", 1);
      }
      // Pos Siaga bonus stage.
      if (tile?.isReadyPost) {
        s.pendingApBonus[player.id] = (s.pendingApBonus[player.id] ?? 0) + 1;
        log(s, `${player.name} rests at a Ready Post — +1 AP next round.`);
      }

      if (!s.playersEndedTurn.includes(player.id)) s.playersEndedTurn.push(player.id);
      if (s.playersEndedTurn.length >= s.players.length) {
        enterVerdictPhase(s);
        return s;
      }
      for (let step = 1; step <= s.players.length; step++) {
        const idx = (s.currentPlayerIndex + step) % s.players.length;
        if (!s.playersEndedTurn.includes(s.players[idx].id)) {
          s.currentPlayerIndex = idx;
          break;
        }
      }
      const nextUp = currentPlayer(s);
      if (nextUp) log(s, `Giliran ${nextUp.name}.`);
      return s;
    }

    // ——— Fase 4 — Sidang Fakta (Commit & Flip) ————————————————————————
    case "COMMIT_VERDICT": {
      if (s.phase !== "p4_verdict") return state;
      if (s.verdict !== null) return state; // immutable once committed
      if (!s.activeNews) return state;
      s.verdict = action.verdict;
      log(s, `Vonis tim: ${action.verdict.toUpperCase()}. Tidak bisa diubah lagi.`);
      return s;
    }

    case "FLIP_NEWS": {
      if (s.phase !== "p4_verdict") return state;
      if (!s.activeNews || s.newsRevealed) return state;
      if (s.verdict === null) {
        log(s, "Commit a verdict before you flip the card.");
        return s;
      }
      resolveFlip(s);
      return s;
    }

    // ——— Fase 5 — Dampak & Eskalasi ——————————————————————————————————
    case "BUY_REWARD": {
      if (s.phase !== "p5_impact") return state;
      const card = rewardMap[action.rewardId];
      if (!card) return state;
      if (s.ownedRewards.includes(card.id)) {
        log(s, `"${card.title}" is already owned.`);
        return s;
      }
      if (s.reputation < card.cost) {
        log(s, `Not enough Reputation for "${card.title}" (needs ${card.cost}).`);
        return s;
      }
      s.reputation -= card.cost;
      s.ownedRewards.push(card.id);
      log(s, `The team buys "${card.title}" (-${card.cost} Reputation).`);
      if (card.effectKey === "clear_chaos" && s.activeChaos.length > 0) {
        const removed = s.activeChaos.shift()!;
        const removedCard = chaosMap[removed];
        log(s, `The Field Clinic buys off the Chaos card "${removedCard?.title ?? removed}".`);
      }
      return s;
    }

    case "ADVANCE_PHASE": {
      switch (s.phase) {
        case "p1_disaster":
          if (!s.activeDisaster) return state;
          s.phase = "p2_news";
          log(s, "Phase 2 — Breaking News.");
          return s;
        case "p2_news":
          if (!s.activeNews) return state;
          enterTurnsPhase(s);
          return s;
        case "p3_turns":
          enterVerdictPhase(s);
          return s;
        case "p4_verdict":
          enterImpactPhase(s);
          return s;
        case "p5_impact":
          startNextRound(s);
          return s;
        default:
          return state;
      }
    }

    case "CLEAR_PEEK": {
      if (!s.peek) return state;
      s.peek = null;
      return s;
    }

    // ——— Debug / playtest ————————————————————————————————————————————
    case "DEBUG_SET_PANIC": {
      s.panicMeter = Math.max(0, Math.min(s.panicMeterMax, action.value));
      log(s, `[debug] Panic Meter = ${s.panicMeter}.`);
      applyGameOverCheck(s);
      return s;
    }
    case "DEBUG_SET_REPUTATION": {
      s.reputation = Math.max(0, action.value);
      log(s, `[debug] Reputation = ${s.reputation}.`);
      return s;
    }
    case "DEBUG_SET_PHASE": {
      if (action.phase === "p3_turns") {
        enterTurnsPhase(s);
      } else {
        s.phase = action.phase;
      }
      if (s.phase !== "game_over") s.gameOverReason = null;
      log(s, `[debug] Phase = ${action.phase}.`);
      return s;
    }
    case "DEBUG_SET_NEWS_TOP": {
      s.decks.news = [action.cardId, ...s.decks.news.filter((id) => id !== action.cardId)];
      log(s, `[debug] Dek Berita paling atas = ${action.cardId}.`);
      return s;
    }
    case "DEBUG_SET_DISASTER_TOP": {
      s.decks.disaster = [action.cardId, ...s.decks.disaster.filter((id) => id !== action.cardId)];
      log(s, `[debug] Dek Bencana paling atas = ${action.cardId}.`);
      return s;
    }
    case "DEBUG_TRIM_DISASTER_DECK": {
      s.decks.disaster = s.decks.disaster.slice(0, 1);
      log(s, "[debug] Disaster deck trimmed to 1 card.");
      return s;
    }

    default:
      return state;
  }
}
