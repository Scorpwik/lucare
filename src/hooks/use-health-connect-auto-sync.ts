"use client";

import * as React from "react";
import {
  isHealthConnectNative,
  shouldRunAutoHealthSync,
  syncHealthConnect,
} from "@/lib/native/health-connect";

export function useHealthConnectAutoSync() {
  React.useEffect(() => {
    let cancelled = false;
    let removeAppListener: (() => void) | undefined;

    const run = async () => {
      if (cancelled) return;
      if (!(await isHealthConnectNative())) return;
      if (!shouldRunAutoHealthSync()) return;
      try {
        const result = await syncHealthConnect({ silent: true });
        if (result.error) {
          console.warn("[health-connect auto-sync]", result.error);
        }
      } catch (e) {
        console.warn("[health-connect auto-sync]", e);
      }
    };

    void run();

    void (async () => {
      if (!(await isHealthConnectNative())) return;
      const { App } = await import("@capacitor/app");
      const handle = await App.addListener("appStateChange", ({ isActive }) => {
        if (isActive) void run();
      });
      removeAppListener = () => {
        void handle.remove();
      };
    })();

    return () => {
      cancelled = true;
      removeAppListener?.();
    };
  }, []);
}