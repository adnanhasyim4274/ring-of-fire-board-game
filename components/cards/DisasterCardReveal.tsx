"use client";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { DisasterCard } from "@/engine/types";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

const categoryStyles: Record<DisasterCard["category"], string> = {
  water_coastal: "from-sky-700 to-blue-900",
  volcanic: "from-orange-600 to-red-900",
  tectonic: "from-rose-700 to-red-950",
  social_infra: "from-zinc-600 to-zinc-900",
};

export function DisasterCardReveal({ card, compact }: { card: DisasterCard; compact?: boolean }) {
  return (
    <motion.article
      initial={compact ? false : { rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-zinc-800 bg-gradient-to-br text-white shadow-xl",
        categoryStyles[card.category]
      )}
    >
      <header className="flex items-center gap-2 bg-black/30 px-3 py-1.5">
        <Flame className="h-4 w-4" />
        <span className="text-xs font-black uppercase tracking-wider">
          {en.disaster.category[card.category]}
        </span>
      </header>
      <div className={cn("space-y-2 p-3", compact && "space-y-1 p-2")}>
        <h3 className={cn("font-black leading-tight", compact ? "text-sm" : "text-lg")}>{card.title}</h3>
        {!compact && <p className="text-sm leading-snug text-white/90">{card.description}</p>}
        <div className="rounded-lg bg-white/15 p-2 text-xs">
          <span className="font-black uppercase">{en.disaster.roundEffect}: </span>
          {card.roundEffect}
        </div>
        {!compact && (
          <div className="rounded-lg bg-black/25 p-2 text-xs">
            <span className="font-black uppercase">{en.disaster.endEffect}: </span>
            {card.endEffect}
          </div>
        )}
      </div>
    </motion.article>
  );
}
