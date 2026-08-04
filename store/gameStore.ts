"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameAction, GameState } from "@/engine/types";
import { reduce } from "@/engine/reducer";

interface GameStore {
  state: GameState | null;
  dispatch: (action: GameAction) => void;
}

/**
 * Persist key is versioned: the v2 GameState shape is not compatible with any
 * v1 save, so bumping the key discards old saves instead of rehydrating a
 * state the v2 reducer cannot read.
 */
const PERSIST_KEY = "ring-of-fire-game-v2";

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      state: null,
      dispatch: (action) => {
        // Randomness is injected at the transport boundary so the reducer
        // itself stays pure and deterministic (tests pass an explicit seed).
        if (action.type === "START_GAME" && action.seed === undefined) {
          action = { ...action, seed: (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0 };
        }
        set({ state: reduce(get().state, action) });
      },
    }),
    { name: PERSIST_KEY, version: 2 }
  )
);
