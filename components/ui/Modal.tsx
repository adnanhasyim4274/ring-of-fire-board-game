"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  children,
  dismissable = true,
  size = "md",
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  dismissable?: boolean;
  /** "lg" is for briefings that need columns, such as the rules primer. */
  size?: "md" | "lg";
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissable ? onClose : undefined}
        >
          <motion.div
            className={
              "max-h-[88vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl " +
              (size === "lg" ? "max-w-3xl" : "max-w-md")
            }
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
