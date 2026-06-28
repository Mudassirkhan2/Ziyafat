"use client";

import { useCurrentUser } from "@/lib/auth";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
      <p className="text-on-surface-medium mt-1">
        Welcome back, {user?.name ?? "…"}
      </p>
      <div className="mt-6 rounded-lg border border-outline bg-surface-high p-6">
        <p className="text-on-surface-low text-sm">
          Dashboard widgets will be added in Phase C (Reporting).
        </p>
      </div>
    </div>
  );
}
