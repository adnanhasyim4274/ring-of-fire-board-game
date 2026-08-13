"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Pause,
  Play,
  PlayCircle,
  SkipForward,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en as id } from "@/lib/i18n/en";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";

const SEEN_KEY = "ring-of-fire-tutorial-seen-v1";
/** How long each card holds the screen in watch mode. */
const WATCH_MS = 7000;

type Mode = "pick" | "guided" | "watch";

function readSeen(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode: treat it as unseen, so the tutorial simply offers itself again.
    return false;
  }
}

/**
 * Playtesters were still working out the rules after five rounds, and reported
 * that the How to Play page "did not exist" because it lives on the home screen
 * rather than on the board. So the board treats everyone as a new player: the
 * tutorial opens itself, offers a guided or a hands-off watch mode, and can be
 * dismissed in one tap. It stays reachable afterwards from the Rules button.
 */
export function useTutorial() {
  const mounted = useHydrated();
  /** null until hydration, so server and first client render agree. */
  const [seen, setSeen] = useState<boolean | null>(null);
  const [closed, setClosed] = useState(false);
  const [reopened, setReopened] = useState(false);

  // "Adjust state during render" rather than reading storage in an effect,
  // matching the pattern used on the play page.
  if (mounted && seen === null) setSeen(readSeen());

  const open = reopened || (seen === false && !closed);
  /** Only the automatic first showing offers the mode picker. */
  const firstTime = seen === false && !closed;

  const dismiss = () => {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* nothing to remember it with; it will offer itself again next time */
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

export function Tutorial({
  open,
  onDismiss,
  firstTime = true,
  initialMode,
}: {
  open: boolean;
  onDismiss: () => void;
  /** First showing offers the picker. Reopening jumps straight to the cards. */
  firstTime?: boolean;
  initialMode?: Mode;
}) {
  const t = id.tutorial;
  const steps = t.steps;
  const total = steps.length;

  const [mode, setMode] = useState<Mode>(initialMode ?? (firstTime ? "pick" : "guided"));
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reset when the modal is reopened, so it never resumes mid-tutorial.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMode(initialMode ?? (firstTime ? "pick" : "guided"));
      setStep(0);
      setPaused(false);
    }
  }

  // Watch mode advances on a timer. The setState lives inside the timer
  // callback, not in the effect body, so it does not trip the lint rule that
  // bans state updates during an effect.
  const onLastStep = step >= total - 1;
  const ticking = open && mode === "watch" && !paused && !onLastStep;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!ticking) return;
    timer.current = setTimeout(() => setStep((s) => Math.min(s + 1, total - 1)), WATCH_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [ticking, step, total]);

  if (mode === "pick") {
    return (
      <Modal open={open} onClose={onDismiss}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700">
            <BookOpen size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold leading-tight text-stone-900">{t.pick.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">{t.pick.body}</p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setMode("guided")}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-orange-500 bg-orange-50 p-3 text-left transition hover:brightness-[0.98]"
          >
            <ArrowRight size={18} className="shrink-0 text-orange-700" />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-stone-900">{t.pick.guided}</span>
              <span className="block text-xs text-stone-600">{t.pick.guidedNote}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("watch")}
            className="flex w-full items-center gap-3 rounded-xl border-2 border-zinc-300 bg-white p-3 text-left transition hover:border-zinc-400"
          >
            <PlayCircle size={18} className="shrink-0 text-stone-700" />
            <span className="min-w-0">
              <span className="block text-sm font-bold text-stone-900">{t.pick.watch}</span>
              <span className="block text-xs text-stone-600">{t.pick.watchNote}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl p-2.5 text-xs font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            <SkipForward size={14} />
            {t.pick.skip}
          </button>
        </div>
      </Modal>
    );
  }

  const s = steps[step];
  const watching = mode === "watch";

  return (
    <Modal open={open} size="lg" onClose={onDismiss}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-xs font-black text-orange-700">
          {step + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-wide text-orange-700">
            {s.tag}
          </p>
          <h2 className="mt-0.5 text-lg font-bold leading-tight text-stone-900">{s.title}</h2>
        </div>
        <button
          type="button"
          aria-label={t.skip}
          onClick={onDismiss}
          className="rounded-lg p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
        >
          <X size={18} />
        </button>
      </div>

      {/* progress: one segment per step, the active one fills in watch mode */}
      <div className="mt-3 flex gap-1" aria-hidden>
        {steps.map((_, i) => (
          <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200">
            {i < step && <span className="block h-full w-full bg-orange-500" />}
            {i === step && (
              <motion.span
                key={`fill-${step}-${paused}`}
                className="block h-full bg-orange-500"
                initial={{ width: watching ? "0%" : "100%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: watching && !paused && !onLastStep ? WATCH_MS / 1000 : 0,
                  ease: "linear",
                }}
              />
            )}
          </span>
        ))}
      </div>

      <p className="mt-3 max-w-[68ch] text-sm leading-relaxed text-stone-700">{s.body}</p>

      {"points" in s && s.points && (
        <ul className="mt-3 max-w-[68ch] space-y-1.5">
          {s.points.map((pt) => (
            <li key={pt} className="flex gap-2 text-sm leading-relaxed text-stone-700">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      )}

      {"outcomes" in s && s.outcomes && (
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {t.outcomes.map((o) => (
            <div key={o.tag} className={cn("rounded-xl border p-2.5", TONE[o.tone])}>
              <p className="text-xs font-extrabold tracking-wide">{o.tag}</p>
              <p className="mt-1 text-xs leading-snug opacity-80">{o.cond}</p>
              <p className="mt-1.5 text-xs font-semibold leading-snug">{o.result}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-2 py-1 text-xs font-bold text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
          >
            {t.skip}
          </button>
          {watching && !onLastStep && (
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 px-2 py-1 text-xs font-bold text-stone-600 transition hover:border-stone-400"
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? t.resume : t.pause}
            </button>
          )}
          <span className="text-[11px] font-semibold text-stone-400">
            {t.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(total))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((v) => Math.max(0, v - 1))}>
              <span className="flex items-center gap-1.5">
                <ArrowLeft size={15} />
                {t.back}
              </span>
            </Button>
          )}
          {onLastStep ? (
            <Button onClick={onDismiss}>
              <span className="flex items-center gap-1.5">
                <Check size={15} />
                {t.done}
              </span>
            </Button>
          ) : (
            <Button onClick={() => setStep((v) => Math.min(total - 1, v + 1))}>
              <span className="flex items-center gap-1.5">
                {t.next}
                <ArrowRight size={15} />
              </span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
