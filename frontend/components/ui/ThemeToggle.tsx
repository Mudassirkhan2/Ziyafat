"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full",
        "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
      )}
    >
      {isDark ? (
        <FiSun className="h-4 w-4 flex-shrink-0" />
      ) : (
        <FiMoon className="h-4 w-4 flex-shrink-0" />
      )}
      {isDark ? "Light mode" : "Dark mode"}
    </button>
  );
}
