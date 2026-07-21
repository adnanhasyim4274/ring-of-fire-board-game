"use client";
import { Flame, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

export function DisasterDeckCounter({
  remaining,
  total,
  bigThreat,
}: {
  remaining: number;
  total: number;
  bigThreat?: boolean; // e.g. "Wildlife Fleeing" confirmed the eruption is close
}) {
  const low = remaining <= 5 || bigThreat;
  return (
    <div className="flex flex-col gap-1" aria-label={`${en.hud.disasterDeck}: ${remaining} ${en.hud.cardsLeft}`}>
      <div className="flex items-center gap-1 text-xs font-bold">
        {low ? <Flame className="h-4 w-4 text-red-600 panic-pulse" /> : <Layers className="h-4 w-4 text-zinc-600" />}
        <span>{en.hud.disasterDeck}</span>
        <span className={cn("ml-auto tabular-nums", low && "text-red-600")}>{remaining}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-sm border border-zinc-300 bg-zinc-100">
        <div
          className={cn("h-full transition-all", low ? "bg-red-500" : "bg-orange-400")}
          style={{ width: `${(remaining / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
