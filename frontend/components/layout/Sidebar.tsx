"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLogout } from "@/lib/auth";
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
  { href: "/dashboard",  label: "Dashboard",  icon: Home       },
  { href: "/leads",      label: "Leads",      icon: TrendingUp },
  { href: "/customers",  label: "Customers",  icon: Users      },
  { href: "/bookings",   label: "Bookings",   icon: Calendar   },
  { href: "/dishes",     label: "Dishes",     icon: BookOpen   },
  { href: "/quotations", label: "Quotations", icon: FileText   },
  { href: "/invoices",   label: "Invoices",   icon: DollarSign },
];

const BOTTOM_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/users",            label: "Users",    icon: User     },
  { href: "/settings/account", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: org } = useQuery<OrgInfo>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgInfo>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  const orgInitial = (org?.name ?? "Z").charAt(0).toUpperCase();

  return (
    <aside className="no-print w-56 flex-shrink-0 bg-surface-lowest border-r border-outline-low flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-outline-lowest">
        {org?.logo_url ? (
          <img src={org.logo_url} alt={org.name} className="h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold flex-shrink-0">
              {orgInitial}
            </span>
            <span className="text-on-surface font-semibold text-sm truncate">
              {org?.name ?? "Ziyafat"}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2",
                active
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-transparent text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-outline-lowest space-y-0.5">
        <ThemeToggle />
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2",
                active
                  ? "border-primary bg-primary/5 text-primary font-medium"
                  : "border-transparent text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => logout.mutate(undefined, { onSuccess: () => router.push("/login") })}
          disabled={logout.isPending}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors border-l-2 border-transparent text-on-surface-medium hover:bg-surface-high hover:text-on-surface disabled:opacity-50"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
