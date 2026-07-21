"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Flag, Flame, HandHelping, Home as HomeIcon, Sparkles, Wind } from "lucide-react";
import type { EvidenceCard } from "@/engine/types";
import { useGameStore } from "@/store/gameStore";
import { scenarioById } from "@/data/scenarios";
import { roleById } from "@/data/roles";
import { adjacentIndices, calmCost, escortBlocked, escortCost, isPassable, moveCost } from "@/engine/rules";
import { useHydrated } from "@/lib/useHydrated";
import { MapGrid } from "@/components/board/MapGrid";
import { PanicMeter } from "@/components/hud/PanicMeter";
import { DisasterDeckCounter } from "@/components/hud/DisasterDeckCounter";
import { APCounter } from "@/components/hud/APCounter";
import { PhaseIndicator } from "@/components/hud/PhaseIndicator";
import { EventCardDisplay } from "@/components/cards/EventCardDisplay";
import { EvidenceCardHand } from "@/components/cards/EvidenceCardHand";
import { DisasterCardReveal } from "@/components/cards/DisasterCardReveal";
import { Phase2Timer } from "@/components/Phase2Timer";
import { TradeModal } from "@/components/TradeModal";
import { PeekModal } from "@/components/PeekModal";
import { GameOverModal } from "@/components/GameOverModal";
import { LogPanel } from "@/components/LogPanel";
import { DebugPanel } from "@/components/DebugPanel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import { roleEmoji } from "@/lib/roleEmoji";

