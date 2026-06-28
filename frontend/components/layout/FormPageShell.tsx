"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormPageShellProps {
  /** e.g. "/leads" */
  backHref: string;
  /** e.g. "Back to Leads" */
  backLabel: string;
  /** Lucide icon node to show in the 46px badge */
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function FormPageShell({
  backHref,
  backLabel,
  icon,
  title,
  subtitle,
  children,
}: FormPageShellProps) {
  const router = useRouter();

  return (
    <div className="max-w-[880px] mx-auto w-full px-8 pt-9 pb-40">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-on-surface-low hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </button>

      {/* Page header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          className="w-[46px] h-[46px] rounded-[13px] flex-shrink-0 flex items-center justify-center text-white"
          style={{
            background:
              "linear-gradient(140deg, var(--primary), color-mix(in oklab, var(--primary), #000 20%))",
            boxShadow:
              "0 8px 22px -8px color-mix(in srgb, var(--primary), transparent 40%)",
          }}
        >
          {icon}
        </div>
        <div>
          <h1
            className="text-[36px] font-semibold leading-[1.05] tracking-[-0.4px] text-on-surface"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h1>
          <p className="text-[15px] text-on-surface-medium mt-1">{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

interface FormStickyFooterProps {
  /** href to navigate on Cancel */
  cancelHref: string;
  isPending: boolean;
  saveLabel?: string;
  /** Extra content on the left side of the footer (e.g. Convert button) */
  leftContent?: React.ReactNode;
  className?: string;
}

export function FormStickyFooter({
  cancelHref,
  isPending,
  saveLabel = "Save",
  leftContent,
  className,
}: FormStickyFooterProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "sticky bottom-0 border-t border-outline-low px-8 py-4",
        className
      )}
      style={{
        background:
          "color-mix(in srgb, var(--surface), transparent 12%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-[880px] mx-auto flex items-center gap-3">
        {leftContent}
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="inline-flex items-center justify-center h-[44px] px-5 rounded-[11px] text-sm font-semibold border border-outline text-on-surface-medium hover:bg-surface-high hover:text-on-surface transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center h-[44px] px-6 rounded-[11px] text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--secondary), #fff 12%), var(--secondary))",
            color: "var(--secondary-foreground)",
            boxShadow: "0 8px 22px -10px var(--secondary)",
          }}
        >
          {isPending ? "Saving…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
