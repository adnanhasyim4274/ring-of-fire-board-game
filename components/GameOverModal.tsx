"use client";
import { useRouter } from "next/navigation";
import { PartyPopper, Skull } from "lucide-react";
import type { GameAction, GameState } from "@/engine/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en } from "@/lib/i18n/en";

export function GameOverModal({
  state,
  dispatch,
}: {
  state: GameState;
  dispatch: (a: GameAction) => void;
}) {
  const router = useRouter();
  if (state.phase !== "game_over" || !state.gameOverReason) return null;
  const won = state.gameOverReason === "win";
  const stats = [
    [en.gameOver.stats.rounds, state.round],
    [en.gameOver.stats.evacuated, state.evacuees.length],
    [en.gameOver.stats.lost, state.casualties.length],
    [en.gameOver.stats.hoaxes, state.stats.hoaxesDebunked],
    [en.gameOver.stats.facts, state.stats.factsValidated],
    [en.gameOver.stats.ignored, state.stats.eventsIgnored],
  ] as const;
  return (
    <Modal open dismissable={false}>
      <div className="space-y-4 text-center">
        {won ? (
          <PartyPopper className="mx-auto h-14 w-14 text-emerald-500" />
        ) : (
          <Skull className="mx-auto h-14 w-14 text-zinc-500" />
        )}
        <h2 className="text-2xl font-black">{won ? en.gameOver.winTitle : en.gameOver.loseTitle}</h2>
        <p className="text-sm text-zinc-600">{en.gameOver.reasons[state.gameOverReason]}</p>
        <section className="rounded-xl bg-zinc-100 p-3 text-left">
          <h3 className="mb-2 text-center text-xs font-black uppercase text-zinc-500">
            {en.gameOver.stats.title}
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {stats.map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-zinc-600">{label}</dt>
                <dd className="font-black tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              dispatch({ type: "RESET_GAME" });
              router.push("/setup");
            }}
          >
            {en.gameOver.playAgain}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch({ type: "RESET_GAME" });
              router.push("/");
            }}
          >
            {en.gameOver.backHome}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
