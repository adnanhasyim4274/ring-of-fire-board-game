"use client";
import { useState } from "react";
import { Zap } from "lucide-react";
import type { EvidenceCategory, GameAction, GameState, Player, Role } from "@/engine/types";
import { evidenceCardById } from "@/data/evidenceCards";
import { ART } from "@/data/artManifest";
import { Modal } from "@/components/ui/Modal";
import { PrintedImageOr } from "@/components/cards/PrintedCard";
import { Button } from "@/components/ui/Button";
import { isSeaLaneOpen, openWaterOptions } from "@/lib/engineBridge";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { EVIDENCE_CATEGORY_ICON } from "@/lib/theme";

/**
 * Strings for the two abilities that had no form at all until now.
 *
 * They belong in lib/i18n/en.ts with everything else and should be folded in
 * there; that file is owned by another lane, so they are collected here rather
 * than scattered inline through the JSX.
 */
const TEXT = {
  swapPickYours: "Which of your cards are you handing over?",
  swapPickTheirs: "And which of theirs are you taking?",
  swapConfirm: "Look and swap",
  swapLookOnly: "Look at their hand",
  swapEmptyHand: "That Guardian is holding nothing, so there is nothing to swap for.",
  swapBack: "Pick a different Guardian",
  deepPick: "Where is the current taking someone?",
  deepNone:
    "Nobody is within reach. Stand at either mouth of the Sea Lane with a villager on a neighbouring tile, or in the water with one on your own tile.",
  deepClosed: "The Sea Lane is closed this round, so there is no current to ride.",
  deepIntoWater: "Into the water",
  deepToSafety: "All the way to safety",
  tile: "tile",
} as const;

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
  // Network Sync is a two-step form: choose the Guardian, then see their hand
  // and choose the two cards that change places.
  const [syncTargetId, setSyncTargetId] = useState<string | null>(null);
  const [giveKey, setGiveKey] = useState<string | null>(null);
  const [takeKey, setTakeKey] = useState<string | null>(null);

  const fire = (extra: Partial<Extract<GameAction, { type: "USE_ACTIVE_ABILITY" }>>) => {
    dispatch({ type: "USE_ACTIVE_ABILITY", playerId: player.id, ...extra });
    onClose();
  };

  const openLocks = (state.activeNews?.locks ?? []).filter(
    (l) => !state.locksOpened.includes(l)
  );
  const others = state.players.filter((p) => p.id !== player.id);
  const syncTarget = others.find((p) => p.id === syncTargetId) ?? null;
  // A hand can hold two copies of one card, so the index is part of the key and
  // the id is recovered from it when the action is dispatched.
  const cardIdOf = (key: string) => key.slice(0, key.lastIndexOf("-"));
  const labelFor = (cid: string) => {
    const card = evidenceCardById[cid];
    return card
      ? `${EVIDENCE_CATEGORY_ICON[card.category]} ${card.category} · ${card.title}`
      : cid;
  };

  const deepOptions = role.activeKey === "open_water" ? openWaterOptions(state, player) : [];

  return (
    <Modal open onClose={onClose}>
      <div className="space-y-3">
        {/* The printed card, so the player can see the ability they are about
            to spend on the object they are holding. Small and beside the
            heading rather than above the form: the form is the point of this
            modal and on a 375px screen a full card would push the buttons off
            the bottom. Decorative, since the ability name and its full text are
            printed right next to it; the Zap icon stands in if the art is
            missing or fails to load. */}
        <div className="flex items-start gap-3">
          <PrintedImageOr
            src={ART.roleCard[role.id]}
            className="h-[72px] w-12 shrink-0 rounded-[4px] object-cover shadow-sm"
            fallback={<Zap className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />}
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black leading-tight">{role.activeName}</h3>
            <p className="text-[11px] font-bold text-zinc-400">
              {role.name} · {id.role.activeCost}
            </p>
            <p className="mt-1 text-sm leading-snug text-zinc-600">{role.active}</p>
          </div>
        </div>

        {/* Elang — intip dek Bencana atau dek Berita */}
        {role.activeKey === "recon" && (
          <div className="@container grid gap-2 @sm:grid-cols-2">
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
                      {labelFor(cid)}
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
                  evidenceIds: picked.map(cardIdOf),
                  lock: lock === "" ? undefined : lock,
                })
              }
            >
              {id.role.use}
            </Button>
          </div>
        )}

        {/* Kea Parrot — lihat tangan 1 pemain LALU tukar 1 kartu.
            The swap is the half the reducer was never given: firing with only a
            targetPlayerId spends the once-per-round ability on a peek and hands
            nothing over, which is not what the role card promises. */}
        {role.activeKey === "network_sync" && !syncTarget && (
          <div className="grid gap-2">
            {others.map((p) => (
              <Button key={p.id} variant="secondary" onClick={() => setSyncTargetId(p.id)}>
                {p.name}
              </Button>
            ))}
          </div>
        )}

        {role.activeKey === "network_sync" && syncTarget && (
          <div className="space-y-2">
            <p className="text-xs font-black text-zinc-500">{TEXT.swapPickYours}</p>
            <ul className="space-y-1">
              {player.hand.map((cid, i) => {
                const key = `${cid}-${i}`;
                const on = giveKey === key;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setGiveKey(on ? null : key)}
                      className={cn(
                        "min-h-11 w-full rounded-xl border-2 px-2.5 py-1.5 text-left text-sm font-bold",
                        on ? "border-violet-600 bg-violet-50" : "border-zinc-200"
                      )}
                    >
                      {labelFor(cid)}
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="text-xs font-black text-zinc-500">{TEXT.swapPickTheirs}</p>
            {syncTarget.hand.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-2.5 text-xs font-bold text-amber-800">
                {TEXT.swapEmptyHand}
              </p>
            ) : (
              <ul className="space-y-1">
                {syncTarget.hand.map((cid, i) => {
                  const key = `${cid}-${i}`;
                  const on = takeKey === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setTakeKey(on ? null : key)}
                        className={cn(
                          "min-h-11 w-full rounded-xl border-2 px-2.5 py-1.5 text-left text-sm font-bold",
                          on ? "border-violet-600 bg-violet-50" : "border-zinc-200"
                        )}
                      >
                        {labelFor(cid)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {syncTarget.hand.length === 0 ? (
              <Button
                className="w-full"
                onClick={() => fire({ targetPlayerId: syncTarget.id })}
              >
                {TEXT.swapLookOnly}
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={!giveKey || !takeKey}
                onClick={() =>
                  fire({
                    targetPlayerId: syncTarget.id,
                    evidenceIds: [cardIdOf(giveKey!), cardIdOf(takeKey!)],
                  })
                }
              >
                {TEXT.swapConfirm}
              </Button>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSyncTargetId(null);
                setGiveKey(null);
                setTakeKey(null);
              }}
            >
              {TEXT.swapBack}
            </Button>
          </div>
        )}

        {/* Whale Shark — Deep Current. The Sea Lane touches nothing but the two
            Ready Posts at its mouths, and anyone reaching a Ready Post is
            rescued on the spot, so this is the only way a villager ever gets
            into the water at all. */}
        {role.activeKey === "open_water" && (
          <div className="space-y-2">
            {deepOptions.length === 0 ? (
              <p className="rounded-xl bg-amber-50 p-2.5 text-xs font-bold leading-snug text-amber-800">
                {isSeaLaneOpen(state) ? TEXT.deepNone : TEXT.deepClosed}
              </p>
            ) : (
              <>
                <p className="text-xs font-black text-zinc-500">{TEXT.deepPick}</p>
                <ul className="space-y-1">
                  {deepOptions.map((o) => (
                    <li key={`${o.villagerId}-${o.toIndex}`}>
                      <Button
                        variant={o.rescues ? "safe" : "secondary"}
                        className="w-full text-sm"
                        onClick={() =>
                          fire({ villagerId: o.villagerId, targetTileIndex: o.toIndex })
                        }
                      >
                        {o.rescues ? TEXT.deepToSafety : TEXT.deepIntoWater} · {TEXT.tile} #
                        {o.fromIndex} → #{o.toIndex}
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
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
