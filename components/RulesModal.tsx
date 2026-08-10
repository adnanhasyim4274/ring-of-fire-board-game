"use client";
import { useState } from "react";
import { BookOpen, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en as id } from "@/lib/i18n/en";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";

const SEEN_KEY = "ring-of-fire-primer-seen-v1";

/**
 * Reading a rulebook is not the same as picturing a turn. This primer opens
 * once, before the first round, so that a player who has never seen the game
 * knows what the next five phases will ask of them. It is dismissible, the
 * dismissal is remembered, and the Rules button on the board reopens it.
 */
function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode: treat it as unseen, so the primer simply opens again.
    return false;
  }
}

export function useRulesPrimer() {
  const mounted = useHydrated();
  /** null until hydration, so the server and first client render agree. */
  const [seen, setSeen] = useState<boolean | null>(null);
  const [closed, setClosed] = useState(false);
  const [reopened, setReopened] = useState(false);

  // "Adjust state during render" rather than reading storage in an effect,
  // matching the pattern used on the play page.
  if (mounted && seen === null) setSeen(readSeen());

  const open = reopened || (seen === false && !closed);
  /** Only the automatic first showing offers "do not show this again". */
  const firstTime = seen === false && !closed;

  const dismiss = (rememberDismissal: boolean) => {
    if (rememberDismissal) {
      try {
        window.localStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* nothing to remember it with; the primer opens again next time */
      }
    }
    setClosed(true);
    setReopened(false);
    setSeen(true);
  };

  return { open, setOpen: setReopened, dismiss, firstTime };
}

const TONE: Record<string, string> = {
  good: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warn: "bg-amber-50 border-amber-200 text-amber-800",
  bad: "bg-rose-50 border-rose-200 text-rose-800",
};

export function RulesModal({
  open,
  onDismiss,
  firstTime = true,
}: {
  open: boolean;
  onDismiss: (remember: boolean) => void;
  firstTime?: boolean;
}) {
  const [remember, setRemember] = useState(true);
  const t = id.primer;

  return (
    <Modal open={open} size="lg" onClose={() => onDismiss(firstTime && remember)}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">
          <BookOpen size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold leading-tight text-stone-900">{t.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-600">{t.subtitle}</p>
        </div>
        <button
          type="button"
          aria-label={t.close}
          onClick={() => onDismiss(firstTime && remember)}
          className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-3">
        <p className="text-xs font-bold uppercase tracking-wide text-orange-700">
          {t.goalLabel}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-stone-700">{t.goalBody}</p>
      </div>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-stone-500">
        {t.roundLabel}
      </p>
      <ol className="mt-2 grid gap-2 sm:grid-cols-2">
        {t.steps.map((s) => (
          <li
            key={s.n}
            className="flex gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-2.5"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-stone-800 text-xs font-bold text-white">
              {s.n}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight text-stone-900">{s.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-stone-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-stone-500">
        {t.outcomeLabel}
      </p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {t.outcomes.map((o) => (
          <div key={o.tag} className={cn("rounded-xl border p-2.5", TONE[o.tone])}>
            <p className="text-xs font-extrabold tracking-wide">{o.tag}</p>
            <p className="mt-1 text-xs leading-snug opacity-80">{o.cond}</p>
            <p className="mt-1.5 text-xs font-semibold leading-snug">{o.result}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {t.keyLabel}
          </p>
          <ul className="mt-2 space-y-1.5">
            {t.keys.map((k) => (
              <li key={k} className="flex gap-2 text-xs leading-relaxed text-stone-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                <span>{k}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
            {t.loseLabel}
          </p>
          <ul className="mt-2 space-y-1.5">
            {t.lose.map((l) => (
              <li key={l} className="flex gap-2 text-xs leading-relaxed text-stone-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-4">
        {firstTime ? (
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-stone-600">
            <span
              className={cn(
                "grid h-4 w-4 place-items-center rounded border transition",
                remember
                  ? "border-orange-500 bg-orange-500 text-white"
                  : "border-stone-300 bg-white"
              )}
            >
              {remember && <Check size={11} strokeWidth={3} />}
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            {t.dontShow}
          </label>
        ) : (
          <span />
        )}
        <Button onClick={() => onDismiss(firstTime && remember)}>
          {firstTime ? t.start : t.close}
        </Button>
      </div>
    </Modal>
  );
}
