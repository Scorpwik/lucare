"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { LcButton } from "@/components/lucare/lc-button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <LcButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label={isDark ? "Modo claro" : "Modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="hidden sm:inline">{isDark ? "Claro" : "Oscuro"}</span>
    </LcButton>
  );
}