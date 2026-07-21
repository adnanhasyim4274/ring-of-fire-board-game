"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameAction, GameState } from "@/engine/types";
import { reduce } from "@/engine/reducer";

interface GameStore {
  state: GameState | null;
  dispatch: (action: GameAction) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      state: null,
      dispatch: (action) => {
        // Inject a real random seed at the transport boundary; the reducer
        // itself stays pure/deterministic (tests pass an explicit seed).
        if (action.type === "START_GAME" && action.seed === undefined) {
          action = { ...action, seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0 };
        }
        set({ state: reduce(get().state, action) });
      },
    }),
    { name: "ring-of-fire-game-v1" }
  )
);
