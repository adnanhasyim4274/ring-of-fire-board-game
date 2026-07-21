"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { useGameStore } from "@/store/gameStore";
import { roles } from "@/data/roles";
import { scenarios } from "@/data/scenarios";
import { gameConfig } from "@/data/gameConfig";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import { roleEmoji } from "@/lib/roleEmoji";

interface Slot {
  name: string;
  roleId: string;
}

export default function SetupPage() {
  const dispatch = useGameStore((s) => s.dispatch);
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState<string>(gameConfig.defaultScenarioId);
  const [slots, setSlots] = useState<Slot[]>([
    { name: "", roleId: "" },
    { name: "", roleId: "" },
  ]);

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
        name: s.name.trim() || `${roles.find((r) => r.id === s.roleId)?.name ?? "Guardian"} ${i + 1}`,
        roleId: s.roleId,
      })),
    });
    router.push("/play");
  };

  return (
    <main className="mx-auto w-full max-w-md flex-1 space-y-5 p-4 pb-24">
      <header className="flex items-center gap-2">
        <Link href="/" aria-label="Back" className="rounded-lg p-2 hover:bg-zinc-900/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-black">
          <Users className="h-6 w-6 text-lava" />
          {en.setup.title}
        </h1>
      </header>

      {scenarios.length > 1 && (
        <section>
          <h2 className="mb-1 text-sm font-black uppercase text-zinc-500">{en.setup.scenario}</h2>
          <select
            className="w-full rounded-xl border-2 border-zinc-300 bg-white p-3 font-bold"
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
      )}
      {scenarios.length === 1 && (
        <p className="rounded-xl bg-white/70 p-3 text-sm font-bold text-zinc-600">
          {en.setup.scenario}: {scenarios[0].name}
        </p>
      )}

      <section>
        <h2 className="mb-2 text-sm font-black uppercase text-zinc-500">{en.setup.playerCount}</h2>
        <div className="flex gap-2">
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
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

      {slots.map((slot, i) => (
        <section key={i} className="rounded-2xl border-2 border-zinc-200 bg-white p-3">
          <label className="block text-sm font-black text-zinc-600">
            {en.setup.playerName} {i + 1}
            <input
              className="mt-1 w-full rounded-xl border-2 border-zinc-300 p-2.5 font-bold"
              placeholder={en.setup.namePlaceholder}
              value={slot.name}
              maxLength={20}
              onChange={(e) =>
                setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, name: e.target.value } : s)))
              }
            />
          </label>
          <p className="mb-1 mt-2 text-sm font-black text-zinc-600">{en.setup.pickRole}</p>
          <div className="grid grid-cols-1 gap-1.5">
            {roles.map((role) => {
              const takenByOther = takenRoles.includes(role.id) && slot.roleId !== role.id;
              const selected = slot.roleId === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  disabled={takenByOther}
                  onClick={() =>
                    setSlots((prev) => prev.map((s, j) => (j === i ? { ...s, roleId: role.id } : s)))
                  }
                  className={cn(
                    "min-h-11 rounded-xl border-2 p-2 text-left transition-colors",
                    selected ? "border-safe bg-emerald-50" : "border-zinc-200 hover:border-zinc-300",
                    takenByOther && "opacity-40"
                  )}
                >
                  <span className="flex items-center gap-2 font-black">
                    <span className="text-xl">{roleEmoji[role.id]}</span>
                    {role.name}
                    <span className="text-xs font-bold text-zinc-400">{role.nickname}</span>
                    {takenByOther && (
                      <span className="ml-auto text-[10px] font-bold uppercase text-red-400">
                        {en.setup.roleTaken}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{role.ability}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 bg-background/95 p-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <Button className="w-full text-lg" disabled={!allRolesPicked} onClick={start}>
            {en.setup.start}
          </Button>
          {!allRolesPicked && (
            <p className="mt-1 text-center text-xs text-zinc-500">{en.setup.needRoles}</p>
          )}
        </div>
      </div>
    </main>
  );
}
