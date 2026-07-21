"use client";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import type { VillagerToken as VillagerTokenType } from "@/engine/types";

/** A small villager dot — color + shape encode status (not color alone). */
export function VillagerToken({ villager }: { villager: VillagerTokenType }) {
  const panicked = villager.status === "panic";
  return (
    <span
      title={panicked ? en.board.panicked : en.board.calm}
      aria-label={panicked ? en.board.panicked : en.board.calm}
      className={cn(
        "inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[8px] font-black leading-none",
        panicked
          ? "panic-pulse border-red-700 bg-red-500 text-white"
          : "border-emerald-700 bg-white text-emerald-700"
      )}
    >
      {panicked ? "!" : "•"}
    </span>
  );
}
