"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { applyOrgTheme, OrgTheme } from "@/lib/dls/tokens";
import { Sidebar, MobileSidebar } from "./Sidebar";
import { Menu } from "lucide-react";

type OrgSettings = OrgTheme & { name: string; logo_url?: string | null };

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile nav drawer */}
      <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top header */}
        <header className="no-print md:hidden flex items-center gap-3 px-4 py-3 border-b border-outline-low bg-surface-lowest flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="text-on-surface-medium hover:text-on-surface transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {org?.logo_url ? (
              <img src={org.logo_url} alt={org.name} className="h-6 object-contain" />
            ) : (
              <>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold flex-shrink-0">
                  {(org?.name ?? "Z").charAt(0).toUpperCase()}
                </span>
                <span className="font-semibold text-sm text-on-surface truncate">
                  {org?.name ?? "Ziyafat"}
                </span>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
