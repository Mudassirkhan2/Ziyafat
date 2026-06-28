"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FiUser, FiImage, FiShoppingBag, FiUserCheck } from "react-icons/fi";

const SETTINGS_TABS = [
  { href: "/settings/profile",    label: "Profile",    icon: FiUserCheck   },
  { href: "/settings/account",    label: "Account",    icon: FiUser        },
  { href: "/settings/branding",   label: "Branding",   icon: FiImage       },
  { href: "/settings/storefront", label: "Storefront", icon: FiShoppingBag },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Settings</h1>

      {/* Tab nav */}
      <div className="flex gap-1 border-b border-outline-low mb-6">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-md transition-colors",
                pathname === tab.href
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-medium hover:text-on-surface hover:bg-surface-high"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
