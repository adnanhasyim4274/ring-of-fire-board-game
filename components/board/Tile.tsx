"use client";
import { Building2, Flag, Mountain, Trees, Waves, X, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import type { Player, TileState } from "@/engine/types";
import { VillagerToken } from "./VillagerToken";
import { roleEmoji } from "@/lib/roleEmoji";

const tileStyles: Record<string, string> = {
  coast: "bg-sky-200 border-sky-500",
  slope: "bg-orange-200 border-orange-500",
  forest_slope: "bg-green-200 border-green-600",
  city_center: "bg-stone-200 border-stone-500",
  fault_zone: "bg-rose-200 border-rose-500",
  safe_zone: "bg-emerald-200 border-emerald-600",
};

const tileIcons: Record<string, React.ReactNode> = {
  coast: <Waves className="h-3.5 w-3.5 text-sky-700" />,
  slope: <Mountain className="h-3.5 w-3.5 text-orange-700" />,
  forest_slope: <Trees className="h-3.5 w-3.5 text-green-700" />,
  city_center: <Building2 className="h-3.5 w-3.5 text-stone-600" />,
  fault_zone: <Zap className="h-3.5 w-3.5 text-rose-600" />,
  safe_zone: <Flag className="h-3.5 w-3.5 text-emerald-700" />,
};

export function Tile({
  tile,
  regionName,
  players,
  isSelected,
  isEventTarget,
  isMoveTarget,
  onClick,
}: {
  tile: TileState;
  regionName?: string | null;
  players: Player[];
  isSelected?: boolean;
  isEventTarget?: boolean;
  isMoveTarget?: boolean;
  onClick?: () => void;
}) {
  // The Pacific — pure board decoration, never interactive.
  if (tile.typeId === "ocean") {
    return (
      <div
        aria-hidden
        className="flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-blue-800/70 to-blue-950/70"
      >
        <Waves className="h-3 w-3 text-blue-400/40" />
      </div>
    );
  }

  const destroyed = tile.status === "destroyed";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      animate={destroyed ? { rotate: [0, -2, 2, 0] } : {}}
      aria-label={`${regionName ?? `Tile ${tile.index + 1}`}${destroyed ? ` (${en.board.destroyed})` : ""}`}
      className={cn(
        "relative flex aspect-square min-h-11 min-w-11 flex-col items-center justify-between rounded-lg border-2 p-0.5 transition-shadow",
        destroyed ? "border-zinc-800 bg-zinc-700" : tileStyles[tile.typeId] ?? "bg-zinc-100 border-zinc-300",
        isSelected && "ring-4 ring-violet-400 ring-offset-1 ring-offset-blue-950",
        isEventTarget && !isSelected && "ring-4 ring-red-500 ring-offset-1 ring-offset-blue-950",
        isMoveTarget && !isSelected && "ring-4 ring-emerald-400 ring-offset-1 ring-offset-blue-950"
      )}
    >
      <span className="flex w-full items-start justify-between gap-0.5 px-0.5">
        <span
          className={cn(
            "min-w-0 truncate text-left text-[7px] font-black uppercase leading-tight tracking-tight",
            destroyed ? "text-zinc-400" : "text-zinc-700/80"
          )}
        >
          {regionName ?? ""}
        </span>
        {destroyed ? (
          <X className="h-3.5 w-3.5 shrink-0 text-red-400" />
        ) : (
          <span className="shrink-0">{tileIcons[tile.typeId]}</span>
        )}
      </span>
      {destroyed ? (
        <span className="text-[8px] font-bold text-zinc-300">{en.board.destroyed}</span>
      ) : (
        <span className="flex max-w-full flex-wrap items-center justify-center gap-0.5">
          {tile.occupants.map((v) => (
            <VillagerToken key={v.id} villager={v} />
          ))}
        </span>
      )}
      <span className="flex min-h-3.5 items-center gap-0.5">
        {tile.hasCrisisToken && !destroyed && (
          <span className="panic-pulse rounded-full bg-red-600 px-1 text-[8px] font-black text-white">
            !
          </span>
        )}
        {players.map((p) => (
          <span key={p.id} title={p.name} className="text-[11px] leading-none drop-shadow">
            {roleEmoji[p.roleId] ?? "🐾"}
          </span>
        ))}
      </span>
    </motion.button>
  );
}
