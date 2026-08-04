"use client";
import { Flame, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { id } from "@/lib/i18n/id";

/** Dek Bencana adalah jam permainan: habis = kalah karena Kehabisan Waktu. */
export function DisasterDeckCounter({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const low = remaining <= 4;
  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
  return (
    <div
      className="flex flex-col gap-1"
      aria-label={`${id.hud.disasterDeck}: ${remaining} ${id.hud.cardsLeft}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide">
        {low ? (
          <Flame className="panic-pulse h-4 w-4 text-red-600" />
        ) : (
          <Hourglass className="h-4 w-4 text-zinc-500" />
        )}
        <span className="text-zinc-600">{id.hud.disasterDeck}</span>
        <span className={cn("ml-auto text-sm tabular-nums", low ? "text-red-600" : "text-zinc-800")}>
          {remaining}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-[3px] border border-black/10 bg-[#efece7]" aria-hidden>
        <div
          className={cn("h-full transition-all duration-500", low ? "bg-red-500" : "bg-ember")}
          style={{ width: `${pct}%` }}
        />
      </div>
      {low && (
        <p className="text-[10px] font-bold leading-tight text-red-600">
          {id.hud.disasterDeckHint}
        </p>
      )}
    </div>
  );
}
