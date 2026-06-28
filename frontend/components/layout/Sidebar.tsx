"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLogout } from "@/lib/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Home,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  FileText,
  DollarSign,
  User,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";

type OrgInfo = { name: string; logo_url: string | null };

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: TrendingUp },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/dishes", label: "Dishes", icon: BookOpen },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: DollarSign },
];

const BOTTOM_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/users", label: "Users", icon: User },
  { href: "/settings/account", label: "Settings", icon: Settings },
];

function navLinkClass(active: boolean) {
  return cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
    active
      ? "bg-primary/10 text-primary font-semibold"
      : "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
  );
}

function SidebarContent({ org, onNavigate }: { org: OrgInfo | undefined; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const orgInitial = (org?.name ?? "Z").charAt(0).toUpperCase();

  return (
    <>
      <div className="px-4 py-4 border-b border-outline-low flex-shrink-0">
        {org?.logo_url ? (
          <img src={org.logo_url} alt={org.name} className="h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary text-sm font-bold flex-shrink-0">
              {orgInitial}
            </span>
            <div className="min-w-0">
              <p className="text-on-surface font-semibold text-sm truncate leading-tight">
                {org?.name ?? "Ziyafat"}
              </p>
              <p className="text-on-surface-low text-xs leading-tight">Catering ERP</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-lowest px-2 mb-2">Menu</p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={navLinkClass(active)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-outline-low flex-shrink-0">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-lowest px-2 mb-2">Account</p>
        <div className="space-y-0.5">
          <ThemeToggle />
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={navLinkClass(active)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout.mutate(undefined, { onSuccess: () => router.push("/login") });
              onNavigate?.();
            }}
            disabled={logout.isPending}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-on-surface-medium hover:bg-surface-high hover:text-on-surface disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {logout.isPending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  const { data: org } = useQuery<OrgInfo>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgInfo>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <aside className="no-print w-56 flex-shrink-0 bg-surface-lowest border-r border-outline-low flex flex-col h-screen sticky top-0">
      <SidebarContent org={org} />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: org } = useQuery<OrgInfo>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgInfo>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Sheet open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose(); }}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="p-0 gap-0 bg-surface-lowest border-r border-outline-low flex flex-col"
      >
        <SidebarContent org={org} onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}
