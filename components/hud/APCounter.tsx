"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ART } from "@/data/artManifest";
import { ChangeFlash, useValueFlash } from "@/components/ActionFeedback";
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
  // Playtesters could not tell an action had been paid for. Spending AP now
  // haloes this pill and pops the figure, so the cost is visible where it lives.
  const { pulseKey, direction } = useValueFlash(ap);
  const reduced = useReducedMotion() === true;

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1",
        className
      )}
      aria-label={`${ap} ${id.hud.apFull}`}
    >
      <ChangeFlash
        key={`flash-${pulseKey}`}
        pulseKey={pulseKey}
        shape="pill"
        tone={direction === "down" ? "warn" : "good"}
      />
      {/* Action Point tokens from the printed game. Decorative: the count is
          spelled out in the label right next to them. Each token has a fixed
          12px box, so the pill never reflows while the art loads. */}
      <span className="relative flex gap-0.5" aria-hidden>
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
      {/* Keyed on the change counter so the figure re-mounts and pops. The text
          and the label around it are untouched. */}
      <motion.span
        key={`ap-${pulseKey}`}
        initial={pulseKey === 0 || reduced ? false : { scale: 1.35 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 520, damping: 18 }}
        className="relative text-sm font-black tabular-nums text-amber-900"
      >
        {ap} {id.hud.ap}
      </motion.span>
    </span>
  );
}
