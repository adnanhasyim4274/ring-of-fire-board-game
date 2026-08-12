"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, FlipHorizontal, Gavel, Lock, LockOpen } from "lucide-react";
import type { GameAction, GameState, NewsCard, Verdict } from "@/engine/types";
import { ART } from "@/data/artManifest";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NewsCardDisplay } from "@/components/cards/NewsCardDisplay";
import { OutcomeBanner } from "@/components/cards/OutcomeBanner";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/**
 * FASE 4 — SIDANG FAKTA (Commit & Flip).
 *
 * Urutannya tidak boleh dibalik:
 *   1. gembok  ->  2. COMMIT_VERDICT (final)  ->  3. FLIP_NEWS  ->  hasil
 *
 * Langkah commit sengaja dibuat terasa berat: tombol besar + dialog konfirmasi
 * yang menyatakan bahwa vonis tidak bisa diubah lagi.
 */
export function VerdictPanel({
  state,
  card,
  sectorName,
  dispatch,
}: {
  state: GameState;
  card: NewsCard;
  sectorName?: string;
  dispatch: (a: GameAction) => void;
}) {
  const [pending, setPending] = useState<Verdict | null>(null);

  const locksComplete = card.locks.every((l) => state.locksOpened.includes(l));
  const committed = state.verdict !== null;
  const revealed = state.newsRevealed;

  const steps = [
    { label: id.verdict.step1, done: locksComplete },
    { label: id.verdict.step2, done: committed },
    { label: id.verdict.step3, done: revealed },
  ];

  return (
    <div className="space-y-2.5">
      <ol className="flex items-stretch gap-1" aria-label={id.verdict.title}>
        {steps.map((s, i) => (
          <li
            key={s.label}
            className={cn(
              "flex flex-1 items-center gap-1.5 rounded-lg border-2 px-2 py-1.5 text-[11px] font-bold leading-tight",
              s.done
                ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                : i === steps.findIndex((x) => !x.done)
                  ? "border-lava bg-orange-50 text-lava"
                  : "border-zinc-200 bg-white text-zinc-400"
            )}
          >
            {s.done ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
            {s.label}
          </li>
        ))}
      </ol>

      <NewsCardDisplay
        card={card}
        locksOpened={state.locksOpened}
        revealed={revealed}
        sectorName={sectorName}
      />

      {/* ——— Langkah 1 & 2: status gembok + commit ——— */}
      {!committed && (
        <div className="space-y-2.5 rounded-2xl border-2 border-zinc-200 bg-white p-3">
          <p
            className={cn(
              "flex items-start gap-2 rounded-xl p-2.5 text-xs font-bold leading-snug",
              locksComplete
                ? "bg-emerald-50 text-emerald-800"
                : "bg-amber-50 text-amber-900"
            )}
          >
            {locksComplete ? (
              <LockOpen className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {locksComplete ? id.verdict.locksComplete : id.verdict.locksIncomplete}
          </p>

          <p className="flex items-center gap-1.5 text-sm font-black">
            <Gavel className="h-4 w-4 text-lava" />
            {id.verdict.prompt}
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <VerdictButton
              verdict="hoax"
              label={id.verdict.hoax}
              hint={id.verdict.hoaxHint}
              className="border-red-600 bg-red-50 text-red-800 hover:bg-red-100"
              icon={<VerdictToken verdict="hoax" px={24} />}
              onPick={setPending}
            />
            <VerdictButton
              verdict="fact"
              label={id.verdict.fakta}
              hint={id.verdict.faktaHint}
              className="border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              icon={<VerdictToken verdict="fact" px={24} />}
              onPick={setPending}
            />
          </div>
          <VerdictButton
            verdict="abstain"
            label={id.verdict.abstain}
            hint={id.verdict.abstainHint}
            className="border-zinc-300 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
            icon={<VerdictToken verdict="abstain" px={24} />}
            onPick={setPending}
          />
        </div>
      )}

      {/* ——— Langkah 3: balik kartu ——— */}
      {committed && !revealed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 rounded-2xl border-2 border-zinc-800 bg-ash p-3 text-white"
        >
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
            <Gavel className="h-4 w-4" />
            {id.verdict.committed}: {verdictLabel(state.verdict)}
            {state.verdict && (
              <VerdictToken verdict={state.verdict} px={22} className="ml-auto" />
            )}
          </p>
          <p className="text-[11px] leading-snug text-white/70">
            {id.verdict.committedNote}
          </p>
          <Button
            className="w-full text-base"
            onClick={() => dispatch({ type: "FLIP_NEWS" })}
          >
            <FlipHorizontal className="mr-2 inline h-5 w-5" />
            {id.verdict.flip}
          </Button>
        </motion.div>
      )}

      {/* ——— Hasil ——— */}
      {revealed && state.lastOutcome && <OutcomeBanner outcome={state.lastOutcome} />}

      <ConfirmDialog
        open={pending !== null}
        title={id.verdict.confirmTitle}
        body={id.verdict.confirmBody}
        confirmLabel={id.verdict.confirmYes}
        cancelLabel={id.verdict.confirmNo}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) dispatch({ type: "COMMIT_VERDICT", verdict: pending });
          setPending(null);
        }}
      >
        <p className="rounded-xl bg-zinc-100 p-3 text-center">
          <span className="block text-[10px] font-black uppercase tracking-wide text-zinc-500">
            {id.verdict.confirmChoice}
          </span>
          {pending && <VerdictToken verdict={pending} px={44} className="mx-auto my-1 block" />}
          <span className="text-2xl font-black tracking-tight">
            {verdictLabel(pending)}
          </span>
        </p>
        {!card.locks.every((l) => state.locksOpened.includes(l)) && (
          <p className="rounded-xl border-2 border-amber-400 bg-amber-50 p-2.5 text-xs font-bold leading-snug text-amber-900">
            {id.verdict.locksIncomplete}
          </p>
        )}
      </ConfirmDialog>
    </div>
  );
}

/** The printed Verdict Token for each vonis. */
const VERDICT_TOKEN: Record<Verdict, string> = {
  fact: ART.token.verdict_fact,
  hoax: ART.token.verdict_hoax,
  abstain: ART.token.verdict_abstain,
};

/**
 * Decorative: every place this is used already prints the verdict in words
 * right beside it, so the token carries no information of its own. Fixed
 * width/height means the button never reflows while the file loads.
 */
function VerdictToken({
  verdict,
  px,
  className,
}: {
  verdict: Verdict;
  px: number;
  className?: string;
}) {
  return (
    <Image
      src={VERDICT_TOKEN[verdict]}
      alt=""
      width={px}
      height={px}
      className={cn("shrink-0", className)}
    />
  );
}

function verdictLabel(v: Verdict | null): string {
  if (v === "hoax") return id.verdict.hoax;
  if (v === "fact") return id.verdict.fakta;
  if (v === "abstain") return id.verdict.abstain;
  return id.common.none;
}

function VerdictButton({
  verdict,
  label,
  hint,
  className,
  icon,
  onPick,
}: {
  verdict: Verdict;
  label: string;
  hint: string;
  className: string;
  icon?: React.ReactNode;
  onPick: (v: Verdict) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(verdict)}
      className={cn(
        "min-h-11 rounded-xl border-2 px-3 py-2 text-left transition-colors active:scale-95",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-base font-black tracking-tight">
        {icon}
        {label}
      </span>
      <span className="mt-0.5 block text-[11px] font-medium leading-tight opacity-80">
        {hint}
      </span>
    </button>
  );
}
