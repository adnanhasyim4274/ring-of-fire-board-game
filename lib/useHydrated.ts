"use client";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** false during SSR/first paint, true once hydrated — without a setState-in-effect. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
