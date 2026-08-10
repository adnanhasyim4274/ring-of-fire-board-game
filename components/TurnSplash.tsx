"use client";
import { AnimatePresence, motion } from "framer-motion";
import { EyeOff, Zap } from "lucide-react";
import type { Player, Role } from "@/engine/types";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";

/**
 * Pass-the-device screen. On one shared phone it was never obvious whose turn
 * it was, and hands are hidden, so the previous player could read the next
 * player's cards simply by not looking away. This covers the board until the
 * right person is holding it.
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
  return (
    <AnimatePresence>
      {open && player && (
        <motion.button
          type="button"
          onClick={onDismiss}
          aria-label={id.turnSplash.tap}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-stone-900 via-stone-900 to-orange-950 p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.p
            className="text-xs font-black uppercase tracking-[0.2em] text-orange-400"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            {id.turnSplash.pass}
          </motion.p>

          <motion.span
            className="text-7xl leading-none"
            initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.08 }}
          >
            {role ? emojiForRole(role.id) : "🌋"}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
          >
            <p className="text-3xl font-black leading-tight text-white">{player.name}</p>
            {role && <p className="mt-1 text-sm font-bold text-orange-300">{role.name}</p>}
          </motion.div>

          <motion.div
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap size={15} className="text-orange-400" />
            {player.ap} {id.turnSplash.ap}
          </motion.div>

          <motion.p
            className="flex max-w-xs items-center gap-2 text-xs leading-relaxed text-stone-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.26 }}
          >
            <EyeOff size={14} className="shrink-0" />
            {id.turnSplash.hiddenHand}
          </motion.p>

          <motion.p
            className="text-xs font-bold text-stone-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.4, 1] }}
            transition={{ delay: 0.35, duration: 1.6, repeat: Infinity, repeatDelay: 0.4 }}
          >
            {id.turnSplash.tap}
          </motion.p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
