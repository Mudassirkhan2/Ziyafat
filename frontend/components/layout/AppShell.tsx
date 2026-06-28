"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { applyOrgTheme, OrgTheme } from "@/lib/dls/tokens";
import { Sidebar } from "./Sidebar";

type OrgSettings = OrgTheme & { name: string };

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: org } = useQuery<OrgSettings>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgSettings>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (org) applyOrgTheme(org);
  }, [org]);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
