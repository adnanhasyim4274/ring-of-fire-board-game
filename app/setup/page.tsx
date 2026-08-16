"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { roles } from "@/data/roles";
import { scenarios } from "@/data/scenarios";
import { gameConfig } from "@/data/gameConfig";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";
import { ART } from "@/data/artManifest";
import { PrintedImageOr } from "@/components/cards/PrintedCard";
import {
  AbilityIcon,
  iconForActive,
  iconForPassive,
  iconForSubMission,
} from "@/lib/roleIcons";

interface Slot {
  name: string;
  roleId: string;
}


export default function SetupPage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const router = useRouter();

  const [scenarioId, setScenarioId] = useState<string>(gameConfig.defaultScenarioId);
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: gameConfig.minPlayers }, () => ({ name: "", roleId: "" }))
  );

  const setCount = (n: number) => {
    setSlots((prev) => {
      const next = [...prev];
      while (next.length < n) next.push({ name: "", roleId: "" });
      return next.slice(0, n);
    });
  };

  const takenRoles = slots.map((s) => s.roleId).filter(Boolean);
  const allRolesPicked = slots.every((s) => s.roleId !== "");

  const start = () => {
    dispatch({
      type: "START_GAME",
      scenarioId,
      players: slots.map((s, i) => ({
        name:
          s.name.trim() ||
          `${roles.find((r) => r.id === s.roleId)?.name ?? id.setup.playerName} ${i + 1}`,
        roleId: s.roleId,
      })),
    });
    router.push("/play");
  };

  const counts = Array.from(
    { length: gameConfig.maxPlayers - gameConfig.minPlayers + 1 },
    (_, i) => gameConfig.minPlayers + i
  );

  return (
    <main className="mx-auto w-full max-w-md flex-1 space-y-5 p-4">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label={id.common.back} className="-ml-1 rounded-lg p-3 hover:bg-black/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <Users className="h-6 w-6 text-lava" />
          {id.setup.title}
        </h1>
      </header>

      {/* Skenario */}
      {scenarios.length > 1 ? (
        <section>
          <h2 className="mb-1 text-xs font-black uppercase tracking-wide text-zinc-500">
            {id.setup.scenario}
          </h2>
          <select
            className="min-h-11 w-full rounded-xl border-2 border-zinc-300 bg-white p-3 font-bold"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </section>
      ) : (
        <p className="rounded-xl bg-white/70 p-3 text-sm font-bold text-zinc-600">
          {id.setup.scenario}: {scenarios[0]?.name}
        </p>
      )}


      {/* Jumlah pemain */}
      <section>
        <h2 className="mb-2 text-xs font-black uppercase tracking-wide text-zinc-500">
          {id.setup.playerCount}
        </h2>
        <div className="flex gap-2">
          {counts.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={slots.length === n}
              className={cn(
                "min-h-11 flex-1 rounded-xl border-2 text-lg font-black transition-colors",
                slots.length === n
                  ? "border-lava bg-lava text-white"
                  : "border-zinc-300 bg-white hover:border-zinc-400"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Slot pemain + pilih peran */}
      {slots.map((slot, i) => (
        <section key={i} className="rounded-2xl border-2 border-zinc-200 bg-white p-3">
          <label className="block text-sm font-black text-zinc-600">
            {id.setup.playerName} {i + 1}
            <input
              className="mt-1 min-h-11 w-full rounded-xl border-2 border-zinc-300 p-2.5 font-bold"
              placeholder={id.setup.namePlaceholder}
              value={slot.name}
              maxLength={20}
              onChange={(e) =>
                setSlots((prev) =>
                  prev.map((s, j) => (j === i ? { ...s, name: e.target.value } : s))
                )
              }
            />
          </label>

          <p className="mb-1 mt-2.5 text-sm font-black text-zinc-600">{id.setup.pickRole}</p>
          <div className="grid gap-1.5">
            {roles.map((role) => {
              const takenByOther = takenRoles.includes(role.id) && slot.roleId !== role.id;
              const selected = slot.roleId === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  disabled={takenByOther}
                  aria-pressed={selected}
                  onClick={() =>
                    setSlots((prev) =>
                      prev.map((s, j) => (j === i ? { ...s, roleId: role.id } : s))
                    )
                  }
                  className={cn(
                    "rounded-xl border-2 p-2 text-left transition-colors",
                    selected ? "border-safe bg-emerald-50" : "border-zinc-200 hover:border-zinc-300",
                    takenByOther && "opacity-40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {/* The printed card, so the layout is already familiar at
                        the table. It grows once the role is picked, because at
                        that point the panel underneath is the abilities and the
                        card is worth reading rather than just recognising.
                        Falls back to the emoji if the art is missing or fails
                        to load; the name, title and abilities below are the
                        real content either way. */}
                    <PrintedImageOr
                      src={ART.roleCard[role.id]}
                      className={cn(
                        "shrink-0 rounded-[3px] object-cover shadow-sm",
                        selected ? "h-[72px] w-12" : "h-11 w-[29px]"
                      )}
                      fallback={
                        <span className={selected ? "text-3xl leading-none" : "text-xl leading-none"}>
                          {emojiForRole(role.id)}
                        </span>
                      }
                    />
                    <span className="font-black">{role.name}</span>
                    <span className="text-[11px] font-bold text-zinc-400">{role.title}</span>
                    {takenByOther && (
                      <span className="ml-auto text-[10px] font-black uppercase text-red-400">
                        {id.setup.roleTaken}
                      </span>
                    )}
                  </span>

                  {selected ? (
                    <span className="mt-1.5 block space-y-1 text-[11px] leading-snug">
                      {/* Same glyphs as the in-game Role panel, learned before play. */}
                      <span className="block text-zinc-700">
                        <AbilityIcon
                          icon={iconForPassive(role.id)}
                          className="mr-1 inline h-3.5 w-3.5 text-zinc-400"
                        />
                        <b>{id.setup.rolePassive}</b> · {role.passive}
                      </span>
                      <span className="block text-violet-800">
                        <AbilityIcon
                          icon={iconForActive(role.activeKey)}
                          className="mr-1 inline h-3.5 w-3.5"
                        />
                        <b>{id.setup.roleActive}</b> · {role.active}
                      </span>
                      <span className="block text-amber-800">
                        <AbilityIcon
                          icon={iconForSubMission(role.subMissionKey)}
                          className="mr-1 inline h-3.5 w-3.5"
                        />
                        <b>{id.setup.roleSubMission}</b> · {role.subMission}
                      </span>
                    </span>
                  ) : (
                    <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">
                      {role.playstyle}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {/* Sticky rather than fixed: a fixed bar has to be paid for with a
          guessed padding on the page, and the bar's own height changes with
          the hint below the button, so the guess left a dead strip at the
          bottom. In flow it always reserves exactly its own height. */}
      <div className="sticky bottom-0 -mx-4 border-t border-black/10 bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <Button className="w-full text-lg" disabled={!allRolesPicked} onClick={start}>
            {id.setup.start}
          </Button>
          {!allRolesPicked && (
            <p className="mt-1 text-center text-xs text-zinc-500">{id.setup.needRoles}</p>
          )}
        </div>
      </div>
    </main>
  );
}
