"use client";
import { useState } from "react";
import { ScrollText } from "lucide-react";
import type { GameLogEntry } from "@/engine/types";
import { en } from "@/lib/i18n/en";

export function LogPanel({ log }: { log: GameLogEntry[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-xl border border-zinc-300 bg-white/70">
      <button
        type="button"
        className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-sm font-bold"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <ScrollText className="h-4 w-4" />
        {en.log.title}
        <span className="ml-auto text-xs font-normal text-zinc-500">
          {open ? en.log.hide : en.log.show}
        </span>
      </button>
      {open && (
        <ol className="max-h-48 overflow-y-auto border-t border-zinc-200 px-3 py-2 text-xs">
          {[...log].reverse().map((entry, i) => (
            <li key={i} className="border-b border-zinc-100 py-1 last:border-0">
              <span className="mr-1 font-black text-zinc-400">R{entry.round}</span>
              {entry.message}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
