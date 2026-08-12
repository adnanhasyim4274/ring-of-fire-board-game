"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ART } from "@/data/artManifest";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/**
 * Jalur Poin Reputasi (0..max). Mata uang tim: didapat dari verifikasi yang
 * lengkap dan Sub-Misi, dibelanjakan jadi Kartu Reward di Fase 5.
 */
export function ReputationTrack({
  value,
  max,
  affordable,
}: {
  value: number;
  max: number;
  /** Ada Kartu Reward yang sudah terjangkau — pantas ditandai. */
  affordable?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1"
      aria-label={`${id.hud.reputation}: ${value} ${id.common.of} ${max}`}
    >
      <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide">
        {/* The printed Reputation Point token. Decorative — the label and the
            value sit beside it. Desaturated while nothing is affordable yet,
            which is the same cue the greyed-out icon used to carry. */}
        <Image
          src={ART.token.reputation_point}
          alt=""
          width={16}
          height={16}
          className={cn("h-4 w-4 shrink-0", affordable ? "" : "opacity-50 saturate-0")}
        />
        <span className="text-zinc-600">{id.hud.reputation}</span>
        <span className="ml-auto text-sm tabular-nums text-zinc-800">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-[3px] border border-black/10 bg-[#efece7]" aria-hidden>
        <motion.div
          className="h-full bg-gradient-to-r from-amber-300 via-rep to-amber-700"
          initial={false}
          animate={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24 }}
        />
      </div>
      {affordable && (
        <p className="text-[10px] font-bold leading-tight text-rep">{id.hud.reputationHint}</p>
      )}
    </div>
  );
}
