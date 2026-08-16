"use client";
import { motion } from "framer-motion";
import { Award, Check, ShoppingBag } from "lucide-react";
import type { GameAction, GameState } from "@/engine/types";
import { rewardCards, isRewardEffectCovered } from "@/data/rewardCards";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/**
 * Each standing bonus is printed on two cards, but it only ever applies once,
 * so the second copy used to be a live button that took the Reputation and
 * changed nothing. The reducer now refuses it — and this is the half that
 * matters, because the player has to be able to see that BEFORE they tap.
 *
 * Belongs in lib/i18n/en.ts; that file is owned by another lane.
 */
const TEXT = {
  covered: "Already covered",
  coveredWhy: "You own another Reward with this exact effect, and it does not stack.",
} as const;

/** FASE 5 — belanja Poin Reputasi jadi peningkatan permanen untuk seluruh tim. */
export function RewardShop({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const available = rewardCards.filter((r) => !state.ownedRewards.includes(r.id));

  return (
    <section className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-3">
      <h3 className="flex items-center gap-2 text-sm font-black text-amber-900">
        <ShoppingBag className="h-4 w-4 shrink-0" />
        {id.reward.title}
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs tabular-nums text-rep">
          <Award className="h-3.5 w-3.5" />
          {state.reputation}
        </span>
      </h3>
      <p className="text-[11px] leading-snug text-amber-800/80">{id.reward.subtitle}</p>

      {available.length === 0 ? (
        <p className="rounded-xl bg-white/70 p-3 text-center text-xs font-bold text-zinc-500">
          {id.reward.empty}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {available.map((card) => {
            const covered = isRewardEffectCovered(card.effectKey, state.ownedRewards);
            const affordable = state.reputation >= card.cost;
            return (
              <motion.li
                key={card.id}
                layout
                className={cn(
                  "flex items-start gap-2 rounded-xl border-2 bg-white p-2.5",
                  covered
                    ? "border-zinc-200 opacity-60"
                    : affordable
                      ? "border-amber-400"
                      : "border-zinc-200 opacity-70"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black leading-tight">{card.title}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-600">
                    {card.description}
                  </span>
                  {covered && (
                    <span className="mt-1 block text-[11px] font-bold leading-snug text-zinc-500">
                      {TEXT.coveredWhy}
                    </span>
                  )}
                </span>
                <Button
                  className="shrink-0 px-3 text-xs"
                  disabled={!affordable || covered}
                  onClick={() => dispatch({ type: "BUY_REWARD", rewardId: card.id })}
                >
                  {covered ? TEXT.covered : `${card.cost} ${id.reward.cost}`}
                </Button>
              </motion.li>
            );
          })}
        </ul>
      )}

      {state.ownedRewards.length > 0 && (
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-wide text-amber-800/70">
            {id.hud.ownedRewards}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {state.ownedRewards.map((rid) => {
              const card = rewardCards.find((r) => r.id === rid);
              if (!card) return null;
              return (
                <li
                  key={rid}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
                >
                  <Check className="h-3 w-3" />
                  {card.title}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
