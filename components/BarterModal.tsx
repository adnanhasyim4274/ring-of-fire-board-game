"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import type { EvidenceCard, GameState, Player } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { roleById } from "@/data/roles";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { id } from "@/lib/i18n/id";
import { EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

/**
 * Barter Bukti (1 AP). Hanya dengan pemain di ubin yang sama —
 * kecuali Monyet, yang pasifnya "Sinyal Repeater" membebaskan jarak.
 */
export function BarterModal({
  state,
  player,
  giveCard,
  onConfirm,
  onCancel,
}: {
  state: GameState;
  player: Player;
  giveCard: EvidenceCard;
  onConfirm: (withPlayerId: string, takeCardId: string) => void;
  onCancel: () => void;
}) {
  const [withPlayerId, setWithPlayerId] = useState("");
  const [takeCardId, setTakeCardId] = useState("");

  const anyDistance = roleById[player.roleId]?.activeKey === "network_sync";
  const partners = state.players.filter(
    (p) => p.id !== player.id && (anyDistance || p.position === player.position)
  );
  const partner = partners.find((p) => p.id === withPlayerId);

  return (
    <Modal open onClose={onCancel}>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <ArrowLeftRight className="h-5 w-5 shrink-0" />
          {id.evidence.barterTitle}
        </h3>

        <p className="rounded-xl bg-zinc-100 p-2.5 text-sm">
          <span className="block text-[10px] font-black uppercase tracking-wide text-zinc-500">
            {id.evidence.barterGive}
          </span>
          <span className="font-bold">
            {EVIDENCE_CATEGORY_ICON[giveCard.category]} {giveCard.title}
          </span>
        </p>

        {partners.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800">
            {id.evidence.barterSameTileOnly}
          </p>
        ) : (
          <>
            <label className="block text-sm font-bold">
              {id.evidence.barterWith}
              <select
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-zinc-300 bg-white p-2"
                value={withPlayerId}
                onChange={(e) => {
                  setWithPlayerId(e.target.value);
                  setTakeCardId("");
                }}
              >
                <option value="">{id.common.none}</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold">
              {id.evidence.barterTake}
              <select
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-zinc-300 bg-white p-2 disabled:opacity-50"
                value={takeCardId}
                disabled={!partner}
                onChange={(e) => setTakeCardId(e.target.value)}
              >
                <option value="">{id.common.none}</option>
                {(partner?.hand ?? []).map((cid, i) => {
                  const c = evidenceCardById[cid];
                  return (
                    <option key={`${cid}-${i}`} value={cid}>
                      {c ? `${c.category} · ${c.title}` : cid}
                    </option>
                  );
                })}
              </select>
            </label>
          </>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={!withPlayerId || !takeCardId}
            onClick={() => onConfirm(withPlayerId, takeCardId)}
          >
            {id.evidence.barterConfirm}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            {id.common.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
