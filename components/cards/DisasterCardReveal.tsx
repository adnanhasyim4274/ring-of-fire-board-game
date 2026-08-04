"use client";
import { motion } from "framer-motion";
import { Flame, MapPin, Timer, Zap } from "lucide-react";
import type { DisasterCard } from "@/engine/types";
import { cn } from "@/lib/utils";
import { id } from "@/lib/i18n/id";
import { DISASTER_CATEGORY_CLASS } from "@/lib/theme";

export function DisasterCardReveal({
  card,
  compact,
}: {
  card: DisasterCard;
  compact?: boolean;
}) {
  const sectors =
    card.affectedSectorIds.length === 0
      ? id.disaster.allSectors
      : card.affectedSectorIds.map((s) => id.board.sectorShort[s]).join(" · ");

  return (
    <motion.article
      initial={compact ? false : { rotateX: -70, opacity: 0, y: -14 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.2, 0.9, 0.25, 1] }}
      style={{ transformPerspective: 900 }}
      className={cn(
        "overflow-hidden rounded-2xl border-2 border-black/40 bg-gradient-to-br text-white shadow-xl",
        DISASTER_CATEGORY_CLASS[card.category]
      )}
    >
      <header className="flex items-center gap-2 bg-black/30 px-3 py-1.5">
        <Flame className="h-4 w-4 shrink-0" />
        <span className="text-[11px] font-black uppercase tracking-widest">
          {id.disaster.category[card.category]}
        </span>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wide opacity-70">
          {sectors}
        </span>
      </header>

      <div className={cn("space-y-2 p-3", compact && "space-y-1.5 p-2.5")}>
        <h3 className={cn("font-black leading-tight", compact ? "text-sm" : "text-lg")}>
          {card.title}
        </h3>

        {!compact && (
          <>
            <p className="text-sm leading-snug text-white/90">{card.description}</p>
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-white/70">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {id.disaster.location}: {card.locationLabel}
            </p>
          </>
        )}

        <div className="rounded-xl bg-white/15 p-2.5 text-xs leading-snug">
          <span className="mb-0.5 flex items-center gap-1 font-black uppercase tracking-wide opacity-80">
            <Zap className="h-3.5 w-3.5" />
            {id.disaster.roundEffect}
          </span>
          {card.roundEffect}
        </div>

        {!compact && (
          <div className="rounded-xl bg-black/30 p-2.5 text-xs leading-snug">
            <span className="mb-0.5 flex items-center gap-1 font-black uppercase tracking-wide opacity-80">
              <Timer className="h-3.5 w-3.5" />
              {id.disaster.endEffect}
            </span>
            {card.endEffect}
          </div>
        )}
      </div>
    </motion.article>
  );
}
