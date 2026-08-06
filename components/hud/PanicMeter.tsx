"use client";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/** Jalur 0..max. Penuh = kalah karena Gagal Literasi. */
export function PanicMeter({ value, max }: { value: number; max: number }) {
  const ratio = max > 0 ? value / max : 0;
  const danger = max - value <= 2;

  return (
    <div
      className="flex flex-col gap-1"
      aria-label={`${id.hud.panicMeter}: ${value} ${id.common.of} ${max}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide">
        <AlertTriangle
          className={cn("h-4 w-4", danger ? "panic-pulse text-red-600" : "text-orange-500")}
        />
        <span className="text-zinc-600">{id.hud.panicMeter}</span>
        <span className={cn("ml-auto text-sm tabular-nums", danger ? "text-red-600" : "text-zinc-800")}>
          {value}/{max}
        </span>
      </div>
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < value;
          const t = max > 1 ? i / (max - 1) : 0;
          return (
            <motion.div
              key={i}
              layout
              className="h-3 flex-1 rounded-[3px] border border-black/10"
              animate={{
                backgroundColor: filled ? heat(t) : "#efece7",
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
      {danger && (
        <p className="text-[10px] font-bold leading-tight text-red-600">{id.hud.panicHint}</p>
      )}
      <span className="sr-only">{Math.round(ratio * 100)}%</span>
    </div>
  );
}

/** Hijau -> kuning -> merah, dihitung supaya jumlah segmen bebas. */
function heat(t: number): string {
  const stops: [number, string][] = [
    [0, "#34d399"],
    [0.35, "#a3e635"],
    [0.6, "#facc15"],
    [0.8, "#fb923c"],
    [1, "#dc2626"],
  ];
  for (let i = stops.length - 1; i >= 0; i--) {
    if (t >= stops[i][0]) return stops[i][1];
  }
  return stops[0][1];
}
