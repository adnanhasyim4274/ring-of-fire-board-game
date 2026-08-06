"use client";
import Link from "next/link";
import { Flag, Flame, Home, Ship, Skull, Waves } from "lucide-react";
import type { GameState, Scenario } from "@/engine/types";
import { gameConfig } from "@/data/gameConfig";
import { rewardCards } from "@/data/rewardCards";
import { PanicMeter } from "@/components/hud/PanicMeter";
import { ReputationTrack } from "@/components/hud/ReputationTrack";
import { DisasterDeckCounter } from "@/components/hud/DisasterDeckCounter";
import { APCounter } from "@/components/hud/APCounter";
import { isSeaLaneOpen } from "@/lib/engineBridge";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/** Papan status tim: satu blok, terbaca sekali lihat di lebar 375px. */
export function GameHud({ state, scenario }: { state: GameState; scenario: Scenario }) {
  const current = state.players[state.currentPlayerIndex];
  const target = scenario.targetEvacuation ?? gameConfig.targetEvacuation;
  const deckTotal = scenario.disasterDeckSize ?? gameConfig.disasterDeckSize;
  const canAfford = rewardCards.some(
    (r) => !state.ownedRewards.includes(r.id) && state.reputation >= r.cost
  );
  const seaOpen = isSeaLaneOpen(state);

  return (
    <header className="space-y-2 rounded-2xl border border-black/10 bg-white/85 p-2.5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-black">
        <Link
          href="/"
          aria-label={id.common.home}
          className="rounded-lg p-1 hover:bg-black/5"
        >
          <Home className="h-4 w-4 text-zinc-400" />
        </Link>
        <Flame className="h-4 w-4 text-lava" />
        <span className="tabular-nums">
          {id.common.round} {state.round}
        </span>

        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900">
          <Flag className="h-3.5 w-3.5" />
          <span className="tabular-nums">
            {state.evacuees.length}/{target}
          </span>
          <span className="text-[10px] font-bold uppercase opacity-70">
            {id.hud.evacuated}
          </span>
        </span>

        {state.casualties.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-zinc-700">
            <Skull className="h-3.5 w-3.5" />
            <span className="tabular-nums">{state.casualties.length}</span>
          </span>
        )}
      </div>

      <div className="grid gap-x-3 gap-y-2 sm:grid-cols-3">
        <PanicMeter value={state.panicMeter} max={state.panicMeterMax} />
        <ReputationTrack
          value={state.reputation}
          max={gameConfig.reputationTrackMax}
          affordable={canAfford}
        />
        <DisasterDeckCounter remaining={state.decks.disaster.length} total={deckTotal} />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black",
            seaOpen
              ? "bg-purple-100 text-purple-800"
              : "bg-zinc-200 text-zinc-500 line-through"
          )}
        >
          {seaOpen ? <Ship className="h-3.5 w-3.5" /> : <Waves className="h-3.5 w-3.5" />}
          {seaOpen ? id.hud.seaLaneOpen : id.hud.seaRouteClosed}
        </span>

        <span className="text-[11px] font-bold text-zinc-500">
          {scenario.name}
        </span>

        {current && (
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="max-w-24 truncate text-[11px] font-black text-zinc-700">
              {current.name}
            </span>
            <APCounter ap={current.ap} max={gameConfig.baseAP} />
          </span>
        )}
      </div>
    </header>
  );
}
