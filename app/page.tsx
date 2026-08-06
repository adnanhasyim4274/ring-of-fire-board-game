"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Play } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/lib/useHydrated";
import { en as id } from "@/lib/i18n/en";
import { roleEmoji } from "@/lib/roleEmoji";
import { SECTOR_COLOR } from "@/lib/theme";
import { CENTRE, RING_RADIUS, VIEWBOX, tileHexPoints } from "@/lib/ring";

const RING_SIZE = 24;
const READY_POSTS = [0, 4, 8, 12, 16, 20];
const SECTOR_OF = (i: number) => {
  const order = ["sunda", "philippine", "hokkaido", "cascadia", "andes", "south_pacific"] as const;
  return order[Math.floor(i / 4) % 6];
};

export default function HomePage() {
  const state = useGameStore((s) => s.state);
  const hydrated = useHydrated();
  const hasSave = hydrated && state !== null && state.phase !== "game_over";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-6 p-6 pb-12 text-center lg:max-w-lg">
      {/* Lambang cincin — 28 ubin, sama persis dengan papan */}
      <div className="relative mt-2 w-52 max-w-full">
        <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="ring-glow h-full w-full" aria-hidden>
          <circle cx={CENTRE} cy={CENTRE} r={RING_RADIUS - 90} fill="#0b2233" />
          {Array.from({ length: RING_SIZE }).map((_, i) => (
            <polygon
              key={i}
              points={tileHexPoints(i, RING_SIZE)}
              fill={READY_POSTS.includes(i) ? "#2B2F38" : SECTOR_COLOR[SECTOR_OF(i)]}
              stroke="#00000033"
              strokeWidth={4}
            />
          ))}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-3xl">
          {Object.values(roleEmoji).slice(0, 3).join("")}
        </span>
      </div>

      <div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black leading-none tracking-tight text-lava"
        >
          {id.appName}
        </motion.h1>
        <p className="mt-1.5 text-sm font-bold text-zinc-500">{id.tagline}</p>
      </div>

      <p className="text-[15px] leading-relaxed text-zinc-700">{id.home.blurb}</p>

      <div className="flex w-full flex-col gap-2.5">
        {hasSave && (
          <Link href="/play" className="w-full">
            <Button variant="safe" className="w-full text-lg">
              <Play className="mr-2 inline h-5 w-5" />
              {id.home.continueGame}
            </Button>
          </Link>
        )}
        <Link href="/setup" className="w-full">
          <Button className="w-full text-lg">
            <Play className="mr-2 inline h-5 w-5" />
            {id.home.playNow}
          </Button>
        </Link>
        <Link href="/how-to-play" className="w-full">
          <Button variant="secondary" className="w-full">
            <BookOpen className="mr-2 inline h-5 w-5" />
            {id.home.howToPlay}
          </Button>
        </Link>
      </div>

      <ul className="grid w-full gap-2 text-left">
        {id.home.pillars.map((p, i) => (
          <motion.li
            key={p.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-black/10 bg-white/70 p-2.5"
          >
            <p className="text-xs font-black text-lava">{p.title}</p>
            <p className="text-[11px] leading-snug text-zinc-600">{p.body}</p>
          </motion.li>
        ))}
      </ul>

      <p className="text-xs text-zinc-400">{id.home.passAndPlay}</p>
      <p className="text-[11px] text-zinc-400">{id.home.demoNote}</p>
    </main>
  );
}
