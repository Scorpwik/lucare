"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { LcButton } from "@/components/lucare/lc-button";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    // Defer until after hydration so resolvedTheme matches SSR placeholder.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- next-themes mount gate
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <LcButton
      type="button"
      variant="ghost"
      size="sm"
      aria-label={mounted ? (isDark ? "Modo claro" : "Modo oscuro") : "Cambiar tema"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      suppressHydrationWarning
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="hidden sm:inline" suppressHydrationWarning>
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </LcButton>
  );
}