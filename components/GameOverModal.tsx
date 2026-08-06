"use client";
import { useRouter } from "next/navigation";
import { GraduationCap, PartyPopper, Skull } from "lucide-react";
import type { GameAction, GameState } from "@/engine/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { en as id } from "@/lib/i18n/en";

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
  const stats: [string, number][] = [
    [id.gameOver.stats.rounds, state.round],
    [id.gameOver.stats.evacuated, state.evacuees.length],
    [id.gameOver.stats.lost, state.casualties.length],
    [id.gameOver.stats.reputation, state.reputation],
    [id.gameOver.stats.verified, state.stats.verified],
    [id.gameOver.stats.luckyGuess, state.stats.luckyGuess],
    [id.gameOver.stats.rumourSpreads, state.stats.rumourSpreads],
    [id.gameOver.stats.hoaxDebunked, state.stats.hoaxDebunked],
    [id.gameOver.stats.factsValidated, state.stats.factsValidated],
    [id.gameOver.stats.subMissions, state.stats.subMissionsDone],
  ];

  return (
    <Modal open dismissable={false}>
      <div className="space-y-4 text-center">
        {won ? (
          <PartyPopper className="mx-auto h-14 w-14 text-emerald-500" />
        ) : (
          <Skull className="mx-auto h-14 w-14 text-zinc-500" />
        )}
        <h2 className="text-2xl font-black">
          {won ? id.gameOver.winTitle : id.gameOver.loseTitle}
        </h2>
        <p className="text-sm leading-snug text-zinc-600">
          {id.gameOver.reasons[state.gameOverReason]}
        </p>

        <section className="rounded-xl bg-zinc-100 p-3 text-left">
          <h3 className="mb-2 text-center text-[10px] font-black uppercase tracking-wide text-zinc-500">
            {id.gameOver.stats.title}
          </h3>
          <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            {stats.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2">
                <dt className="truncate text-zinc-600">{label}</dt>
                <dd className="font-black tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {state.stats.luckyGuess > 0 && (
          <p className="flex items-start gap-2 rounded-xl border-2 border-amber-400 bg-amber-50 p-2.5 text-left text-xs font-bold leading-snug text-amber-900">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0" />
            {id.gameOver.literacyNote}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <Button
            onClick={() => {
              dispatch({ type: "RESET_GAME" });
              router.push("/setup");
            }}
          >
            {id.gameOver.playAgain}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              dispatch({ type: "RESET_GAME" });
              router.push("/");
            }}
          >
            {id.gameOver.backHome}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
