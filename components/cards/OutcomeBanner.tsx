"use client";
import { motion } from "framer-motion";
import { GraduationCap, PartyPopper, Siren, TrendingDown } from "lucide-react";
import type { VerdictOutcome } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { OUTCOME_CLASS } from "@/lib/theme";

/**
 * Tiga hasil Commit & Flip, tiga perlakuan visual yang sengaja berbeda.
 *
 * `lucky_guess` TIDAK boleh terasa seperti kemenangan — itu justru inti
 * pesan edukatifnya: benar karena menebak bukan literasi.
 */
export function OutcomeBanner({ outcome }: { outcome: VerdictOutcome }) {
  const style = OUTCOME_CLASS[outcome];
  const copy = id.outcome[outcome];
  const celebratory = outcome === "verified";

  const Icon =
    outcome === "verified"
      ? PartyPopper
      : outcome === "lucky_guess"
        ? TrendingDown
        : Siren;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, scale: celebratory ? 0.9 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        celebratory
          ? { type: "spring", stiffness: 320, damping: 16 }
          : { duration: 0.35, ease: "easeOut" }
      }
      className={cn("overflow-hidden rounded-2xl border-2 shadow-sm", style.panel)}
      aria-live="polite"
    >
      <header className={cn("flex items-center gap-2 px-3 py-2", style.badge)}>
        <motion.span
          animate={celebratory ? { rotate: [0, -12, 12, 0] } : undefined}
          transition={{ duration: 0.7, repeat: celebratory ? 1 : 0 }}
        >
          <Icon className="h-5 w-5" />
        </motion.span>
        <span className="text-sm font-black tracking-wide">{copy.label}</span>
      </header>

      <div className={cn("space-y-1.5 p-3", style.text)}>
        <p className="text-sm font-bold leading-snug">{copy.headline}</p>
        <p className="text-xs leading-snug opacity-90">{copy.body}</p>

        {outcome === "lucky_guess" && (
          <p className="mt-2 flex items-start gap-2 rounded-xl border-2 border-amber-600/60 bg-white/70 p-2.5 text-xs font-bold leading-snug text-amber-950">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
            {id.outcome.lucky_guess.lesson}
          </p>
        )}
      </div>
    </motion.section>
  );
}
