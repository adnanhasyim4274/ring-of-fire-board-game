"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Zap } from "lucide-react";
import type { Player, Role } from "@/engine/types";
import { ART } from "@/data/artManifest";
import { Button } from "@/components/ui/Button";
import { en as id } from "@/lib/i18n/en";

/**
 * Pass-the-device screen. On one shared phone it was never obvious whose turn
 * it was, and hands are hidden, so the previous player could read the next
 * player's cards simply by not looking away.
 *
 * It opens on the back of the role card, the way the physical game deals it
 * face down, and turns over when the right person taps. The front is the same
 * printed card that ships in the box, so a player who learns the layout here
 * already knows it at the table.
 */
export function TurnSplash({
  open,
  player,
  role,
  onDismiss,
}: {
  open: boolean;
  player: Player | null;
  role: Role | null;
  onDismiss: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  // Reset between turns without an effect, matching the play page's pattern.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setFlipped(false);
  }

  const front = role ? ART.roleCard[role.id] : undefined;

  return (
    <AnimatePresence>
      {open && player && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-stone-900 via-stone-900 to-orange-950 p-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.p
            className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-400"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {id.turnSplash.pass}
          </motion.p>

          <motion.p
            className="text-2xl font-black leading-tight text-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {player.name}
          </motion.p>

          {/* the card itself: back until the holder turns it over */}
          <motion.button
            type="button"
            onClick={() => setFlipped((v) => !v)}
            aria-label={flipped ? id.turnSplash.yourRole : id.turnSplash.flipHint}
            className="relative w-[58vw] max-w-[260px] cursor-pointer"
            style={{ perspective: 1200, aspectRatio: "2 / 3" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.12 }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
            >
              <span
                className="absolute inset-0 overflow-hidden rounded-2xl bg-stone-800 shadow-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ART.roleCard.back}
                  alt=""
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </span>
              <span
                className="absolute inset-0 overflow-hidden rounded-2xl bg-stone-800 shadow-2xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {front && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={front}
                    alt={role ? `${role.name}, ${role.title}` : ""}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                )}
              </span>
            </motion.div>
          </motion.button>

          <motion.div
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={15} className="text-orange-400" />
            {player.ap} {id.turnSplash.ap}
            {role && <span className="text-orange-300">{role.title}</span>}
          </motion.div>

          <p className="flex max-w-xs items-center gap-2 text-[11px] leading-relaxed text-stone-400">
            <EyeOff size={13} className="shrink-0" />
            {id.turnSplash.hiddenHand}
          </p>

          {flipped ? (
            <Button onClick={onDismiss} className="min-w-[200px]">
              {id.turnSplash.start}
            </Button>
          ) : (
            <motion.p
              className="text-xs font-bold text-stone-500"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              {id.turnSplash.flipHint}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
