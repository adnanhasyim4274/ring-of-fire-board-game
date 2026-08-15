"use client";
import { Ship, Footprints, HandHelping, Lock, MapPin, Wind } from "lucide-react";
import type { GameState, Player, Scenario, TileState, VillagerToken as Villager } from "@/engine/types";
import type { MoveOption } from "@/lib/engineBridge";
import { Button } from "@/components/ui/Button";
import { VillagerToken } from "@/components/board/VillagerToken";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { SECTOR_COLOR } from "@/lib/theme";

/**
 * Panel rinci ubin terpilih. Ini juga jalur akses cadangan: semua aksi di ubin
 * bisa dijalankan dari sini dengan tombol berukuran penuh, tanpa harus mengetuk
 * heksagon kecil di papan.
 */
export function TileInspector({
  state,
  scenario,
  tile,
  current,
  move,
  calmCost,
  escortCost,
  canAct,
  escortSelection,
  onMove,
  onCalm,
  onToggleEscort,
}: {
  state: GameState;
  scenario: Scenario;
  tile: TileState;
  current: Player;
  move: MoveOption | null;
  calmCost: number;
  escortCost: number;
  canAct: boolean;
  escortSelection: string[];
  onMove: (m: MoveOption) => void;
  onCalm: (villager: Villager) => void;
  onToggleEscort: (villager: Villager) => void;
}) {
  const sectorName =
    scenario.sectors.find((s) => s.id === tile.sectorId)?.name ??
    (tile.isReadyPost ? id.board.posSiaga : "");
  const here = tile.index === current.position;
  const hancur = tile.damage === 2;

  return (
    <section className="space-y-2 rounded-2xl border-2 border-zinc-200 bg-white p-2.5">
      <header className="flex items-start gap-2">
        <span
          className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded"
          style={{
            backgroundColor: tile.sectorId ? SECTOR_COLOR[tile.sectorId] : "#2B2F38",
          }}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-sm font-black leading-tight">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">
              {scenario.regionNames[tile.index] ?? `#${tile.index}`}
            </span>
          </span>
          <span className="block text-[11px] font-bold text-zinc-500">
            #{tile.index} · {sectorName}
          </span>
        </span>
        {tile.damage > 0 && (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase",
              tile.damage === 1 ? "bg-amber-200 text-amber-900" : "bg-zinc-800 text-red-300"
            )}
          >
            {id.board.damage[tile.damage]}
          </span>
        )}
      </header>

      {/* The same "You are here" wording as the board marker, so the panel and
          the hexagon are obviously talking about the same thing. */}
      {here && (
        <p className="flex items-center gap-1.5 rounded-lg border-2 border-zinc-900 bg-zinc-900 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-white">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {id.feedback.youAreHere}
        </p>
      )}

      {tile.isReadyPost && (
        <p className="rounded-lg bg-emerald-50 p-2 text-[11px] font-bold leading-snug text-emerald-800">
          {id.board.posSiagaHint}
        </p>
      )}
      {tile.damage > 0 && (
        <p className="text-[11px] font-bold text-zinc-600">
          {id.board.damageHint[tile.damage === 1 ? 1 : 2]}
        </p>
      )}
      {tile.hasCrisisToken && (
        <p className="flex items-center gap-1.5 rounded-lg bg-orange-50 p-2 text-[11px] font-bold text-lava">
          <Wind className="h-3.5 w-3.5 shrink-0" />
          {id.board.crisisToken}
        </p>
      )}
      {tile.evacuationLocked && (
        <p className="flex items-center gap-1.5 rounded-lg bg-zinc-100 p-2 text-[11px] font-bold text-zinc-700">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          {id.board.evacuationLocked}
        </p>
      )}

      {/* Pindah ke sini. The footprint was a 16px glyph nobody noticed, so it is
          now a 24px mark on a light disc — the same silhouette that pulses on
          the destination hexagon, at a size that survives a 375px screen. */}
      {move && canAct && (
        <Button
          variant={move.viaSeaLane ? "secondary" : "safe"}
          className="w-full text-sm"
          disabled={!move.affordable}
          onClick={() => onMove(move)}
        >
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/25 align-middle ring-2 ring-white/70">
            {move.viaSeaLane ? (
              <Ship className="h-5 w-5" aria-hidden />
            ) : (
              <Footprints className="h-5 w-5" aria-hidden />
            )}
          </span>
          {move.viaSeaLane ? id.actions.moveVia : id.actions.move} ({move.cost} {id.common.ap})
        </Button>
      )}
      {hancur && (
        <p className="text-[11px] font-bold text-red-600">{id.actions.tileImpassable}</p>
      )}

      {/* Warga di ubin ini */}
      {tile.occupants.length === 0 ? (
        <p className="text-[11px] text-zinc-400">{id.board.tileEmpty}</p>
      ) : (
        <ul className="space-y-1.5">
          {tile.occupants.map((v) => {
            const picked = escortSelection.includes(v.id);
            return (
              <li
                key={v.id}
                className={cn(
                  "flex items-center gap-2 rounded-xl p-1.5",
                  picked ? "bg-violet-100" : "bg-zinc-50"
                )}
              >
                <VillagerToken villager={v} />
                <span className="text-[11px] font-bold text-zinc-600">
                  {v.status === "panicked" ? id.board.panicked : id.board.calm}
                </span>
                {here && canAct && (
                  <span className="ml-auto flex gap-1.5">
                    {v.status === "panicked" ? (
                      <Button
                        className="px-2.5 text-xs"
                        disabled={current.ap < calmCost}
                        onClick={() => onCalm(v)}
                      >
                        {id.actions.calm} ({calmCost} {id.common.ap})
                      </Button>
                    ) : (
                      <Button
                        variant={picked ? "primary" : "safe"}
                        className="px-2.5 text-xs"
                        disabled={current.ap < escortCost}
                        onClick={() => onToggleEscort(v)}
                      >
                        <HandHelping className="mr-1 inline h-3.5 w-3.5" />
                        {picked ? id.common.cancel : `${id.actions.escort} (${escortCost} ${id.common.ap})`}
                      </Button>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Pemain di ubin ini. Naming which one is YOURS was the whole complaint:
          a run of names told nobody which standee on the hexagon was theirs. */}
      {state.players.some((p) => p.position === tile.index) && (
        <ul className="flex flex-wrap gap-1">
          {state.players
            .filter((p) => p.position === tile.index)
            .map((p) => (
              <li
                key={p.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[11px] font-bold",
                  p.id === current.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-500"
                )}
              >
                {p.name}
                <span className="text-[10px] font-black uppercase opacity-70">
                  {p.id === current.id ? id.feedback.yourGuardian : id.feedback.otherGuardian}
                </span>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
