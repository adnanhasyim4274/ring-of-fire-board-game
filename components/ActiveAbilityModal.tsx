"use client";
import { useState } from "react";
import { Zap } from "lucide-react";
import type { EvidenceCategory, GameAction, GameState, Player, Role } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

/**
 * Kemampuan Aktif peran (0 AP, 1x per ronde). Tiap peran butuh parameter
 * berbeda, jadi formulirnya dipilih berdasarkan `role.activeKey`.
 */
export function ActiveAbilityModal({
  state,
  player,
  role,
  dispatch,
  onClose,
}: {
  state: GameState;
  player: Player;
  role: Role;
  dispatch: (a: GameAction) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [lock, setLock] = useState<EvidenceCategory | "">("");

  const fire = (extra: Partial<Extract<GameAction, { type: "USE_ACTIVE_ABILITY" }>>) => {
    dispatch({ type: "USE_ACTIVE_ABILITY", playerId: player.id, ...extra });
    onClose();
  };

  const openLocks = (state.activeNews?.locks ?? []).filter(
    (l) => !state.locksOpened.includes(l)
  );
  const others = state.players.filter((p) => p.id !== player.id);

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-lg font-black">
          <Zap className="h-5 w-5 shrink-0 text-violet-600" />
          {role.activeName}
        </h3>
        <p className="text-sm leading-snug text-zinc-600">{role.active}</p>

        {/* Elang — intip dek Bencana atau dek Berita */}
        {role.activeKey === "recon" && (
          <div className="grid gap-2 sm:grid-cols-2">
            <Button onClick={() => fire({ deck: "disaster" })}>{id.peek.disaster}</Button>
            <Button variant="secondary" onClick={() => fire({ deck: "news" })}>
              {id.peek.news}
            </Button>
          </div>
        )}

        {/* Orangutan — buang 2 Evidence untuk membuka 1 gembok apa pun */}
        {role.activeKey === "data_mining" && (
          <div className="space-y-2">
            <ul className="space-y-1">
              {player.hand.map((cid, i) => {
                const card = evidenceCardById[cid];
                const key = `${cid}-${i}`;
                const on = picked.includes(key);
                return (
                  <li key={key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setPicked((prev) =>
                          on ? prev.filter((k) => k !== key) : [...prev, key].slice(-2)
                        )
                      }
                      className={cn(
                        "min-h-11 w-full rounded-xl border-2 px-2.5 py-1.5 text-left text-sm font-bold",
                        on ? "border-violet-600 bg-violet-50" : "border-zinc-200"
                      )}
                    >
                      {card
                        ? `${EVIDENCE_CATEGORY_ICON[card.category]} ${card.category} · ${card.title}`
                        : cid}
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="text-xs font-black text-zinc-500">{id.evidence.pickLock}</p>
            <div className="flex gap-2">
              {openLocks.map((l) => (
                <Button
                  key={l}
                  variant={lock === l ? "primary" : "secondary"}
                  className="flex-1 text-sm"
                  onClick={() => setLock(l)}
                >
                  {EVIDENCE_CATEGORY_ICON[l]} {l}
                </Button>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={picked.length !== 2 || lock === ""}
              onClick={() =>
                fire({
                  evidenceIds: picked.map((k) => k.slice(0, k.lastIndexOf("-"))),
                  lock: lock === "" ? undefined : lock,
                })
              }
            >
              {id.role.use}
            </Button>
          </div>
        )}

        {/* Monyet — lihat tangan 1 pemain lalu tukar 1 kartu */}
        {role.activeKey === "network_sync" && (
          <div className="grid gap-2">
            {others.map((p) => (
              <Button key={p.id} variant="secondary" onClick={() => fire({ targetPlayerId: p.id })}>
                {p.name}
              </Button>
            ))}
          </div>
        )}

        {/* Harimau & Komodo — tanpa parameter */}
        {(role.activeKey === "tactical_escort" || role.activeKey === "suppress") && (
          <Button className="w-full" onClick={() => fire({})}>
            {id.role.use}
          </Button>
        )}

        <Button variant="ghost" className="w-full" onClick={onClose}>
          {id.common.cancel}
        </Button>
      </div>
    </Modal>
  );
}
