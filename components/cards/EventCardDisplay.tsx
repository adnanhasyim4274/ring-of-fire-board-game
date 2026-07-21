"use client";
import { motion } from "framer-motion";
import { ImageIcon, Lock, LockOpen, MapPin, Newspaper } from "lucide-react";
import type { EventCard, EventOutcome, EvidenceCategory } from "@/engine/types";
import { tileTypeById } from "@/data/tileTypes";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

const outcomeStyles: Record<string, string> = {
  hoax: "bg-red-600",
  pseudoscience: "bg-purple-600",
  scam: "bg-orange-600",
  superstition: "bg-indigo-600",
  fact: "bg-emerald-600",
};

export function EventCardDisplay({
  card,
  locksOpened,
  outcome,
}: {
  card: EventCard;
  locksOpened: EvidenceCategory[];
  outcome: EventOutcome;
}) {
  const resolved = outcome !== "pending";
  return (
    <motion.article
      initial={{ y: 30, opacity: 0, rotate: -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      className="overflow-hidden rounded-2xl border-2 border-zinc-300 bg-white shadow-lg"
    >
      <header className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 text-white">
        <Newspaper className="h-4 w-4" />
        <span className="text-xs font-black uppercase tracking-wider">{en.event.incomingNews}</span>
      </header>
      <div className="space-y-2 p-3">
        <h2 className="text-lg font-black leading-tight">{card.title}</h2>
        <p className="text-sm leading-snug">{card.body}</p>
        <p className="flex items-start gap-1.5 rounded-lg bg-zinc-100 p-2 text-xs italic text-zinc-600">
          <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {card.attachedContent}
        </p>
        <p className="flex items-center gap-1 text-xs font-bold text-red-700">
          <MapPin className="h-4 w-4" />
          {en.event.targetArea}: {tileTypeById[card.targetTileType]?.name ?? card.targetTileType}
        </p>
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase text-zinc-500">{en.event.locks}</p>
          <div className="flex flex-wrap gap-1.5">
            {card.requiredLocks.map((lock) => {
              const open = locksOpened.includes(lock);
              return (
                <span
                  key={lock}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-xs font-black",
                    open
                      ? "border-emerald-600 bg-emerald-100 text-emerald-700 line-through"
                      : "border-zinc-400 bg-zinc-50 text-zinc-700"
                  )}
                >
                  {open ? <LockOpen className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {lock}
                </span>
              );
            })}
          </div>
        </div>
        {resolved ? (
          <motion.p
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "rounded-xl px-3 py-2 text-center text-sm font-black text-white",
              outcome === "ignored" ? "bg-zinc-500" : outcomeStyles[card.status]
            )}
          >
            {outcome === "ignored" ? en.event.ignored : en.event.revealed[card.status]}
          </motion.p>
        ) : (
          <p className="rounded-xl bg-amber-100 px-3 py-2 text-center text-sm font-bold text-amber-800">
            {en.event.statusHidden}
          </p>
        )}
      </div>
    </motion.article>
  );
}
