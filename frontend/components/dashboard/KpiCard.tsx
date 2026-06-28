// frontend/components/dashboard/KpiCard.tsx
import type { ReactNode } from "react";

export type AccentKey = "emerald" | "red" | "blue" | "amber" | "violet" | "cyan";

const ACCENT_CLASSES: Record<AccentKey | "default", string> = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  red: "text-red-600 dark:text-red-400",
  blue: "text-blue-600 dark:text-blue-400",
  amber: "text-amber-600 dark:text-amber-400",
  violet: "text-violet-600 dark:text-violet-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  default: "text-on-surface",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accent?: AccentKey;
}

export function KpiCard({ label, value, icon, accent }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4 flex flex-col gap-2">
      <div className={`text-xl ${ACCENT_CLASSES[accent ?? "default"]}`}>{icon}</div>
      <div className="text-2xl font-bold text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-low">{label}</div>
    </div>
  );
}
