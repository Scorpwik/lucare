"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Evita `new Date()` en el prerender del Client Component. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

let cachedDate: Date | null = null;

export function useClientNow(): Date | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!cachedDate) {
        cachedDate = new Date();
      }
      return cachedDate;
    },
    () => null,
  );
}
