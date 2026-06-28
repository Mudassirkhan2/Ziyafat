"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type OrgInfo = { name: string; logo_url: string | null };

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard"  },
  { href: "/leads",      label: "Leads"      },
  { href: "/customers",  label: "Customers"  },
  { href: "/bookings",   label: "Bookings"   },
  { href: "/dishes",     label: "Dishes"     },
  { href: "/quotations", label: "Quotations" },
  { href: "/invoices",   label: "Invoices"   },
];

const BOTTOM_NAV = [
  { href: "/users",            label: "Users"    },
  { href: "/settings/account", label: "Settings" },
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
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary text-on-primary font-medium"
                : "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-outline-lowest space-y-0.5">
        {BOTTOM_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-primary text-on-primary font-medium"
                : "text-on-surface-medium hover:bg-surface-high hover:text-on-surface"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
