"use client";

import { DesktopSidebar } from "./desktop-sidebar";
import { MobileTabBar } from "./mobile-tab-bar";
import { MobileFab } from "./mobile-fab";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col lg:flex-row">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-2 z-20 mx-3 sm:mx-4 lg:mx-5 xl:mx-6 mt-2 lg:mt-3 flex items-center justify-between gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-[var(--pill)] border border-border bg-glass lc-elev-3 backdrop-blur-[var(--blur-strong)] shadow-[var(--shadow-3)] max-w-[110rem] lg:w-[calc(100%-var(--gutter)*2)] lg:mx-auto">
          <span className="lg:hidden font-dot font-black text-lg lc-card-title">LuCare</span>
          <span className="hidden lg:block silk text-[11px]">panel activo</span>
          <ThemeToggle />
        </header>
        <main className="flex-1 w-full min-w-0 max-w-[110rem] mx-auto px-[var(--gutter)] pt-4 pb-28 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileTabBar />
      <MobileFab />
    </div>
  );
}