export default function PlayPage() {
  const state = useGameStore((s) => s.state);
  const dispatch = useGameStore((s) => s.dispatch);
  const router = useRouter();
  const mounted = useHydrated();

  // Local UI state (never part of the game engine)
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [escortVillagerId, setEscortVillagerId] = useState<string | null>(null);
  const [handPlayerId, setHandPlayerId] = useState<string | null>(null);
  const [handRevealed, setHandRevealed] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [trade, setTrade] = useState<{ playerId: string; card: EvidenceCard } | null>(null);

  useEffect(() => {
    if (mounted && !state) router.replace("/");
  }, [mounted, state, router]);

  const phase = state?.phase;
  const hasEvent = !!state?.activeEventCard;
  useEffect(() => {
    if (phase === "phase1_influx" && !hasEvent) dispatch({ type: "DRAW_EVENT_CARD" });
  }, [phase, hasEvent, dispatch]);

  // Reset transient UI state whenever the phase/round changes (during render,
  // per the React "adjusting state when props change" pattern — no effect needed)
  const [prevPhaseKey, setPrevPhaseKey] = useState<string | null>(null);
  const phaseKey = state ? `${state.phase}-${state.round}` : null;
  if (phaseKey !== prevPhaseKey) {
    setPrevPhaseKey(phaseKey);
    setSelectedTile(null);
    setEscortVillagerId(null);
    setHandRevealed(false);
    setCardsOpen(false);
  }

  const scenario = state ? scenarioById[state.scenarioId] : null;
  const current = state ? state.players[state.currentPlayerIndex] : null;

  const moveTargets = useMemo(() => {
    if (!state || !current || state.phase !== "phase3_evacuation") return [];
    return adjacentIndices(current.position, scenario!.cols, scenario!.rows).filter((i) =>
      isPassable(state.tiles[i])
    );
  }, [state, current, scenario]);

  if (!mounted || !state || !scenario || !current) return null;

  const handPlayer = state.players.find((p) => p.id === handPlayerId) ?? state.players[0];

  const onTileClick = (index: number) => {
    if (state.phase === "phase3_evacuation" && escortVillagerId && moveTargets.includes(index)) {
      const from = state.tiles[current.position];
      if (!escortBlocked(state, from, state.tiles[index])) {
        dispatch({
          type: "ESCORT_VILLAGER",
          playerId: current.id,
          villagerId: escortVillagerId,
          targetTileIndex: index,
        });
      }
      setEscortVillagerId(null);
      setSelectedTile(null);
      return;
    }
    setSelectedTile(selectedTile === index ? null : index);
    setEscortVillagerId(null);
  };

  const verifyWith = (card: EvidenceCard) => {
    dispatch({ type: "USE_EVIDENCE_FOR_VERIFICATION", playerId: handPlayer.id, evidenceId: card.id });
  };

  const discardFor = (playerId: string) => (card: EvidenceCard) => {
    if (card.resourceKind === "trade") {
      setTrade({ playerId, card });
      return;
    }
    dispatch({ type: "DISCARD_EVIDENCE_FOR_RESOURCE", playerId, evidenceId: card.id });
  };

  const selected = selectedTile !== null ? state.tiles[selectedTile] : null;
  const selectedIsAdjacent = selectedTile !== null && moveTargets.includes(selectedTile);
  const fromTile = state.tiles[current.position];
  const mCost = moveCost(state, fromTile, current);
  const cCost = calmCost(state);
  const eCost = state.tigerEscortBonus[current.id]
    ? Math.max(0, escortCost(state, fromTile, current) - 1)
    : escortCost(state, fromTile, current);
  const role = roleById[current.roleId];
  const abilityActive = ["peek_disaster", "peek_event", "cancel_panic"].includes(role.abilityType);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-2.5 p-3 pb-10 lg:max-w-5xl">
      {/* HUD */}
      <header className="space-y-2 rounded-2xl border border-zinc-200 bg-white/80 p-2.5">
        <div className="flex items-center gap-2 text-sm font-black">
          <Link href="/" aria-label={en.gameOver.backHome} className="rounded-lg p-1 hover:bg-zinc-900/5">
            <HomeIcon className="h-4 w-4 text-zinc-400" />
          </Link>
          <Flame className="h-4 w-4 text-lava" />
          <span>
            {en.hud.round} {state.round}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">
            <Flag className="h-3.5 w-3.5" />
            {en.hud.evacuated}: {state.evacuees.length}/{scenario.targetEvacuation}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PanicMeter value={state.panicMeter} max={state.panicMeterMax} />
          <DisasterDeckCounter
            remaining={state.disasterDeck.length}
            total={scenario.disasterDeckSize}
            bigThreat={state.activeDisasterEffect?.roundEffectKey === "peek_disaster"}
          />
        </div>
      </header>

      <PhaseIndicator phase={state.phase} />

      {/* Active disaster round effect */}
      {state.activeDisasterEffect && state.phase !== "phase4_escalation" && (
        <p className="flex items-start gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-xs font-bold text-amber-900">
          <Wind className="mt-0.5 h-4 w-4 shrink-0" />
          {state.activeDisasterEffect.title} — {state.activeDisasterEffect.roundEffect}
        </p>
      )}

      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
        {/* Map */}
        <section className="lg:flex-1">
          <MapGrid
            state={state}
            selectedTile={selectedTile}
            moveTargets={state.phase === "phase3_evacuation" ? moveTargets : []}
            onTileClick={onTileClick}
          />
        </section>

        {/* Phase panel */}
        <section className="lg:w-96 lg:shrink-0">
          {/* No mode="wait": the new phase panel must mount immediately even if
              the exit animation can't run (e.g. backgrounded tab pauses rAF). */}
          <AnimatePresence initial={false}>
            <motion.div
              key={state.phase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5"
            >
              <p className="text-center text-xs font-bold text-zinc-500">
                {state.phase !== "game_over" &&
                  state.phase !== "setup" &&
                  en.phases[state.phase as keyof typeof en.phases]?.hint}
              </p>

              {/* ——— Phase 1: Incoming Crisis ——— */}
              {state.phase === "phase1_influx" && state.activeEventCard && (
                <>
                  <EventCardDisplay
                    card={state.activeEventCard}
                    locksOpened={state.activeEventLocksOpened}
                    outcome={state.activeEventOutcome}
                  />
                  <Button className="w-full" onClick={() => dispatch({ type: "ADVANCE_PHASE" })}>
                    {en.actions.continueBtn} <ArrowRight className="ml-1 inline h-4 w-4" />
                  </Button>
                </>
              )}

              {/* ——— Phase 2: Verification ——— */}
              {state.phase === "phase2_verification" && state.activeEventCard && (
                <>
                  <div className="flex items-center justify-between">
                    <Phase2Timer resetKey={state.round} />
                    {state.activeEventOutcome === "pending" && (
                      <Button
                        variant="secondary"
                        className="text-sm"
                        onClick={() => dispatch({ type: "RESOLVE_VERIFICATION" })}
                      >
                        {en.verification.skip}
                      </Button>
                    )}
                  </div>
                  <EventCardDisplay
                    card={state.activeEventCard}
                    locksOpened={state.activeEventLocksOpened}
                    outcome={state.activeEventOutcome}
                  />
                  {state.activeEventOutcome === "pending" ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-2.5">
                      <p className="mb-1.5 text-xs font-black uppercase text-zinc-500">
                        {en.verification.whoseCards}
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
                            className={cn(
                              "min-h-11 rounded-xl border-2 px-2.5 text-sm font-bold",
                              handPlayer.id === p.id
                                ? "border-violet-600 bg-violet-100"
                                : "border-zinc-200 bg-white"
                            )}
                          >
                            {roleEmoji[p.roleId]} {p.name}
                          </button>
                        ))}
                      </div>
                      {handRevealed ? (
                        <>
                          <button
                            type="button"
                            className="mb-2 w-full text-right text-xs font-bold text-zinc-400"
                            onClick={() => setHandRevealed(false)}
                          >
                            {en.verification.hide}
                          </button>
                          <EvidenceCardHand
                            state={state}
                            player={handPlayer}
                            onVerify={verifyWith}
                            onDiscard={discardFor(handPlayer.id)}
                          />
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setHandRevealed(true)}
                          className="min-h-11 w-full rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 p-3 text-sm font-bold text-violet-700"
                        >
                          {en.verification.reveal}
                        </button>
                      )}
                    </div>
                  ) : (
                    <Button variant="safe" className="w-full" onClick={() => dispatch({ type: "ADVANCE_PHASE" })}>
                      {en.verification.continueToRescue} <ArrowRight className="ml-1 inline h-4 w-4" />
                    </Button>
                  )}
                </>
              )}

              {/* ——— Phase 3: Rescue Action ——— */}
              {state.phase === "phase3_evacuation" && (
                <div className="space-y-2.5">
                  <div className="rounded-2xl border-2 border-safe bg-emerald-50 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{roleEmoji[current.roleId]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black">
                          {current.name}
                          <span className="ml-1 text-xs font-bold text-zinc-500">
                            ({en.actions.currentTurn})
                          </span>
                        </p>
                        <p className="text-[11px] leading-tight text-zinc-500">{role.nickname}</p>
                      </div>
                      <APCounter ap={current.ap} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {abilityActive && (
                        <Button
                          variant="secondary"
                          className="flex-1 text-xs"
                          disabled={!!state.abilityUsed[current.id]}
                          onClick={() => dispatch({ type: "USE_ROLE_ABILITY", playerId: current.id })}
                        >
                          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                          {state.abilityUsed[current.id] ? en.actions.abilityUsed : en.actions.useAbility}
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() => setCardsOpen(!cardsOpen)}
                      >
                        {en.actions.cards} ({current.hand.length})
                      </Button>
                      <Button className="flex-1 text-xs" onClick={() => dispatch({ type: "END_PLAYER_TURN" })}>
                        {en.actions.endTurn}
                      </Button>
                    </div>
                  </div>

                  {cardsOpen && (
                    <EvidenceCardHand
                      state={state}
                      player={current}
                      onVerify={verifyWith}
                      onDiscard={discardFor(current.id)}
                    />
                  )}

                  {escortVillagerId && (
                    <p className="rounded-xl bg-violet-100 p-2 text-center text-sm font-bold text-violet-800">
                      <HandHelping className="mr-1 inline h-4 w-4" />
                      {en.actions.escortHint}{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => setEscortVillagerId(null)}
                      >
                        {en.verification.cancel}
                      </button>
                    </p>
                  )}

                  {/* Contextual actions for the selected tile */}
                  {selected && !escortVillagerId && (
                    <div className="space-y-1.5 rounded-2xl border border-zinc-200 bg-white/80 p-2.5">
                      {selectedIsAdjacent && (
                        <Button
                          variant="safe"
                          className="w-full text-sm"
                          disabled={current.ap < mCost}
                          onClick={() => {
                            dispatch({
                              type: "MOVE_PLAYER",
                              playerId: current.id,
                              targetTileIndex: selectedTile!,
                            });
                            setSelectedTile(null);
                          }}
                        >
                          {en.actions.move} ({mCost} {en.hud.ap})
                        </Button>
                      )}
                      {selected.index === current.position &&
                        selected.occupants.map((v) => (
                          <div key={v.id} className="flex items-center gap-2 rounded-xl bg-zinc-50 p-1.5">
                            <span
                              className={cn(
                                "text-xs font-black",
                                v.status === "panic" ? "text-red-600" : "text-emerald-700"
                              )}
                            >
                              {v.status === "panic" ? `😨 ${en.board.panicked}` : `🙂 ${en.board.calm}`}
                            </span>
                            <span className="ml-auto flex gap-1.5">
                              {v.status === "panic" ? (
                                <Button
                                  className="text-xs"
                                  disabled={current.ap < cCost || selected.permanentPanic}
                                  onClick={() =>
                                    dispatch({ type: "CALM_VILLAGER", playerId: current.id, villagerId: v.id })
                                  }
                                >
                                  {en.actions.calm} ({cCost} {en.hud.ap})
                                </Button>
                              ) : (
                                <Button
                                  variant="safe"
                                  className="text-xs"
                                  disabled={current.ap < eCost}
                                  onClick={() => setEscortVillagerId(v.id)}
                                >
                                  {en.actions.escort} ({eCost} {en.hud.ap})
                                </Button>
                              )}
                            </span>
                          </div>
                        ))}
                      {selected.permanentPanic && (
                        <p className="text-[11px] font-bold text-red-600">
                          {en.event.revealed.superstition} — {en.actions.tryAgain}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ——— Phase 4: Escalation ——— */}
              {state.phase === "phase4_escalation" && (
                <div className="space-y-2.5">
                  {state.incomingDisaster ? (
                    <>
                      <DisasterCardReveal card={state.incomingDisaster} />
                      <Button className="w-full" onClick={() => dispatch({ type: "ADVANCE_PHASE" })}>
                        {en.actions.nextRound} <ArrowRight className="ml-1 inline h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="panic-pulse w-full text-lg"
                      onClick={() => dispatch({ type: "DRAW_DISASTER_CARD" })}
                    >
                      <Flame className="mr-1 inline h-5 w-5" />
                      {en.actions.drawDisaster}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      <LogPanel log={state.log} />
      <DebugPanel dispatch={dispatch} />

      {/* Modals */}
      <PeekModal state={state} onClose={() => dispatch({ type: "CLEAR_PEEK" })} />
      {trade && (
        <TradeModal
          state={state}
          player={state.players.find((p) => p.id === trade.playerId)!}
          tradeCard={trade.card}
          onConfirm={(withId, giveId) => {
            dispatch({
              type: "DISCARD_EVIDENCE_FOR_RESOURCE",
              playerId: trade.playerId,
              evidenceId: trade.card.id,
              tradeWithPlayerId: withId,
              tradeGiveCardId: giveId,
            });
            setTrade(null);
          }}
          onCancel={() => setTrade(null)}
        />
      )}
      <GameOverModal state={state} dispatch={dispatch} />
    </main>
  );
}
