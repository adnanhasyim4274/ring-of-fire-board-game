"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, ChevronDown, Recycle, Sparkles, Unlock } from "lucide-react";
import type { EvidenceCard, EvidenceCategory, GameState, Player } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { isCategoryBlocked } from "@/lib/engineBridge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { id } from "@/lib/i18n/id";
import { EVIDENCE_CATEGORY_CLASS, EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

export function EvidenceCardHand({
  state,
  player,
  canAct,
  onPlayLock,
  onDiscard,
  onBarter,
}: {
  state: GameState;
  player: Player;
  /** Pemain ini sedang boleh bertindak (gilirannya, fase yang benar). */
  canAct: boolean;
  onPlayLock?: (card: EvidenceCard, lock: EvidenceCategory) => void;
  onDiscard?: (card: EvidenceCard) => void;
  onBarter?: (card: EvidenceCard) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const news = state.activeNews;
  const barterBlocked = state.activeDisaster?.roundEffectKey === "block_trade";

  if (player.hand.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-zinc-300 p-4 text-center text-xs font-bold text-zinc-500">
        {id.evidence.empty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {player.hand.map((cardId, i) => {
        const card = evidenceCardById[cardId];
        if (!card) return null;

        const key = `${cardId}-${i}`;
        const isOpen = expanded === key;
        const isBlocked = isCategoryBlocked(state, card.category);

        // Gembok yang bisa dibuka kartu ini: wildcard membuka apa pun.
        const openableLocks: EvidenceCategory[] = news
          ? news.locks.filter(
              (l) =>
                !state.locksOpened.includes(l) && (card.isWildcard || card.category === l)
            )
          : [];

        return (
          <li key={key}>
            <motion.div
              layout
              className={cn(
                "overflow-hidden rounded-xl border-2 bg-white",
                card.isWildcard ? "border-emerald-600" : "border-zinc-300",
                isBlocked && "opacity-60"
              )}
            >
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 px-2.5 py-1.5 text-left"
                onClick={() => setExpanded(isOpen ? null : key)}
                aria-expanded={isOpen}
              >
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black text-white",
                    EVIDENCE_CATEGORY_CLASS[card.category]
                  )}
                >
                  {EVIDENCE_CATEGORY_ICON[card.category]} {card.category}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold">
                  {card.isWildcard && (
                    <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
                  )}
                  {card.title}
                </span>
                <span
                  className="shrink-0 text-xs font-black text-amber-600"
                  aria-label={`${card.points} ${id.common.points}`}
                >
                  {"★".repeat(card.points)}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-zinc-400 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </button>

              {isOpen && (
                <div className="space-y-2 border-t border-zinc-200 px-2.5 py-2">
                  <p className="text-[11px] leading-snug text-zinc-600">{card.description}</p>

                  <div className="rounded-lg bg-emerald-50 p-2">
                    <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                      {id.evidence.zonaAtas}
                    </p>
                    <p className="text-[11px] leading-snug text-emerald-900">{card.milEffect}</p>
                    {card.isWildcard && (
                      <p className="mt-1 text-[10px] font-black text-emerald-700">
                        {id.evidence.wildcard}
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg bg-amber-50 p-2">
                    <p className="text-[10px] font-black uppercase tracking-wide text-amber-700">
                      {id.evidence.zonaBawah} · {card.resourceName}
                    </p>
                    <p className="text-[11px] leading-snug text-amber-900">
                      {card.resourceEffect}
                    </p>
                  </div>

                  {isBlocked && (
                    <p className="rounded-lg bg-red-50 p-2 text-[11px] font-bold text-red-700">
                      {id.evidence.blockedChaos}
                    </p>
                  )}

                  {/* ZONA ATAS — pasang ke gembok (0 AP) */}
                  {onPlayLock && (
                    <div className="flex flex-wrap gap-1.5">
                      {openableLocks.length === 0 ? (
                        <p className="text-[11px] font-bold text-zinc-400">
                          {id.evidence.noMatch}
                        </p>
                      ) : (
                        openableLocks.map((lock) => (
                          <Button
                            key={lock}
                            variant="safe"
                            className="flex-1 text-xs"
                            disabled={!canAct || isBlocked}
                            onClick={() => onPlayLock(card, lock)}
                          >
                            <Unlock className="mr-1 inline h-3.5 w-3.5" />
                            {id.evidence.playToLockShort} {EVIDENCE_CATEGORY_ICON[lock]} {lock}
                          </Button>
                        ))
                      )}
                    </div>
                  )}

                  {/* ZONA BAWAH — buang untuk sumber daya (0 AP) / barter (1 AP) */}
                  <div className="flex flex-col gap-1.5 sm:flex-row">
                    {onDiscard && (
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs"
                        disabled={!canAct}
                        onClick={() => onDiscard(card)}
                      >
                        <Recycle className="mr-1 inline h-3.5 w-3.5" />
                        {id.evidence.discardFor} {card.resourceName}
                      </Button>
                    )}
                    {onBarter && (
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs"
                        disabled={!canAct || barterBlocked}
                        onClick={() => onBarter(card)}
                      >
                        <ArrowLeftRight className="mr-1 inline h-3.5 w-3.5" />
                        {barterBlocked ? id.evidence.blockedRound : id.evidence.barter}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
