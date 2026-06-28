"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useLogout, useCurrentUser } from "@/lib/auth";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/providers/ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";
import {
  Home,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  FileText,
  DollarSign,
  Store,
  User,
  Settings,
  LogOut,
  ChevronUp,
  type LucideIcon,
} from "lucide-react";

type OrgInfo = { name: string; logo_url: string | null; slug: string };

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/leads", label: "Leads", icon: TrendingUp },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/quotations", label: "Quotations", icon: FileText },
  { href: "/dishes", label: "Dishes", icon: BookOpen },
  { href: "/invoices", label: "Invoices", icon: DollarSign },
];

const BOTTOM_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/users", label: "Users", icon: User },
  { href: "/settings/account", label: "Settings", icon: Settings },
];

function SidebarContent({
  org,
  onNavigate,
}: {
  org: OrgInfo | undefined;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const { data: currentUser } = useCurrentUser();
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const userInitials = (currentUser?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const orgInitial = (org?.name ?? "Z").charAt(0).toUpperCase();

  function navItem(href: string, label: string, Icon: LucideIcon) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-sm font-medium transition-all duration-150 mb-0.5"
        )}
        style={
          active
            ? {
              background:
                "linear-gradient(90deg, var(--sidebar-dark-active-a), var(--sidebar-dark-active-b))",
              color: "white",
              fontWeight: 600,
            }
            : { color: "var(--sidebar-dark-text)" }
        }
      >
        {active && (
          <span
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
            style={{ background: "var(--secondary)" }}
          />
        )}
        <Icon
          className="h-[18px] w-[18px] flex-shrink-0 transition-colors"
          style={{ color: active ? "white" : "var(--sidebar-dark-mute)" }}
        />
        {label}
      </Link>
    );
  }

  return (
    <>
      {/* Workspace pill */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0">
        <div
          className="flex items-center gap-2.5 p-2.5 rounded-[14px] cursor-pointer transition-all duration-150"
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid var(--sidebar-dark-line)",
          }}
        >
          {org?.logo_url ? (
            <img
              src={org.logo_url}
              alt={org.name}
              className="h-9 w-9 rounded-[10px] object-contain flex-shrink-0"
            />
          ) : (
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] font-bold text-[19px] flex-shrink-0"
              style={{
                fontFamily: "var(--font-serif)",
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--secondary), #fff 16%), var(--secondary))",
                color: "color-mix(in oklab, var(--secondary), #000 78%)",
              }}
            >
              {orgInitial}
            </span>
          )}
          <div className="min-w-0">
            <p
              className="text-sm font-bold leading-tight truncate"
              style={{ color: "#eef5f2" }}
            >
              {org?.name ?? "Ziyafat"}
            </p>
            <p
              className="text-[11.5px] leading-tight"
              style={{ color: "var(--sidebar-dark-mute)" }}
            >
              Catering ERP
            </p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav
        className="flex-1 overflow-y-auto px-3 pb-3"
        style={{ scrollbarWidth: "none" }}
      >
        <p
          className="text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 pt-3 pb-2"
          style={{ color: "var(--sidebar-dark-mute)" }}
        >
          Menu
        </p>
        {NAV_ITEMS.map((item) => navItem(item.href, item.label, item.icon))}

        {org?.slug && (
          <a
            href={`/${org.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onNavigate}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-sm font-medium transition-all duration-150 mb-0.5"
            style={{ color: "var(--sidebar-dark-text)" }}
          >
            <Store
              className="h-[18px] w-[18px] flex-shrink-0"
              style={{ color: "var(--sidebar-dark-mute)" }}
            />
            Storefront
          </a>
        )}

        <p
          className="text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 pt-4 pb-2"
          style={{ color: "var(--sidebar-dark-mute)" }}
        >
          Account
        </p>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center gap-3 px-3 py-2.5 rounded-[11px] text-sm font-medium transition-all duration-150 mb-0.5 w-full"
          style={{ color: "var(--sidebar-dark-text)" }}
        >
          {isDark ? (
            <FiSun
              className="h-[18px] w-[18px] flex-shrink-0"
              style={{ color: "var(--sidebar-dark-mute)" }}
            />
          ) : (
            <FiMoon
              className="h-[18px] w-[18px] flex-shrink-0"
              style={{ color: "var(--sidebar-dark-mute)" }}
            />
          )}
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        {BOTTOM_NAV.map((item) => navItem(item.href, item.label, item.icon))}
      </nav>

      {/* User profile */}
      <div
        className="p-3 flex-shrink-0"
        style={{ borderTop: "1px solid var(--sidebar-dark-line)" }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[11px] transition-all duration-150 group"
              style={{ color: "var(--sidebar-dark-text)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--secondary), #fff 20%), var(--secondary))",
                    color: "color-mix(in oklab, var(--secondary), #000 78%)",
                  }}
                >
                  {userInitials}
                </span>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p
                  className="text-sm font-semibold leading-tight truncate"
                  style={{ color: "#eef5f2" }}
                >
                  {currentUser?.name ?? "Loading…"}
                </p>
                <p
                  className="text-[11px] leading-tight capitalize truncate"
                  style={{ color: "var(--sidebar-dark-mute)" }}
                >
                  {currentUser?.role ?? ""}
                </p>
              </div>
              <ChevronUp
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "var(--sidebar-dark-mute)" }}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56 p-1.5"
            style={{
              background: "var(--sidebar-dark-bg)",
              border: "1px solid var(--sidebar-dark-line)",
            }}
          >
            {/* User info header */}
            <div
              className="px-3 py-2.5 mb-1 rounded-[9px]"
              style={{ background: "rgba(255,255,255,.04)" }}
            >
              <p
                className="text-sm font-semibold truncate"
                style={{ color: "#eef5f2" }}
              >
                {currentUser?.name}
              </p>
              <p
                className="text-[11.5px] truncate"
                style={{ color: "var(--sidebar-dark-mute)" }}
              >
                {currentUser?.email}
              </p>
            </div>

            {/* Sign out */}
            <button
              onClick={() => {
                logout.mutate(undefined, {
                  onSuccess: () => router.push("/login"),
                });
                onNavigate?.();
              }}
              disabled={logout.isPending}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[9px] text-sm font-medium transition-all duration-150 disabled:opacity-50"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(248,113,113,.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
              }}
            >
              <LogOut className="h-[15px] w-[15px] flex-shrink-0" />
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
          </PopoverContent>
        </Popover>
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
    <aside
      className="no-print w-[264px] flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: `linear-gradient(180deg, var(--sidebar-dark-top), var(--sidebar-dark-bg) 60%)`,
        borderRight: "1px solid var(--sidebar-dark-line)",
      }}
    >
      <SidebarContent org={org} />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: org } = useQuery<OrgInfo>({
    queryKey: ["org-info"],
    queryFn: () => api.get<OrgInfo>("/organisation"),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="p-0 gap-0 border-0 flex flex-col w-[264px]"
        style={{
          background: `linear-gradient(180deg, var(--sidebar-dark-top), var(--sidebar-dark-bg) 60%)`,
          borderRight: "1px solid var(--sidebar-dark-line)",
        }}
      >
        <SidebarContent org={org} onNavigate={onClose} />
      </SheetContent>
    </Sheet>
  );
}
