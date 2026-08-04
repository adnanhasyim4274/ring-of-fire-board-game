"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { id } from "@/lib/i18n/id";

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
      <span className="flex gap-0.5" aria-hidden>
        {Array.from({ length: slots }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: i < ap ? 1 : 0.72, opacity: i < ap ? 1 : 0.35 }}
            className={cn(
              "block h-2.5 w-2.5 rounded-full",
              i < ap ? "bg-amber-500" : "bg-amber-900/25"
            )}
          />
        ))}
      </span>
      <span className="text-sm font-black tabular-nums text-amber-900">
        {ap} {id.hud.ap}
      </span>
    </span>
  );
}
