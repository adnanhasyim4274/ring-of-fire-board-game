"use client";
import { Ship, Footprints, HandHelping, Lock, MapPin, Wind } from "lucide-react";
import type { GameState, Player, Scenario, TileState, VillagerToken as Villager } from "@/engine/types";
import type { MoveOption } from "@/lib/engineBridge";
import { Button } from "@/components/ui/Button";
import { VillagerToken } from "@/components/board/VillagerToken";
import { cn } from "@/lib/utils";
import { id } from "@/lib/i18n/id";
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
    (tile.isPosSiaga ? id.board.posSiaga : "");
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

      {tile.isPosSiaga && (
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

      {/* Pindah ke sini */}
      {move && canAct && (
        <Button
          variant={move.viaSeaRoute ? "secondary" : "safe"}
          className="w-full text-sm"
          disabled={!move.affordable}
          onClick={() => onMove(move)}
        >
          {move.viaSeaRoute ? (
            <Ship className="mr-1.5 inline h-4 w-4" />
          ) : (
            <Footprints className="mr-1.5 inline h-4 w-4" />
          )}
          {move.viaSeaRoute ? id.actions.moveVia : id.actions.move} ({move.cost} {id.common.ap})
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
                  {v.status === "panik" ? id.board.panicked : id.board.calm}
                </span>
                {here && canAct && (
                  <span className="ml-auto flex gap-1.5">
                    {v.status === "panik" ? (
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

      {/* Pemain di ubin ini */}
      {state.players.some((p) => p.position === tile.index) && (
        <p className="text-[11px] font-bold text-zinc-500">
          {state.players
            .filter((p) => p.position === tile.index)
            .map((p) => p.name)
            .join(" · ")}
        </p>
      )}
    </section>
  );
}
