"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

let clientNow: Date | null = null;
const nowListeners = new Set<() => void>();
let nowScheduled = false;

function ensureClientNow() {
  if (clientNow !== null) return;
  clientNow = new Date();
  nowScheduled = false;
  nowListeners.forEach((l) => l());
}

function subscribeClientNow(onStoreChange: () => void) {
  nowListeners.add(onStoreChange);
  if (typeof window !== "undefined" && clientNow === null && !nowScheduled) {
    nowScheduled = true;
    queueMicrotask(ensureClientNow);
  }
  return () => nowListeners.delete(onStoreChange);
}

function getClientNowSnapshot(): Date | null {
  return clientNow;
}

/** Evita `new Date()` en el prerender del Client Component. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Fecha local tras el primer paint del cliente (sin desajuste de hidratación). */
export function useClientNow(): Date | null {
  return useSyncExternalStore(
    subscribeClientNow,
    getClientNowSnapshot,
    () => null,
  );
}

let dndReady = false;
const dndListeners = new Set<() => void>();
let dndScheduled = false;

function ensureDndReady() {
  if (dndReady) return;
  dndReady = true;
  dndScheduled = false;
  dndListeners.forEach((l) => l());
}

function subscribeDndReady(onStoreChange: () => void) {
  dndListeners.add(onStoreChange);
  if (typeof window !== "undefined" && !dndReady && !dndScheduled) {
    dndScheduled = true;
    queueMicrotask(ensureDndReady);
  }
  return () => dndListeners.delete(onStoreChange);
}

/** Activa @dnd-kit solo tras hidratar (IDs de accesibilidad estables). */
export function useDndReady(): boolean {
  return useSyncExternalStore(subscribeDndReady, () => dndReady, () => false);
}