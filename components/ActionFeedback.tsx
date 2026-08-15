"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Megaphone } from "lucide-react";
import type { GameLogEntry } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/**
 * Playtest note: "after taking an action it is sometimes difficult to tell what
 * has happened as a result". The engine already writes a readable line for every
 * action, but it only lived in the collapsed log at the foot of a long page.
 * This strip lifts that same line to the top of the play column and flashes once
 * when a new one arrives, so the result of a tap lands where the eye already is.
 */
export function ActionFeedback({
  log,
  ap,
  className,
}: {
  log: GameLogEntry[];
  /** Action Points of the player whose turn it is. Optional: the strip works
   *  without it, and only then can it report what the action cost. */
  ap?: number;
  className?: string;
}) {
  const reduced = useReducedMotion() === true;

  // `timestamp` is the log index the reducer stamps on, so it rises by one per
  // entry and identifies "the newest line" without comparing message text.
  const latest = log.length > 0 ? log[log.length - 1] : null;
  const stamp = latest ? latest.timestamp : -1;
  const currentAp = typeof ap === "number" ? ap : null;

  // "Adjust state during render", the same pattern the play page uses to reset
  // transient UI: remember what was on screen last time and compare here. An
  // effect would need a setState inside it, which this repo's eslint bans.
  const [seen, setSeen] = useState<{ stamp: number; ap: number | null; spent: number }>({
    stamp,
    ap: currentAp,
    spent: 0,
  });
  if (seen.stamp !== stamp || seen.ap !== currentAp) {
    const advanced = seen.stamp !== stamp;
    const before = seen.ap;
    // Only a fresh log line may claim an AP drop; an AP change on its own (a
    // new turn refilling the pool, say) just updates the baseline.
    const spent =
      advanced && before !== null && currentAp !== null && before > currentAp
        ? before - currentAp
        : advanced
          ? 0
          : seen.spent;
    setSeen({ stamp, ap: currentAp, spent });
  }

  // Nothing has happened yet: no strip, no border, no padded box, and — because
  // `sr-only` is absolutely positioned — no gap in the column either.
  if (!latest) {
    return <p className="sr-only">{id.feedback.nothingYet}</p>;
  }

  const spent = seen.stamp === stamp ? seen.spent : 0;

  return (
    <div role="status" aria-live="polite" className={cn("relative", className)}>
      {/* Keyed on the log index: a new entry remounts this block, which replays
          `initial` -> `animate` and gives the flash for free. */}
      <motion.div
        key={stamp}
        initial={reduced ? false : { opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative overflow-hidden rounded-xl border-2 border-amber-300 bg-amber-50 px-2 py-1.5"
      >
        {/* The flash itself: a wash of colour over the strip that fades out and
            leaves the resting state behind. Opacity only, so it stays sensible
            when the reader asked for reduced motion. */}
        <motion.span
          aria-hidden
          initial={{ opacity: reduced ? 0.45 : 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.5 : 0.9, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 bg-amber-300"
        />

        <div className="relative flex items-start gap-1.5">
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
              {id.feedback.lastAction}
            </p>
            {/* `break-words`: a couple of engine lines quote a card title long
                enough to overrun a 375px column otherwise. */}
            <p className="break-words text-xs font-bold leading-snug text-zinc-800">
              {latest.message}
            </p>
          </div>

          {currentAp !== null && (
            <span className="flex shrink-0 flex-col items-end gap-0.5 text-[10px] font-black tabular-nums">
              {spent > 0 && (
                <span className="rounded-full bg-amber-200 px-1.5 py-0.5 text-amber-900">
                  −{spent} {id.feedback.apSpent}
                </span>
              )}
              <span className="text-amber-700">
                {currentAp} {id.feedback.apLeft}
              </span>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/** Which way a watched number moved, so a flash can be coloured for it. */
export type FlashDirection = "up" | "down" | "none";

/**
 * Notices that a displayed number changed. `pulseKey` rises on every change:
 * hand it to a `key` and the flash replays. Same render-time comparison as
 * above — no effect, no setState in an effect.
 */
export function useValueFlash(value: number): { pulseKey: number; direction: FlashDirection } {
  const [seen, setSeen] = useState<{ value: number; pulseKey: number; direction: FlashDirection }>({
    value,
    pulseKey: 0,
    direction: "none",
  });
  if (seen.value !== value) {
    setSeen({
      value,
      pulseKey: seen.pulseKey + 1,
      direction: value > seen.value ? "up" : "down",
    });
  }
  return { pulseKey: seen.pulseKey, direction: seen.direction };
}

/**
 * A one-shot halo over whichever readout just moved, so the player can see
 * WHICH number changed rather than hunting the whole status board. Purely
 * decorative and out of the layout: the parent needs `relative`, nothing else.
 */
export function ChangeFlash({
  pulseKey,
  tone,
  shape = "box",
}: {
  /** From `useValueFlash`. Also pass it as this element's `key`. */
  pulseKey: number;
  tone: "good" | "warn" | "bad";
  shape?: "box" | "pill";
}) {
  const reduced = useReducedMotion() === true;
  // Nothing has moved yet this session — do not greet the player with a flash.
  if (pulseKey === 0) return null;

  return (
    <motion.span
      aria-hidden
      initial={{ opacity: reduced ? 0.5 : 0.9 }}
      animate={{ opacity: 0 }}
      transition={{ duration: reduced ? 0.5 : 1, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute ring-2",
        shape === "pill" ? "-inset-0.5 rounded-full" : "-inset-1 rounded-lg",
        tone === "good"
          ? "bg-emerald-300/30 ring-emerald-400"
          : tone === "warn"
            ? "bg-amber-300/30 ring-amber-400"
            : "bg-red-300/30 ring-red-400"
      )}
    />
  );
}
