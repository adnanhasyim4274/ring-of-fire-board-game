"use client";
import Link from "next/link";
import { BookOpen, Flame, Play } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/lib/useHydrated";
import { en } from "@/lib/i18n/en";
import { roleEmoji } from "@/lib/roleEmoji";

export default function HomePage() {
  const state = useGameStore((s) => s.state);
  const hydrated = useHydrated();
  const hasSave = hydrated && state !== null && state.phase !== "game_over";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex items-center gap-2 text-5xl">
        {Object.values(roleEmoji).map((e) => (
          <span key={e}>{e}</span>
        ))}
      </div>
      <div>
        <h1 className="flex items-center justify-center gap-2 text-5xl font-black tracking-tight text-lava">
          <Flame className="h-10 w-10" />
          {en.appName}
        </h1>
        <p className="mt-1 text-sm font-bold text-zinc-500">{en.tagline}</p>
      </div>
      <p className="text-base leading-relaxed text-zinc-700">{en.home.blurb}</p>
      <div className="flex w-full flex-col gap-3">
        {hasSave && (
          <Link href="/play" className="w-full">
            <Button variant="safe" className="w-full text-lg">
              <Play className="mr-2 inline h-5 w-5" />
              {en.home.continueGame}
            </Button>
          </Link>
        )}
        <Link href="/setup" className="w-full">
          <Button className="w-full text-lg">
            <Play className="mr-2 inline h-5 w-5" />
            {en.home.playNow}
          </Button>
        </Link>
        <Link href="/how-to-play" className="w-full">
          <Button variant="secondary" className="w-full">
            <BookOpen className="mr-2 inline h-5 w-5" />
            {en.home.howToPlay}
          </Button>
        </Link>
      </div>
      <p className="text-xs text-zinc-400">{en.home.passAndPlay}</p>
    </main>
  );
}
