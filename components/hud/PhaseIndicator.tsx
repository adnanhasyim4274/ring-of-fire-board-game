"use client";
import { motion } from "framer-motion";
import type { GamePhase } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/** Lima fase per ronde: Bencana -> Berita -> Giliran -> Sidang -> Dampak. */
export const PHASE_ORDER = [
  "p1_disaster",
  "p2_news",
  "p3_turns",
  "p4_verdict",
  "p5_impact",
] as const;

export type RoundPhase = (typeof PHASE_ORDER)[number];

const PHASE_TINT: Record<RoundPhase, string> = {
  p1_disaster: "bg-lava",
  p2_news: "bg-indigo-600",
  p3_turns: "bg-safe",
  p4_verdict: "bg-purple-700",
  p5_impact: "bg-ash",
};

export function isRoundPhase(phase: GamePhase): phase is RoundPhase {
  return (PHASE_ORDER as readonly string[]).includes(phase);
}

/**
 * Playtesters asked for a step-by-step gameflow with the current step
 * highlighted, on top of the description that already existed. The chips show
 * where the round is; the band underneath says what this phase does and, in
 * plain imperative English, what the table should do right now.
 */
export function PhaseIndicator({ phase }: { phase: GamePhase }) {
  const active = isRoundPhase(phase) ? phase : null;
  const activeIndex = active ? PHASE_ORDER.indexOf(active) : -1;
  const info = active ? id.phases[active] : null;

  return (
    <div className="space-y-1.5">
    <nav className="flex items-stretch gap-1" aria-label={id.phases[PHASE_ORDER[0]].name}>
      {PHASE_ORDER.map((p, i) => {
        const info = id.phases[p];
        const isActive = p === active;
        const isPast = activeIndex > i;
        return (
          <div key={p} className="relative min-w-0 flex-1">
            <div
              className={cn(
                "flex h-full flex-col items-center rounded-lg px-0.5 py-1.5 text-center transition-colors",
                isActive
                  ? `${PHASE_TINT[p]} text-white shadow`
                  : isPast
                    ? "bg-zinc-300/80 text-zinc-600"
                    : "bg-zinc-200/60 text-zinc-500"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="text-[9px] font-black leading-none opacity-70">{info.num}</span>
              <span className="truncate text-[10px] font-black leading-tight sm:text-[11px]">
                {info.short}
              </span>
            </div>
            {isActive && (
              <motion.div
                layoutId="phase-underline"
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 rounded-full bg-foreground/50"
              />
            )}
          </div>
        );
      })}
    </nav>

      {info && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 rounded-xl border-2 border-orange-200 bg-orange-50/70 px-2.5 py-2"
        >
          <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-orange-500 text-[10px] font-black text-white">
            {info.num}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase leading-tight tracking-wide text-orange-800">
              {info.name}
            </p>
            <p className="mt-0.5 text-[11px] font-bold leading-snug text-zinc-700">
              {info.doNow}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-zinc-500">{info.hint}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
