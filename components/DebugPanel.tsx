"use client";
import { useState } from "react";
import { Bug } from "lucide-react";
import type { GameAction, GamePhase } from "@/engine/types";
import { eventCards } from "@/data/eventCards";
import { disasterCards } from "@/data/disasterCards";
import { en } from "@/lib/i18n/en";

const phases: GamePhase[] = [
  "phase1_influx",
  "phase2_verification",
  "phase3_evacuation",
  "phase4_escalation",
];

/** Hidden playtest panel — only rendered when NEXT_PUBLIC_DEBUG=1. */
export function DebugPanel({ dispatch }: { dispatch: (a: GameAction) => void }) {
  const [open, setOpen] = useState(false);
  if (process.env.NEXT_PUBLIC_DEBUG !== "1") return null;
  return (
    <section className="rounded-xl border-2 border-dashed border-fuchsia-400 bg-fuchsia-50 p-2 text-xs">
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-1 font-black text-fuchsia-700"
        onClick={() => setOpen(!open)}
      >
        <Bug className="h-4 w-4" /> {en.debug.title}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            {en.debug.setPanic}
            <select
              className="rounded border p-1"
              onChange={(e) => dispatch({ type: "DEBUG_SET_PANIC", value: Number(e.target.value) })}
              defaultValue=""
            >
              <option value="" disabled>—</option>
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            {en.debug.setPhase}
            <select
              className="rounded border p-1"
              onChange={(e) => dispatch({ type: "DEBUG_SET_PHASE", phase: e.target.value as GamePhase })}
              defaultValue=""
            >
              <option value="" disabled>—</option>
              {phases.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            {en.debug.eventTop}
            <select
              className="rounded border p-1"
              onChange={(e) => dispatch({ type: "DEBUG_SET_EVENT_TOP", cardId: e.target.value })}
              defaultValue=""
            >
              <option value="" disabled>—</option>
              {eventCards.map((c) => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            {en.debug.disasterTop}
            <select
              className="rounded border p-1"
              onChange={(e) => dispatch({ type: "DEBUG_SET_DISASTER_TOP", cardId: e.target.value })}
              defaultValue=""
            >
              <option value="" disabled>—</option>
              {disasterCards.map((c) => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="min-h-11 rounded border border-fuchsia-400 bg-white px-2 font-bold"
            onClick={() => dispatch({ type: "DEBUG_EMPTY_DISASTER_DECK" })}
          >
            {en.debug.trimDeck}
          </button>
        </div>
      )}
    </section>
  );
}
