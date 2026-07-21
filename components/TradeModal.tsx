"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { EvidenceCard, GameState, Player } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en } from "@/lib/i18n/en";

/** "Logistics Assist": pick a card to give and a teammate to trade with. */
export function TradeModal({
  state,
  player,
  tradeCard,
  onConfirm,
  onCancel,
}: {
  state: GameState;
  player: Player;
  tradeCard: EvidenceCard;
  onConfirm: (tradeWithPlayerId: string, tradeGiveCardId: string) => void;
  onCancel: () => void;
}) {
  const [giveCardId, setGiveCardId] = useState<string>("");
  const [withPlayerId, setWithPlayerId] = useState<string>("");
  const others = state.players.filter((p) => p.id !== player.id);
  const giveOptions = player.hand.filter((id) => id !== tradeCard.id);

  return (
    <Modal open onClose={onCancel}>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <ArrowLeftRight className="h-5 w-5" />
          {en.verification.tradeTitle}
        </h3>
        <label className="block text-sm font-bold">
          {en.verification.tradeGive}
          <select
            className="mt-1 w-full rounded-lg border-2 border-zinc-300 p-2"
            value={giveCardId}
            onChange={(e) => setGiveCardId(e.target.value)}
          >
            <option value="">—</option>
            {giveOptions.map((id, i) => (
              <option key={`${id}-${i}`} value={id}>
                [{evidenceCardById[id].category}] {evidenceCardById[id].title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          {en.verification.tradeWith}
          <select
            className="mt-1 w-full rounded-lg border-2 border-zinc-300 p-2"
            value={withPlayerId}
            onChange={(e) => setWithPlayerId(e.target.value)}
          >
            <option value="">—</option>
            {others.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!giveCardId || !withPlayerId}
            onClick={() => onConfirm(withPlayerId, giveCardId)}
          >
            {en.verification.tradeConfirm}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {en.verification.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
