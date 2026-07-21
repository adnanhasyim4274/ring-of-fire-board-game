"use client";
import { useEffect, useState } from "react";
import { TimerIcon } from "lucide-react";
import { gameConfig } from "@/data/gameConfig";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";

/** Visual discussion countdown for Phase 2 (pacing aid — enforces nothing). */
export function Phase2Timer({ resetKey }: { resetKey: string | number }) {
  // key-based remount resets the countdown without setState-in-effect
  return <TimerInner key={String(resetKey)} />;
}

function TimerInner() {
  const [seconds, setSeconds] = useState<number>(gameConfig.discussionTimerSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");
  const urgent = seconds <= 10;
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black tabular-nums",
        urgent ? "panic-pulse bg-red-100 text-red-700" : "bg-violet-100 text-violet-700"
      )}
      aria-label={en.verification.timer}
    >
      <TimerIcon className="h-4 w-4" />
      {seconds === 0 ? en.verification.timeUp : `${mm}:${ss}`}
    </div>
  );
}
