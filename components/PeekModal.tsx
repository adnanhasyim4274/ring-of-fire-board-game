"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";
import type { GameState, Scenario } from "@/engine/types";
import { newsCardById } from "@/data/newsCards";
import { disasterCardById } from "@/data/disasterCards";
import { evidenceCardById } from "@/data/evidenceCards";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DisasterCardReveal } from "@/components/cards/DisasterCardReveal";
import { NewsCardDisplay } from "@/components/cards/NewsCardDisplay";
import { en as id } from "@/lib/i18n/en";
import { EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

/** Hasil kemampuan intip (Elang: Reconnaissance, Monyet: Sinkronisasi Jaringan). */
export function PeekModal({
  state,
  scenario,
  onClose,
}: {
  state: GameState;
  scenario: Scenario;
  onClose: () => void;
}) {
  const peek = state.peek;
  const disaster = peek?.cardId ? disasterCardById[peek.cardId] : undefined;
  const news = peek?.cardId ? newsCardById[peek.cardId] : undefined;
  const target = peek?.playerId
    ? state.players.find((p) => p.id === peek.playerId)
    : undefined;

  const label =
    peek?.kind === "disaster"
      ? id.peek.disaster
      : peek?.kind === "news"
        ? id.peek.news
        : id.peek.hand;

  // Intip itu rahasia: kartu tidak pernah langsung nongol di layar. Pemegang
  // giliran harus menekan "Reveal" dulu, supaya isinya tidak keburu terbaca
  // meja saat modal terbuka.
  const [revealed, setRevealed] = useState(false);

  // Reset saat modal dibuka untuk intipan baru — pola "adjust state during
  // render", tanpa effect (lihat app/play/page.tsx).
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const peekKey = peek
    ? `${peek.kind}-${peek.cardId ?? ""}-${peek.playerId ?? ""}`
    : null;
  if (peekKey !== prevKey) {
    setPrevKey(peekKey);
    setRevealed(false);
  }

  return (
    <Modal open={!!peek} onClose={onClose}>
      {peek && !revealed && (
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 bg-stone-50 p-6 text-center">
            <Eye className="h-9 w-9 shrink-0 text-zinc-400" />
            <span className="text-[10px] font-black uppercase tracking-wide text-zinc-500">
              {label}
            </span>
            <h3 className="text-lg font-black leading-snug">{id.peek.title}</h3>
            <p className="text-sm font-bold text-zinc-600">
              Only you should see this: angle the screen away from the table
              before you tap.
            </p>
          </div>

          <Button className="w-full" onClick={() => setRevealed(true)}>
            Reveal
          </Button>
        </div>
      )}

      {peek && revealed && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="flex items-center gap-2 text-lg font-black">
            <Eye className="h-5 w-5 shrink-0" />
            {id.peek.title}
          </h3>
          <p className="text-sm font-bold text-zinc-600">{label}</p>

          {peek.kind === "disaster" && disaster && <DisasterCardReveal card={disaster} />}

          {peek.kind === "news" && news && (
            <NewsCardDisplay
              card={news}
              locksOpened={[]}
              revealed={false}
              sectorName={
                scenario.sectors.find((s) => s.id === news.targetSectorId)?.name
              }
            />
          )}

          {peek.kind === "hand" && target && (
            <ul className="space-y-1.5">
              <li className="text-sm font-black">{target.name}</li>
              {target.hand.map((cid, i) => {
                const card = evidenceCardById[cid];
                return (
                  <li
                    key={`${cid}-${i}`}
                    className="rounded-lg border-2 border-zinc-200 p-2 text-sm font-bold"
                  >
                    {card
                      ? `${EVIDENCE_CATEGORY_ICON[card.category]} ${card.category} · ${card.title}`
                      : cid}
                  </li>
                );
              })}
            </ul>
          )}

          <Button className="w-full" onClick={onClose}>
            {id.peek.close}
          </Button>
        </motion.div>
      )}
    </Modal>
  );
}
