"use client";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

const segmentColors = ["bg-emerald-400", "bg-lime-400", "bg-yellow-400", "bg-orange-400", "bg-red-500"];

export function PanicMeter({ value, max }: { value: number; max: number }) {
  const danger = value >= max - 1;
  return (
    <div className="flex flex-col gap-1" aria-label={`${en.hud.panicMeter}: ${value}/${max}`}>
      <div className="flex items-center gap-1 text-xs font-bold">
        <AlertTriangle className={cn("h-4 w-4", danger ? "text-red-600 panic-pulse" : "text-orange-500")} />
        <span>{en.hud.panicMeter}</span>
        <span className={cn("ml-auto tabular-nums", danger && "text-red-600")}>
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 flex-1 rounded-sm border border-zinc-300",
              i < value ? segmentColors[Math.min(i, segmentColors.length - 1)] : "bg-zinc-100"
            )}
          />
        ))}
      </div>
    </div>
  );
}
