"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Flame,
  HandHelping,
  Newspaper,
  Search,
  Wind,
} from "lucide-react";
import type { EvidenceCard, EvidenceCategory, VillagerToken } from "@/engine/types";
import { useGameStore } from "@/store/gameStore";
import { scenarios } from "@/data/scenarios";
import { roleById } from "@/data/roles";
import { gameConfig } from "@/data/gameConfig";

import { useHydrated } from "@/lib/useHydrated";
import {
  calmCost,
  escortGroupLimit,
  handLimit,
  legalMoves,
  type MoveOption,
} from "@/lib/engineBridge";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";

import { RingBoard } from "@/components/board/RingBoard";
import { CrisisZoneCentre } from "@/components/board/CrisisZoneCentre";
import { TileInspector } from "@/components/board/TileInspector";
import { GameHud } from "@/components/hud/GameHud";
import { PhaseIndicator, isRoundPhase } from "@/components/hud/PhaseIndicator";
import { DisasterCardReveal } from "@/components/cards/DisasterCardReveal";
import { NewsCardDisplay } from "@/components/cards/NewsCardDisplay";
import { EvidenceCardHand } from "@/components/cards/EvidenceCardHand";
import { VerdictPanel } from "@/components/cards/VerdictPanel";
import { ChaosCardDisplay } from "@/components/cards/ChaosCardDisplay";
import { RewardShop } from "@/components/RewardShop";
import { RolePanel } from "@/components/RolePanel";
import { TableTalkNote } from "@/components/TableTalkNote";
import { DiscussionTimer } from "@/components/DiscussionTimer";
import { BarterModal } from "@/components/BarterModal";
import { ActiveAbilityModal } from "@/components/ActiveAbilityModal";
import { PeekModal } from "@/components/PeekModal";
import { GameOverModal } from "@/components/GameOverModal";
import { LogPanel } from "@/components/LogPanel";
import { DebugPanel } from "@/components/DebugPanel";
import { Button } from "@/components/ui/Button";

