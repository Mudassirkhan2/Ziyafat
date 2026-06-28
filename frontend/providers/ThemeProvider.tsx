"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  resolvedTheme: ResolvedTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  const applyTheme = useCallback((theme: ResolvedTheme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    setResolvedTheme(theme);
    localStorage.setItem("theme", theme);
  }, []);

  useEffect(() => {
    // Sync React state with what the FOIT inline script already applied to <html>
    const isDark = document.documentElement.classList.contains("dark");
    setResolvedTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";

    if (!("startViewTransition" in document)) {
      applyTheme(next);
      return;
    }

    (document as Document & { startViewTransition: (cb: () => void) => unknown })
      .startViewTransition(() => applyTheme(next));
  }, [resolvedTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ resolvedTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
