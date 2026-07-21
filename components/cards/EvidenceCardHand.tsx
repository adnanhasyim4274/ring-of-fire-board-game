"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import type { EvidenceCard, GameState, Player } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import { Button } from "@/components/ui/Button";

const categoryStyles: Record<string, string> = {
  WHAT: "bg-sky-600",
  WHERE: "bg-teal-600",
  WHY: "bg-orange-600",
  WHO: "bg-purple-600",
  HOW: "bg-emerald-700",
};

export function EvidenceCardHand({
  state,
  player,
  onVerify,
  onDiscard,
}: {
  state: GameState;
  player: Player;
  onVerify: (card: EvidenceCard) => void;
  onDiscard: (card: EvidenceCard) => void;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const inVerification = state.phase === "phase2_verification" && state.activeEventOutcome === "pending";
  const canDiscard =
    state.phase === "phase2_verification" ||
    (state.phase === "phase3_evacuation" && state.players[state.currentPlayerIndex].id === player.id);

  if (player.hand.length === 0) {
    return <p className="p-3 text-center text-sm text-zinc-500">—</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {player.hand.map((cardId, i) => {
        const card = evidenceCardById[cardId];
        const whereBlocked =
          card.category === "WHERE" && state.activeDisasterEffect?.roundEffectKey === "block_where";
        const matches =
          !!state.activeEventCard &&
          (card.isWildcard || state.activeEventCard.requiredLocks.includes(card.category));
        const verifyEnabled = inVerification && matches && !whereBlocked;
        const tradeBlocked =
          card.resourceKind === "trade" && state.activeDisasterEffect?.roundEffectKey === "block_trade";
        const isOpen = expanded === i;
        return (
          <li key={`${cardId}-${i}`}>
            <motion.div
              layout
              className={cn(
                "overflow-hidden rounded-xl border-2 bg-white",
                card.isWildcard ? "border-emerald-600" : "border-zinc-300"
              )}
            >
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 px-2.5 py-1.5 text-left"
                onClick={() => setExpanded(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[10px] font-black text-white",
                    categoryStyles[card.category]
                  )}
                >
                  {card.category}
                </span>
                <span className="flex-1 truncate text-sm font-bold">
                  {card.isWildcard && <Sparkles className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />}
                  {card.title}
                </span>
                <span className="text-xs font-black text-amber-600">{"★".repeat(card.points)}</span>
                <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="space-y-2 border-t border-zinc-200 px-2.5 py-2">
                  <p className="text-xs leading-snug text-zinc-600">{card.description}</p>
                  <p className="text-xs font-semibold text-emerald-800">{card.milEffect}</p>
                  <div className="flex flex-col gap-1.5 sm:flex-row">
                    <Button
                      variant="safe"
                      className="flex-1 text-sm"
                      disabled={!verifyEnabled}
                      onClick={() => onVerify(card)}
                    >
                      <Search className="mr-1 inline h-4 w-4" />
                      {en.verification.verify}
                      {inVerification && !matches && ` (${en.verification.noMatch})`}
                      {whereBlocked && ` (${en.verification.blocked})`}
                    </Button>
                    <Button
                      variant="secondary"
                      className="flex-1 text-sm"
                      disabled={!canDiscard || tradeBlocked}
                      onClick={() => onDiscard(card)}
                    >
                      {en.verification.discardFor} {card.resourceEffectName}
                      {tradeBlocked && ` (${en.verification.blocked})`}
                    </Button>
                  </div>
                  <p className="text-[11px] leading-snug text-zinc-500">{card.resourceEffect}</p>
                </div>
              )}
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
}
