"use client";
import { motion } from "framer-motion";
import type { DisasterCard, NewsCard } from "@/engine/types";
import { en as id } from "@/lib/i18n/en";

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
  // No `h-full`/`justify-center` any more: this used to be centred inside a
  // square overlay on the ring, and now that it sits in the flow beneath the
  // board those only asked the block to fill a height nothing was giving it.
  return (
    <div className="flex w-full flex-col items-center gap-1 px-1">
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
