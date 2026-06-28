"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  FiHome,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiBook,
  FiFileText,
  FiDollarSign,
  FiUser,
  FiSettings,
} from "react-icons/fi";

type OrgInfo = { name: string; logo_url: string | null };

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",  icon: FiHome       },
  { href: "/leads",      label: "Leads",      icon: FiTrendingUp },
  { href: "/customers",  label: "Customers",  icon: FiUsers      },
  { href: "/bookings",   label: "Bookings",   icon: FiCalendar   },
  { href: "/dishes",     label: "Dishes",     icon: FiBook       },
  { href: "/quotations", label: "Quotations", icon: FiFileText   },
  { href: "/invoices",   label: "Invoices",   icon: FiDollarSign },
];

const BOTTOM_NAV = [
  { href: "/users",            label: "Users",    icon: FiUser     },
  { href: "/settings/account", label: "Settings", icon: FiSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: org } = useQuery<OrgInfo>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgInfo>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <aside className="no-print w-56 flex-shrink-0 bg-surface-low border-r border-outline-low flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-outline-lowest">
        {org?.logo_url ? (
          <img src={org.logo_url} alt={org.name} className="h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-primary text-lg font-bold">Z</span>
            <span className="text-on-surface font-semibold text-sm truncate">
              {org?.name ?? "Ziyafat"}
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-on-primary font-medium"
                  : "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
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
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary text-on-primary font-medium"
                  : "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
