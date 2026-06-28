"use client";

import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// SVG Illustrations
// ---------------------------------------------------------------------------

function BookingsSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar body */}
      <rect x="10" y="18" width="60" height="52" rx="5" stroke="currentColor" strokeWidth="1.5" />
      {/* Header bar */}
      <rect x="10" y="18" width="60" height="16" rx="5" fill="currentColor" fillOpacity="0.08" />
      <rect x="10" y="26" width="60" height="8" fill="currentColor" fillOpacity="0.08" />
      {/* Ring pegs */}
      <line x1="26" y1="12" x2="26" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="54" y1="12" x2="54" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Divider */}
      <line x1="10" y1="34" x2="70" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Date cells - row 1 */}
      <rect x="16" y="39" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="30" y="39" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="44" y="39" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="58" y="39" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      {/* Date cells - row 2 */}
      <rect x="16" y="52" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="30" y="52" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      {/* Amber accent: highlighted date */}
      <rect x="44" y="52" width="9" height="8" rx="2" className="fill-primary" fillOpacity="0.9" />
      <line x1="47" y1="56" x2="50" y2="56" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
      <rect x="58" y="52" width="9" height="8" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      {/* Row 3 partial */}
      <rect x="16" y="65" width="9" height="5" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="30" y="65" width="9" height="5" rx="2" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
    </svg>
  );
}

function CustomersSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer container circle */}
      <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" />
      {/* Inner soft circle */}
      <circle cx="40" cy="40" r="22" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
      {/* Head */}
      <circle cx="40" cy="30" r="9" stroke="currentColor" strokeWidth="1.5" />
      {/* Body arc */}
      <path d="M20 62 C20 50 60 50 60 62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber accent: small location pin at top right */}
      <circle cx="58" cy="18" r="5" className="fill-primary" />
      <circle cx="58" cy="17" r="2" fill="white" fillOpacity="0.7" />
      <path d="M58 22 L58 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" fillOpacity="0.7" />
    </svg>
  );
}

function LeadsSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Funnel outline */}
      <path d="M12 18 H68 L52 42 L52 66 L28 58 L28 42 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Funnel fill (very subtle) */}
      <path d="M12 18 H68 L52 42 L52 66 L28 58 L28 42 Z" fill="currentColor" fillOpacity="0.05" />
      {/* Horizontal stripes inside funnel */}
      <line x1="18" y1="26" x2="62" y2="26" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="25" y1="34" x2="55" y2="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Amber accent: star above funnel top-right */}
      <path
        d="M65 12 L66.2 15.5 L70 15.5 L67 17.8 L68.2 21.3 L65 19 L61.8 21.3 L63 17.8 L60 15.5 L63.8 15.5 Z"
        className="fill-primary"
        fillOpacity="0.9"
      />
    </svg>
  );
}

function DishesSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Plate ellipse */}
      <ellipse cx="40" cy="62" rx="28" ry="6" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="40" cy="62" rx="21" ry="4" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      {/* Cloche dome */}
      <path d="M14 62 C14 40 66 40 66 62" stroke="currentColor" strokeWidth="1.5" />
      {/* Cloche body fill */}
      <path d="M14 62 C14 40 66 40 66 62 Z" fill="currentColor" fillOpacity="0.06" />
      {/* Handle on dome */}
      <rect x="35" y="16" width="10" height="6" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="22" x2="40" y2="30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="40" cy="32" rx="6" ry="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Amber accent: small leaf garnish */}
      <path d="M58 54 C60 48 66 50 64 56 C62 52 58 54 58 54 Z" className="fill-primary" fillOpacity="0.85" />
    </svg>
  );
}

function QuotationsSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document body */}
      <path d="M14 12 H54 L66 24 V72 H14 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Fill */}
      <path d="M14 12 H54 L66 24 V72 H14 Z" fill="currentColor" fillOpacity="0.05" />
      {/* Corner fold */}
      <path d="M54 12 L54 24 L66 24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M54 12 L66 24" fill="currentColor" fillOpacity="0.08" />
      {/* Text lines */}
      <line x1="22" y1="36" x2="52" y2="36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="22" y1="46" x2="52" y2="46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="22" y1="56" x2="40" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      {/* Amber accent: pencil tip at bottom right of doc */}
      <g className="text-primary">
        <path d="M55 62 L60 57 L65 62 L60 67 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.25" />
        <line x1="60" y1="57" x2="60" y2="52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="55" y1="62" x2="50" y2="67" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      </g>
    </svg>
  );
}

function InvoicesSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Receipt body */}
      <path
        d="M16 12 H64 V62 C64 62 58 58 52 62 C46 66 40 62 40 62 C40 62 34 58 28 62 C22 66 16 62 16 62 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Fill */}
      <path
        d="M16 12 H64 V62 C64 62 58 58 52 62 C46 66 40 62 40 62 C40 62 34 58 28 62 C22 66 16 62 16 62 Z"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Top divider */}
      <line x1="16" y1="22" x2="64" y2="22" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Amber accent: ₹ symbol */}
      <text x="40" y="42" textAnchor="middle" fontSize="18" fontWeight="600" className="fill-primary" fillOpacity="0.9" fontFamily="sans-serif">₹</text>
      {/* Lines below symbol */}
      <line x1="26" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="30" y1="56" x2="50" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.25" />
    </svg>
  );
}

function UsersSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back person (right, offset) */}
      <circle cx="50" cy="28" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" />
      <path d="M28 68 C28 56 72 56 72 68" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      {/* Front person (left) */}
      <circle cx="32" cy="30" r="11" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.06" />
      <path d="M8 70 C8 56 56 56 56 70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber accent: small + badge bottom right */}
      <circle cx="64" cy="62" r="8" className="fill-primary" />
      <line x1="64" y1="58" x2="64" y2="66" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="62" x2="68" y2="62" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function EventsSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar body */}
      <rect x="8" y="16" width="46" height="42" rx="4" stroke="currentColor" strokeWidth="1.5" />
      {/* Header */}
      <rect x="8" y="16" width="46" height="14" rx="4" fill="currentColor" fillOpacity="0.08" />
      <rect x="8" y="23" width="46" height="7" fill="currentColor" fillOpacity="0.08" />
      {/* Ring pegs */}
      <line x1="22" y1="10" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="10" x2="40" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Divider */}
      <line x1="8" y1="30" x2="54" y2="30" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      {/* Empty cells */}
      <rect x="14" y="35" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="26" y="35" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="38" y="35" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="14" y="46" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      <rect x="26" y="46" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
      {/* Amber accent: clock overlaid bottom right */}
      <circle cx="60" cy="58" r="14" className="fill-primary" fillOpacity="0.12" />
      <circle cx="60" cy="58" r="14" className="stroke-primary" strokeWidth="1.5" />
      <line x1="60" y1="58" x2="60" y2="50" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="58" x2="66" y2="58" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="58" r="1.5" className="fill-primary" />
    </svg>
  );
}

function LineItemsSVG() {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* List container */}
      <rect x="10" y="12" width="60" height="58" rx="5" stroke="currentColor" strokeWidth="1.5" />
      {/* Header row */}
      <rect x="10" y="12" width="60" height="16" rx="5" fill="currentColor" fillOpacity="0.07" />
      <rect x="10" y="21" width="60" height="7" fill="currentColor" fillOpacity="0.07" />
      {/* Header line */}
      <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      <line x1="52" y1="20" x2="64" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4" />
      {/* Row 1: amber bullet */}
      <circle cx="20" cy="37" r="3" className="fill-primary" />
      <line x1="28" y1="37" x2="52" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
      <line x1="56" y1="37" x2="64" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
      {/* Row 2: muted bullet */}
      <circle cx="20" cy="51" r="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="28" y1="51" x2="52" y2="51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2" />
      <line x1="56" y1="51" x2="64" y2="51" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.2" />
      {/* Row 3: dashed / ghost */}
      <circle cx="20" cy="65" r="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="2 2" />
      <line x1="28" y1="65" x2="48" y2="65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Variant map
// ---------------------------------------------------------------------------

export type EmptyStateVariant =
  | "bookings"
  | "customers"
  | "leads"
  | "dishes"
  | "quotations"
  | "invoices"
  | "users"
  | "events"
  | "line-items";

const ILLUSTRATIONS: Record<EmptyStateVariant, () => React.ReactElement> = {
  bookings: BookingsSVG,
  customers: CustomersSVG,
  leads: LeadsSVG,
  dishes: DishesSVG,
  quotations: QuotationsSVG,
  invoices: InvoicesSVG,
  users: UsersSVG,
  events: EventsSVG,
  "line-items": LineItemsSVG,
};

// ---------------------------------------------------------------------------
// EmptyState component
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ variant, title, description, className }: EmptyStateProps) {
  const Illustration = ILLUSTRATIONS[variant];
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
      <div className="text-on-surface-low opacity-80">
        <Illustration />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-on-surface-medium">{title}</p>
        {description && (
          <p className="text-xs text-on-surface-low max-w-xs leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
