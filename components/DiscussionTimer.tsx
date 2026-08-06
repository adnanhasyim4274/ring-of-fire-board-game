"use client";
import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { gameConfig } from "@/data/gameConfig";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/**
 * Jam pasir 1 menit dari komponen fisik — alat pacing melawan analysis
 * paralysis. Tidak memaksa apa pun; hanya menghitung mundur.
 */
export function DiscussionTimer({ resetKey }: { resetKey: string | number }) {
  // Remount lewat key mereset hitungan tanpa setState di dalam effect.
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black tabular-nums",
        urgent ? "panic-pulse bg-red-100 text-red-700" : "bg-violet-100 text-violet-800"
      )}
      aria-label={id.timer.label}
      role="timer"
    >
      <Hourglass className="h-4 w-4" />
      {seconds === 0 ? id.timer.timeUp : `${mm}:${ss}`}
    </span>
  );
}
