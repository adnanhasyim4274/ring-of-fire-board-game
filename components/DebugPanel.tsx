"use client";
import { useState } from "react";
import { Bug } from "lucide-react";
import type { GameAction, GamePhase } from "@/engine/types";
import { newsCards } from "@/data/newsCards";
import { disasterCards } from "@/data/disasterCards";
import { gameConfig } from "@/data/gameConfig";
import { PHASE_ORDER } from "@/components/hud/PhaseIndicator";
import { id } from "@/lib/i18n/id";

/** Panel playtest tersembunyi — hanya dirender saat NEXT_PUBLIC_DEBUG=1. */
export function DebugPanel({ dispatch }: { dispatch: (a: GameAction) => void }) {
  const [open, setOpen] = useState(false);
  if (process.env.NEXT_PUBLIC_DEBUG !== "1") return null;

  return (
    <section className="rounded-xl border-2 border-dashed border-fuchsia-400 bg-fuchsia-50 p-2 text-xs">
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-1 font-black text-fuchsia-700"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Bug className="h-4 w-4" /> {id.debug.title}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            {id.debug.setPanic}
            <select
              className="rounded border p-1"
              defaultValue=""
              onChange={(e) =>
                dispatch({ type: "DEBUG_SET_PANIC", value: Number(e.target.value) })
              }
            >
              <option value="" disabled>
                {id.common.none}
              </option>
              {Array.from({ length: 11 }).map((_, v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            {id.debug.setReputation}
            <select
              className="rounded border p-1"
              defaultValue=""
              onChange={(e) =>
                dispatch({ type: "DEBUG_SET_REPUTATION", value: Number(e.target.value) })
              }
            >
              <option value="" disabled>
                {id.common.none}
              </option>
              {Array.from({ length: gameConfig.reputationTrackMax + 1 }).map((_, v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            {id.debug.setPhase}
            <select
              className="rounded border p-1"
              defaultValue=""
              onChange={(e) =>
                dispatch({ type: "DEBUG_SET_PHASE", phase: e.target.value as GamePhase })
              }
            >
              <option value="" disabled>
                {id.common.none}
              </option>
              {PHASE_ORDER.map((p) => (
                <option key={p} value={p}>
                  {id.phases[p].name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            {id.debug.newsTop}
            <select
              className="rounded border p-1"
              defaultValue=""
              onChange={(e) =>
                dispatch({ type: "DEBUG_SET_NEWS_TOP", cardId: e.target.value })
              }
            >
              <option value="" disabled>
                {id.common.none}
              </option>
              {newsCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2">
            {id.debug.disasterTop}
            <select
              className="rounded border p-1"
              defaultValue=""
              onChange={(e) =>
                dispatch({ type: "DEBUG_SET_DISASTER_TOP", cardId: e.target.value })
              }
            >
              <option value="" disabled>
                {id.common.none}
              </option>
              {disasterCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="min-h-11 rounded border border-fuchsia-400 bg-white px-2 font-bold"
            onClick={() => dispatch({ type: "DEBUG_TRIM_DISASTER_DECK" })}
          >
            {id.debug.trimDeck}
          </button>
        </div>
      )}
    </section>
  );
}
