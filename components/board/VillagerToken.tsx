"use client";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import type { VillagerToken as VillagerTokenType } from "@/engine/types";

/**
 * Token Warga untuk panel HTML.
 * Status dibedakan tiga cara sekaligus — bentuk, warna, dan ikon —
 * supaya tetap terbaca tanpa persepsi warna.
 *   Tenang 🙂 : lingkaran putih bertepi hijau
 *   Panik  😨 : belah ketupat merah
 */
export function VillagerToken({
  villager,
  size = "md",
}: {
  villager: VillagerTokenType;
  size?: "sm" | "md";
}) {
  const panicked = villager.status === "panicked";
  const label = panicked ? id.board.panicked : id.board.calm;
  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center border-2 font-black leading-none",
        size === "sm" ? "h-4 w-4 text-[8px]" : "h-5 w-5 text-[10px]",
        panicked
          ? "rotate-45 rounded-[3px] border-red-800 bg-red-500 text-white"
          : "rounded-full border-emerald-700 bg-white text-emerald-800"
      )}
    >
      <span className={panicked ? "-rotate-45" : undefined}>{panicked ? "!" : "•"}</span>
    </span>
  );
}

/** Ringkasan "3 tenang / 1 panik" untuk daftar ubin. */
export function VillagerTally({
  villagers,
  className,
}: {
  villagers: VillagerTokenType[];
  className?: string;
}) {
  const calm = villagers.filter((v) => v.status === "calm").length;
  const panicked = villagers.filter((v) => v.status === "panicked").length;
  if (calm + panicked === 0) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-bold", className)}>
      {calm > 0 && (
        <span className="inline-flex items-center gap-1 text-emerald-800">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-emerald-700 bg-white" />
          {calm} {id.board.calm.toLowerCase()}
        </span>
      )}
      {panicked > 0 && (
        <span className="inline-flex items-center gap-1 text-red-700">
          <span className="inline-block h-3 w-3 rotate-45 rounded-[2px] border-2 border-red-800 bg-red-500" />
          {panicked} {id.board.panicked.toLowerCase()}
        </span>
      )}
    </span>
  );
}