export default function PlayPage() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const router = useRouter();
  const mounted = useHydrated();

  // — State UI lokal, tidak pernah masuk engine —
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [escortIds, setEscortIds] = useState<string[]>([]);
  const [handRevealed, setHandRevealed] = useState(false);
  const [handPlayerId, setHandPlayerId] = useState<string | null>(null);
  const [barterCard, setBarterCard] = useState<EvidenceCard | null>(null);
  const [abilityOpen, setAbilityOpen] = useState(false);

  useEffect(() => {
    if (mounted && !state) router.replace("/");
  }, [mounted, state, router]);

  // Reset state transien saat fase/ronde berganti — pola "adjust state during
  // render", tanpa effect.
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const phaseKey = state ? `${state.phase}-${state.round}-${state.currentPlayerIndex}` : null;
  if (phaseKey !== prevKey) {
    setPrevKey(phaseKey);
    setSelectedTile(null);
    setEscortIds([]);
    setHandRevealed(false);
    setBarterCard(null);
    setAbilityOpen(false);
  }

  const scenario = state ? scenarios.find((s) => s.id === state.scenarioId) ?? null : null;
  const current = state ? (state.players[state.currentPlayerIndex] ?? null) : null;

  const isTurnPhase = state?.phase === "p3_turns";

  const moves = useMemo<MoveOption[]>(() => {
    if (!state || !current || !isTurnPhase) return [];
    return legalMoves(state, current);
  }, [state, current, isTurnPhase]);

  if (!mounted || !state || !scenario || !current) return null;

  const role = roleById[current.roleId];
  const cCost = calmCost(state);
  // Biaya kawal termurah dari ubin ini — label indikatif; reducer tetap yang
  // menghitung biaya sebenarnya untuk ubin tujuan yang dipilih.
  const eCost = moves.length
    ? Math.min(...moves.map((m) => m.escortCost))
    : gameConfig.escortCost;
  const escortLimit = escortGroupLimit(current, false);

  const handPlayer =
    state.players.find((p) => p.id === handPlayerId) ?? current;

  const newsSectorName = state.activeNews
    ? scenario.sectors.find((s) => s.id === state.activeNews?.targetSectorId)?.name
    : undefined;

  const allEnded =
    state.playersEndedTurn.length >= state.players.length && state.players.length > 0;

  // ——— Interaksi papan ———————————————————————————————————————————

  const moveFor = (index: number): MoveOption | null =>
    moves.find((m) => m.index === index) ?? null;

  const onSelectTile = (index: number) => {
    const move = moveFor(index);

    // Mode kawal: ketukan berikutnya adalah ubin tujuan.
    if (escortIds.length > 0 && move) {
      dispatch({
        type: "ESCORT_VILLAGER",
        playerId: current.id,
        villagerIds: escortIds,
        targetTileIndex: index,
        viaSeaLane: move.viaSeaLane,
      });
      setEscortIds([]);
      setSelectedTile(null);
      return;
    }

    setSelectedTile((prev) => (prev === index ? null : index));
  };

  const onMove = (m: MoveOption) => {
    dispatch({
      type: "MOVE_PLAYER",
      playerId: current.id,
      targetTileIndex: m.index,
      viaSeaLane: m.viaSeaLane,
    });
    setSelectedTile(null);
  };

  const onCalm = (villager: VillagerToken) =>
    dispatch({ type: "CALM_VILLAGER", playerId: current.id, villagerId: villager.id });

  const onToggleEscort = (villager: VillagerToken) =>
    setEscortIds((prev) =>
      prev.includes(villager.id)
        ? prev.filter((v) => v !== villager.id)
        : [...prev, villager.id].slice(-escortLimit)
    );

  const onPlayLock = (playerId: string) => (card: EvidenceCard, lock: EvidenceCategory) =>
    dispatch({ type: "PLAY_EVIDENCE_LOCK", playerId, evidenceId: card.id, lock });

  const onDiscard = (card: EvidenceCard) =>
    dispatch({ type: "DISCARD_FOR_RESOURCE", playerId: current.id, evidenceId: card.id });

  const selected = selectedTile !== null ? state.tiles[selectedTile] : null;

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-2.5 p-3 pb-10 lg:max-w-6xl">
      <GameHud state={state} scenario={scenario} />
      <PhaseIndicator phase={state.phase} />

      {isRoundPhase(state.phase) && (
        <p className="px-1 text-center text-[11px] font-bold leading-snug text-zinc-500">
          {id.phases[state.phase].hint}
        </p>
      )}

      {/* Dampak Kejadian bencana aktif */}
      {state.activeDisaster && state.phase !== "p1_disaster" && (
        <p className="flex items-start gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-[11px] font-bold leading-snug text-amber-900">
          <Wind className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <b>{state.activeDisaster.title}</b> — {state.activeDisaster.roundEffect}
          </span>
        </p>
      )}

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
        {/* ——— Papan cincin ——— */}
        <section className="lg:flex-1">
          <RingBoard
            state={state}
            scenario={scenario}
            selectedTile={selectedTile}
            moveOptions={moves}
            onSelectTile={onSelectTile}
            centre={
              <CrisisZoneCentre
                disaster={state.activeDisaster}
                news={state.activeNews}
                panic={state.panicMeter}
                panicMax={state.panicMeterMax}
              />
            }
          />

          {escortIds.length > 0 && (
            <p className="mt-2 rounded-xl bg-violet-100 p-2 text-center text-xs font-bold text-violet-900">
              <HandHelping className="mr-1 inline h-4 w-4" />
              {escortIds.length} {id.actions.escortSelected} — {id.actions.escortHint}{" "}
              <button type="button" className="underline" onClick={() => setEscortIds([])}>
                {id.common.cancel}
              </button>
            </p>
          )}

          {/* Chaos menumpuk sepanjang permainan, jadi selalu terlihat —
              bukan cuma di Fase 5 saat kartunya ditarik. */}
          {state.activeChaos.length > 0 && (
            <div className="mt-2">
              <ChaosCardDisplay activeChaos={state.activeChaos} />
            </div>
          )}

          {selected && (
            <div className="mt-2">
              <TileInspector
                state={state}
                scenario={scenario}
                tile={selected}
                current={current}
                move={moveFor(selected.index)}
                calmCost={cCost}
                escortCost={eCost}
                canAct={isTurnPhase}
                escortSelection={escortIds}
                onMove={onMove}
                onCalm={onCalm}
                onToggleEscort={onToggleEscort}
              />
            </div>
          )}
        </section>

        {/* ——— Panel fase ——— */}
        <section className="lg:w-[26rem] lg:shrink-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5"
            >
              {/* ——— FASE 1 — Murka Cincin Api ——— */}
              {state.phase === "p1_disaster" &&
                (state.activeDisaster ? (
                  <>
                    <DisasterCardReveal card={state.activeDisaster} />
                    <Button className="w-full" onClick={() => dispatch({ type: "ADVANCE_PHASE" })}>
                      {id.common.continue} <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="panic-pulse w-full text-lg"
                    onClick={() => dispatch({ type: "DRAW_DISASTER" })}
                  >
                    <Flame className="mr-2 inline h-5 w-5" />
                    {id.actions.drawDisaster}
                  </Button>
                ))}

              {/* ——— FASE 2 — Kabar Mengudara ——— */}
              {state.phase === "p2_news" &&
                (state.activeNews ? (
                  <>
                    <NewsCardDisplay
                      card={state.activeNews}
                      locksOpened={state.locksOpened}
                      revealed={false}
                      sectorName={newsSectorName}
                    />
                    <Button className="w-full" onClick={() => dispatch({ type: "ADVANCE_PHASE" })}>
                      {id.common.continue} <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button className="w-full text-lg" onClick={() => dispatch({ type: "DRAW_NEWS" })}>
                    <Newspaper className="mr-2 inline h-5 w-5" />
                    {id.actions.drawNews}
                  </Button>
                ))}

              {/* ——— FASE 3 — Giliran Pemain ——— */}
              {state.phase === "p3_turns" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <TurnOrder
                      names={state.players.map((p) => ({
                        id: p.id,
                        name: p.name,
                        roleId: p.roleId,
                        done: state.playersEndedTurn.includes(p.id),
                        active: p.id === current.id,
                      }))}
                    />
                    <DiscussionTimer resetKey={`${state.round}-${state.currentPlayerIndex}`} />
                  </div>

                  <TableTalkNote />

                  <RolePanel
                    player={current}
                    role={role}
                    isCurrent
                    onUseActive={() => setAbilityOpen(true)}
                  />

                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant="secondary"
                      className="flex-1 text-xs"
                      disabled={current.ap < gameConfig.investigateCost}
                      onClick={() => dispatch({ type: "INVESTIGATE", playerId: current.id })}
                    >
                      <Search className="mr-1 inline h-3.5 w-3.5" />
                      {id.actions.investigate} ({gameConfig.investigateCost} {id.common.ap})
                    </Button>
                    <Button
                      className="flex-1 text-xs"
                      onClick={() => dispatch({ type: "END_PLAYER_TURN" })}
                    >
                      {id.actions.endTurn}
                    </Button>
                  </div>

                  {state.tiles[current.position]?.isReadyPost && (
                    <p className="rounded-xl bg-emerald-50 p-2 text-[11px] font-bold leading-snug text-emerald-800">
                      {id.actions.posSiagaBonus}
                    </p>
                  )}

                  <HandSection
                    revealed={handRevealed}
                    onToggle={() => setHandRevealed(!handRevealed)}
                    limit={handLimit(state, current)}
                    count={current.hand.length}
                  >
                    <EvidenceCardHand
                      state={state}
                      player={current}
                      canAct
                      onPlayLock={onPlayLock(current.id)}
                      onDiscard={onDiscard}
                      onBarter={setBarterCard}
                    />
                  </HandSection>

                  {allEnded && (
                    <Button
                      variant="safe"
                      className="w-full"
                      onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
                    >
                      {id.actions.toVerdict} <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* ——— FASE 4 — Sidang Fakta (Commit & Flip) ——— */}
              {state.phase === "p4_verdict" && state.activeNews && (
                <div className="space-y-2.5">
                  <TableTalkNote />

                  <VerdictPanel
                    state={state}
                    card={state.activeNews}
                    sectorName={newsSectorName}
                    dispatch={dispatch}
                  />

                  {!state.verdict && (
                    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-2.5">
                      <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-zinc-500">
                        {id.evidence.whoseHand}
                      </p>
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {state.players.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setHandPlayerId(p.id);
                              setHandRevealed(false);
                            }}
                            aria-pressed={handPlayer.id === p.id}
                            className={cn(
                              "min-h-11 rounded-xl border-2 px-2.5 text-sm font-bold",
                              handPlayer.id === p.id
                                ? "border-violet-600 bg-violet-100"
                                : "border-zinc-200 bg-white"
                            )}
                          >
                            {emojiForRole(p.roleId)} {p.name}
                          </button>
                        ))}
                      </div>

                      <HandSection
                        revealed={handRevealed}
                        onToggle={() => setHandRevealed(!handRevealed)}
                        limit={handLimit(state, handPlayer)}
                        count={handPlayer.hand.length}
                      >
                        <EvidenceCardHand
                          state={state}
                          player={handPlayer}
                          canAct
                          onPlayLock={onPlayLock(handPlayer.id)}
                        />
                      </HandSection>
                    </div>
                  )}

                  {state.newsRevealed && (
                    <Button
                      variant="safe"
                      className="w-full"
                      onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
                    >
                      {id.actions.toImpact} <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* ——— FASE 5 — Dampak & Eskalasi ——— */}
              {state.phase === "p5_impact" && (
                <div className="space-y-2.5">
                  {state.activeDisaster && (
                    <p className="rounded-xl border-2 border-red-300 bg-red-50 p-2.5 text-[11px] font-bold leading-snug text-red-900">
                      <Flame className="mr-1 inline h-4 w-4" />
                      {id.disaster.endEffect}: {state.activeDisaster.endEffect}
                    </p>
                  )}

                  {state.activeChaos.length === 0 && (
                    <ChaosCardDisplay activeChaos={state.activeChaos} />
                  )}
                  <RewardShop state={state} dispatch={dispatch} />

                  <div className="space-y-2">
                    {state.players.map((p) => (
                      <RolePanel
                        key={p.id}
                        player={p}
                        role={roleById[p.roleId]}
                        isCurrent={false}
                      />
                    ))}
                  </div>

                  <Button
                    className="w-full text-base"
                    onClick={() => dispatch({ type: "ADVANCE_PHASE" })}
                  >
                    {id.actions.nextRound} <ArrowRight className="ml-1 inline h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <LogPanel log={state.log} />
      <DebugPanel dispatch={dispatch} />

      {/* Modal */}
      <PeekModal
        state={state}
        scenario={scenario}
        onClose={() => dispatch({ type: "CLEAR_PEEK" })}
      />
      {abilityOpen && role && (
        <ActiveAbilityModal
          state={state}
          player={current}
          role={role}
          dispatch={dispatch}
          onClose={() => setAbilityOpen(false)}
        />
      )}
      {barterCard && (
        <BarterModal
          state={state}
          player={current}
          giveCard={barterCard}
          onConfirm={(withPlayerId, takeCardId) => {
            dispatch({
              type: "BARTER",
              playerId: current.id,
              withPlayerId,
              giveCardId: barterCard.id,
              takeCardId,
            });
            setBarterCard(null);
          }}
          onCancel={() => setBarterCard(null)}
        />
      )}
      <GameOverModal state={state} dispatch={dispatch} />
    </main>
  );
}

/** Urutan giliran searah jarum jam, dengan penanda siapa yang sudah selesai. */
function TurnOrder({
  names,
}: {
  names: { id: string; name: string; roleId: string; done: boolean; active: boolean }[];
}) {
  return (
    <ul className="flex min-w-0 flex-wrap gap-1">
      {names.map((p) => (
        <li
          key={p.id}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[11px] font-bold",
            p.active
              ? "border-safe bg-emerald-50 text-emerald-900"
              : p.done
                ? "border-zinc-200 bg-zinc-100 text-zinc-400 line-through"
                : "border-zinc-200 bg-white text-zinc-600"
          )}
        >
          <span aria-hidden>{emojiForRole(p.roleId)}</span>
          <span className="max-w-20 truncate">{p.name}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Pola privasi "tap to reveal your hand" — kartu tetap rahasia sampai
 * pemiliknya sendiri yang membukanya (Table Talk Protocol).
 */
function HandSection({
  revealed,
  onToggle,
  count,
  limit,
  children,
}: {
  revealed: boolean;
  onToggle: () => void;
  count: number;
  limit: number;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={revealed}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-xl border-2 px-3 text-sm font-bold",
          revealed
            ? "border-zinc-200 bg-white text-zinc-500"
            : "border-dashed border-violet-300 bg-violet-50 text-violet-800"
        )}
      >
        {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="min-w-0 flex-1 text-left">
          {revealed ? id.evidence.hide : id.evidence.reveal}
        </span>
        <span className="shrink-0 text-xs tabular-nums text-zinc-400">
          {count}/{limit}
        </span>
      </button>
      {revealed && children}
    </div>
  );
}
