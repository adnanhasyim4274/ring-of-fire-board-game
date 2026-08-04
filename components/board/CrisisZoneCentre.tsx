"use client";
import { motion } from "framer-motion";
import type { DisasterCard, NewsCard } from "@/engine/types";
import { id } from "@/lib/i18n/id";

/**
 * Isi Zona Krisis di tengah cincin: ringkasan Kartu Bencana + Kartu Berita aktif.
 * Sengaja ringkas — kartu utuhnya tampil di panel fase, ini penanda posisi
 * seperti slot di Papan Pusat versi fisik.
 */
export function CrisisZoneCentre({
  disaster,
  news,
  panic,
  panicMax,
}: {
  disaster: DisasterCard | null;
  news: NewsCard | null;
  panic: number;
  panicMax: number;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-1">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-sky-300/70">
        {id.board.crisisZone}
      </p>

      {disaster && (
        <motion.p
          key={disaster.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="line-clamp-2 w-full rounded-md bg-orange-600/90 px-1 py-0.5 text-[9px] font-black leading-tight text-white"
        >
          {disaster.title}
        </motion.p>
      )}

      {news && (
        <motion.p
          key={news.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="line-clamp-3 w-full rounded-md bg-white/90 px-1 py-0.5 text-[9px] font-bold leading-tight text-zinc-900"
        >
          {news.title}
        </motion.p>
      )}

      <p className="text-[8px] font-black tabular-nums text-amber-300">
        {id.hud.panicMeter} {panic}/{panicMax}
      </p>
    </div>
  );
}
