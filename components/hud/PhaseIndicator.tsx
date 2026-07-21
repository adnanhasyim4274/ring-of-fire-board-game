"use client";
import { motion } from "framer-motion";
import type { GamePhase } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

const phaseOrder = ["phase1_influx", "phase2_verification", "phase3_evacuation", "phase4_escalation"] as const;

const phaseColors: Record<(typeof phaseOrder)[number], string> = {
  phase1_influx: "bg-sky-600",
  phase2_verification: "bg-violet-600",
  phase3_evacuation: "bg-safe",
  phase4_escalation: "bg-lava",
};

export function PhaseIndicator({ phase }: { phase: GamePhase }) {
  const active = phaseOrder.includes(phase as (typeof phaseOrder)[number])
    ? (phase as (typeof phaseOrder)[number])
    : null;
  return (
    <div className="flex items-stretch gap-1">
      {phaseOrder.map((p) => {
        const info = en.phases[p];
        const isActive = p === active;
        return (
          <div key={p} className="relative flex-1">
            <div
              className={cn(
                "flex h-full flex-col items-center rounded-lg px-1 py-1.5 text-center transition-colors",
                isActive ? `${phaseColors[p]} text-white shadow-md` : "bg-zinc-200/70 text-zinc-500"
              )}
            >
              <span className="text-[10px] font-black leading-none">{info.num}</span>
              <span className="text-[10px] font-bold leading-tight sm:text-xs">{info.name}</span>
            </div>
            {isActive && (
              <motion.div
                layoutId="phase-underline"
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 rounded-full bg-foreground/60"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
