"use client";
import { motion } from "framer-motion";
import type { Player, Role } from "@/engine/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";
import {
  AbilityIcon,
  iconForActive,
  iconForPassive,
  iconForSubMission,
} from "@/lib/roleIcons";

/** Kartu Peran: Pasif selalu aktif, Aktif 1x per ronde, Sub-Misi pribadi. */
export function RolePanel({
  player,
  role,
  isCurrent,
  onUseActive,
}: {
  player: Player;
  role: Role;
  isCurrent: boolean;
  onUseActive?: () => void;
}) {
  const target = Math.max(1, role.subMissionTarget);
  const progress = Math.min(player.subMissionProgress, target);
  const pct = (progress / target) * 100;

  // One glyph per ability, so two Guardians never read the same at a glance.
  const iconSize = "h-3.5 w-3.5 shrink-0";

  return (
    <section
      className={cn(
        "space-y-2 rounded-2xl border-2 bg-white p-2.5",
        isCurrent ? "border-safe" : "border-zinc-200"
      )}
    >
      <header className="flex items-center gap-2">
        <span className="text-2xl leading-none">{emojiForRole(role.id)}</span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-1.5">
            <span className="truncate text-sm font-black">{player.name}</span>
            {isCurrent && (
              <span className="shrink-0 rounded-full bg-safe px-1.5 py-0.5 text-[9px] font-black uppercase text-white">
                {id.hud.onDuty}
              </span>
            )}
          </span>
          <span className="block truncate text-[11px] font-bold text-zinc-500">
            {role.name} · {role.title}
          </span>
        </span>
      </header>

      <div className="rounded-xl bg-zinc-50 p-2">
        <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-zinc-500">
          <AbilityIcon icon={iconForPassive(role.id)} className={iconSize} />
          {id.role.passive} · {role.passiveName}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-zinc-700">{role.passive}</p>
      </div>

      <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-2">
        <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
          <AbilityIcon icon={iconForActive(role.activeKey)} className={iconSize} />
          {id.role.active} · {role.activeName}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-violet-900">{role.active}</p>
        {onUseActive && (
          <Button
            variant="secondary"
            className="mt-1.5 w-full text-xs"
            disabled={!isCurrent || player.activeUsedThisRound}
            onClick={onUseActive}
          >
            {player.activeUsedThisRound
              ? id.role.activeUsed
              : `${id.role.use} · ${id.role.activeCost}`}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "rounded-xl border-2 p-2",
          player.subMissionDone
            ? "border-emerald-500 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        )}
      >
        <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-amber-800">
          <AbilityIcon icon={iconForSubMission(role.subMissionKey)} className={iconSize} />
          {id.role.subMission} · {role.subMissionName}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-amber-950">{role.subMission}</p>

        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10" aria-hidden>
            <motion.div
              className={cn(
                "h-full rounded-full",
                player.subMissionDone ? "bg-emerald-500" : "bg-amber-500"
              )}
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 26 }}
            />
          </div>
          <span
            className="text-[11px] font-black tabular-nums text-amber-900"
            aria-label={`${id.role.progress}: ${progress} ${id.common.of} ${target}`}
          >
            {player.subMissionDone ? id.role.subMissionDone : `${progress}/${target}`}
          </span>
        </div>
        <p className="mt-1 text-[10px] font-bold text-amber-700/80">
          {id.role.subMissionReward}
        </p>
      </div>
    </section>
  );
}
