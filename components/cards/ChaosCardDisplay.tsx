"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldOff, Skull } from "lucide-react";
import { chaosCardById } from "@/data/chaosCards";
import { id } from "@/lib/i18n/id";

/**
 * Kartu Chaos aktif — debuff permanen tim, ditarik setiap kali verifikasi gagal.
 * Ditampilkan sebagai tumpukan yang terus terlihat, bukan notifikasi sekali lewat:
 * kegagalan literasi harus terasa menumpuk.
 */
export function ChaosCardDisplay({ activeChaos }: { activeChaos: string[] }) {
  return (
    <section className="rounded-2xl border-2 border-zinc-800 bg-ash p-2.5 text-white">
      <h3 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest">
        <Skull className="h-4 w-4 shrink-0 text-red-400" />
        {id.chaos.title}
        <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] tabular-nums">
          {activeChaos.length} {id.chaos.count}
        </span>
      </h3>

      {activeChaos.length === 0 ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-300">
          <ShieldOff className="h-3.5 w-3.5" />
          {id.chaos.empty}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          <AnimatePresence initial={false}>
            {activeChaos.map((cid) => {
              const card = chaosCardById[cid];
              if (!card) return null;
              return (
                <motion.li
                  key={cid}
                  layout
                  initial={{ opacity: 0, x: -18, rotate: -3 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: 18 }}
                  className="rounded-xl border-l-4 border-red-500 bg-white/10 p-2"
                >
                  <p className="text-xs font-black leading-tight">{card.title}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-white/75">
                    {card.description}
                  </p>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      <p className="mt-2 text-[10px] leading-tight text-white/50">{id.chaos.subtitle}</p>
    </section>
  );
}
