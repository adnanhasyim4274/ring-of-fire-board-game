"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight, Ban, ChevronDown, Lock, Recycle, Sparkles, Unlock } from "lucide-react";
import type { EvidenceCard, EvidenceCategory, GameState, Player } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { isCategoryBlocked } from "@/lib/engineBridge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { EVIDENCE_CATEGORY_CLASS, EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

/**
 * Why a card is (or is not) worth playing onto a lock right now.
 *
 * Playtesters read a second copy of a card they had already spent as a bug
 * ("are the hint cards redundant?"). They are not: a lock opens ONCE, so the
 * duplicate is dead weight for the locks but still perfectly good to discard
 * for its resource or to barter away. The hand has to say that out loud.
 *
 *  opens     — fits a lock that is still closed and not blocked -> play it
 *  lockOpen  — fits a lock, but that lock is already open       -> spend/trade
 *  spendOnly — neither lock on this News card takes it          -> spend/trade
 *  blocked   — it would fit, but Chaos/the disaster bars it this round
 */
type LockHintKind = "opens" | "lockOpen" | "spendOnly" | "blocked";

type LockHint = {
  kind: LockHintKind;
  /** Locks this card can open right now (only ever filled for `opens`). */
  locks: EvidenceCategory[];
  /** The longer explanation — shown only for the de-emphasised states. */
  why: string | null;
};

type HandEntry = { key: string; card: EvidenceCard; hint: LockHint | null };

const HINT_LABEL: Record<Exclude<LockHintKind, "opens">, string> = {
  lockOpen: id.evidence.lockOpen,
  spendOnly: id.evidence.spendOnly,
  blocked: id.evidence.blockedRound,
};

const HINT_CLASS: Record<LockHintKind, string> = {
  opens: "text-emerald-700",
  lockOpen: "text-zinc-500",
  spendOnly: "text-zinc-500",
  blocked: "text-red-600",
};

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

  /**
   * Pure, derived during render — mirrors the guards in the PLAY_EVIDENCE_LOCK
   * reducer case so the hand never promises a play the engine would refuse.
   */
  function lockHintFor(card: EvidenceCard): LockHint | null {
    if (!news) return null;
    // Wildcard (the 3-point HOW card) fits any lock.
    const fits = news.locks.filter((l) => card.isWildcard || card.category === l);
    if (fits.length === 0) {
      return { kind: "spendOnly", locks: [], why: id.evidence.spendOnlyWhy };
    }
    const stillClosed = fits.filter((l) => !state.locksOpened.includes(l));
    if (stillClosed.length === 0) {
      return { kind: "lockOpen", locks: [], why: id.evidence.lockOpenWhy };
    }
    const usable = isCategoryBlocked(state, card.category)
      ? []
      : stillClosed.filter((l) => !isCategoryBlocked(state, l));
    if (usable.length === 0) {
      return { kind: "blocked", locks: [], why: id.evidence.blockedChaos };
    }
    return { kind: "opens", locks: usable, why: null };
  }

  const entries: HandEntry[] = player.hand.flatMap((cardId, i) => {
    const card = evidenceCardById[cardId];
    if (!card) return [];
    return [{ key: `${cardId}-${i}`, card, hint: lockHintFor(card) }];
  });

  // One shared line under the hand instead of a wall of text on every card.
  const footerWhys = Array.from(
    new Set(entries.map((e) => e.hint?.why).filter((w): w is string => !!w))
  );

  if (player.hand.length === 0) {
    return (
      <p className="rounded-xl border-2 border-dashed border-zinc-300 p-4 text-center text-xs font-bold text-zinc-500">
        {id.evidence.empty}
      </p>
    );
  }

  // A container, not a viewport, decides the layout inside here: the hand
  // renders in the phase panel, which is a fraction of the screen on a tablet
  // and full width on a phone. Keying off `sm:` put two buttons side by side
  // in a 300px panel purely because the screen behind it was 768px wide.
  return (
    <div className="@container flex flex-col gap-1.5">
      <ul className="flex flex-col gap-1.5">
        {entries.map(({ key, card, hint }) => {
          const isOpen = expanded === key;
          const isBlocked = isCategoryBlocked(state, card.category);
          // De-emphasised, never disabled: spending and trading are real moves.
          const dimmed = hint !== null && hint.kind !== "opens";

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
                  dimmed
                    ? "border-zinc-200"
                    : card.isWildcard
                      ? "border-emerald-600"
                      : "border-zinc-300",
                  (dimmed || isBlocked) && "opacity-60"
                )}
              >
                <button
                  type="button"
                  className="flex min-h-11 w-full flex-col items-stretch gap-0.5 px-2.5 py-1.5 text-left"
                  onClick={() => setExpanded(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  title={hint?.why ?? undefined}
                >
                  <span className="flex w-full items-center gap-2">
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
                  </span>

                  {/* Status vs. the active News card — short label only. */}
                  {hint && (
                    <span
                      className={cn(
                        "flex w-full items-center gap-1 text-[10px] font-black uppercase tracking-wide",
                        HINT_CLASS[hint.kind]
                      )}
                    >
                      {hint.kind === "opens" ? (
                        <>
                          <Unlock className="h-3 w-3 shrink-0" />
                          <span className="min-w-0 truncate">
                            {id.evidence.playToLockShort}{" "}
                            {hint.locks
                              .map((l) => `${EVIDENCE_CATEGORY_ICON[l]} ${l}`)
                              .join(" / ")}
                          </span>
                        </>
                      ) : (
                        <>
                          {hint.kind === "lockOpen" ? (
                            <Lock className="h-3 w-3 shrink-0" />
                          ) : (
                            <Ban className="h-3 w-3 shrink-0" />
                          )}
                          <span className="min-w-0 truncate">{HINT_LABEL[hint.kind]}</span>
                        </>
                      )}
                    </span>
                  )}
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
                            {hint?.why ?? id.evidence.noMatch}
                          </p>
                        ) : (
                          openableLocks.map((lock) => (
                            <Button
                              key={lock}
                              variant="safe"
                              className="flex-1 text-xs"
                              disabled={!canAct || isBlocked || isCategoryBlocked(state, lock)}
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
                    <div className="flex flex-col gap-1.5 @sm:flex-row">
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

      {/* The long "why" lives here once, not on every card. */}
      {footerWhys.length > 0 && (
        <p className="rounded-lg bg-zinc-100 px-2 py-1.5 text-[10px] leading-snug text-zinc-600">
          {footerWhys.map((why) => (
            <span key={why} className="block">
              {why}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
