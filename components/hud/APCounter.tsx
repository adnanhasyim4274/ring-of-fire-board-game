"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { ART } from "@/data/artManifest";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";

/** Sisa Action Point pemain aktif — dibaca sebagai pip, bukan cuma angka. */
export function APCounter({
  ap,
  max = 4,
  className,
}: {
  ap: number;
  max?: number;
  className?: string;
}) {
  const slots = Math.max(max, ap);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1",
        className
      )}
      aria-label={`${ap} ${id.hud.apFull}`}
    >
      {/* Action Point tokens from the printed game. Decorative: the count is
          spelled out in the label right next to them. Each token has a fixed
          12px box, so the pill never reflows while the art loads. */}
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: slots }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: i < ap ? 1 : 0.72, opacity: i < ap ? 1 : 0.35 }}
            className="block h-3 w-3"
          >
            <Image
              src={ART.token.action_point}
              alt=""
              width={12}
              height={12}
              className={cn("h-3 w-3", i < ap ? "" : "saturate-0")}
            />
          </motion.span>
        ))}
      </span>
      <span className="text-sm font-black tabular-nums text-amber-900">
        {ap} {id.hud.ap}
      </span>
    </span>
  );
}
