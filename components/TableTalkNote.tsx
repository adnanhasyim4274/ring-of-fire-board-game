"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, MessagesSquare, X } from "lucide-react";
import { en as id } from "@/lib/i18n/en";

/**
 * Pengingat Table Talk Protocol (MASTER-SPEC §1 Q1).
 * Ringkas secara default supaya tidak makan layar di Fase 3/4, tapi bisa
 * dibuka penuh kalau ada yang bertanya "boleh nggak sih ngasih lihat kartu?".
 */
export function TableTalkNote({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-violet-200 bg-violet-50">
      <button
        type="button"
        className="flex min-h-11 w-full items-start gap-2 px-2.5 py-2 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <MessagesSquare className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-black uppercase tracking-wide text-violet-700">
            {id.tableTalk.title}
          </span>
          <span className="block text-[11px] font-bold leading-snug text-violet-950">
            {id.tableTalk.compact}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-violet-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="@container space-y-2 border-t border-violet-200 px-2.5 py-2">
              <p className="text-[11px] font-bold italic text-violet-800">
                {id.tableTalk.lead}
              </p>
              <div className="grid gap-2 @sm:grid-cols-2">
                <ul className="space-y-1">
                  <li className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                    {id.tableTalk.allowed}
                  </li>
                  {id.tableTalk.allowedItems.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1">
                  <li className="text-[10px] font-black uppercase tracking-wide text-red-700">
                    {id.tableTalk.forbidden}
                  </li>
                  {id.tableTalk.forbiddenItems.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <X className="mt-0.5 h-3 w-3 shrink-0 text-red-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="rounded-lg bg-white/70 p-2 text-[11px] leading-snug text-violet-900">
                {id.tableTalk.why}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
