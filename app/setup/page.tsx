"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Target, Users, Zap } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { roles } from "@/data/roles";
import { scenarios } from "@/data/scenarios";
import { gameConfig } from "@/data/gameConfig";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en as id } from "@/lib/i18n/en";
import { emojiForRole } from "@/lib/roleEmoji";

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
    <main className="mx-auto w-full max-w-md flex-1 space-y-5 p-4 pb-28">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label={id.common.back} className="rounded-lg p-2 hover:bg-black/5">
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
                    <span className="text-xl leading-none">{emojiForRole(role.id)}</span>
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
                      <span className="block text-zinc-700">
                        <Sparkles className="mr-1 inline h-3 w-3 text-zinc-400" />
                        <b>{id.setup.rolePassive}</b> · {role.passive}
                      </span>
                      <span className="block text-violet-800">
                        <Zap className="mr-1 inline h-3 w-3" />
                        <b>{id.setup.roleActive}</b> · {role.active}
                      </span>
                      <span className="block text-amber-800">
                        <Target className="mr-1 inline h-3 w-3" />
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

      <div className="fixed inset-x-0 bottom-0 border-t border-black/10 bg-background/95 p-3 backdrop-blur">
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
