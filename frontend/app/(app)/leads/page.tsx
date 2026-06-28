"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLeads } from "@/lib/leads-api";
import type { Lead, LeadStatus } from "@/lib/types";

import { FiEye, FiEdit2, FiPlus } from "react-icons/fi";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: LeadStatus[] = ["new", "quoted", "negotiating", "won", "lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "border-outline text-on-surface-medium",
  quoted: "bg-blue-900/30 text-blue-400 border-blue-800",
  negotiating: "bg-amber-900/30 text-amber-400 border-amber-800",
  won: "bg-green-900/30 text-green-400 border-green-800",
  lost: "bg-red-900/30 text-red-400 border-red-800",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {capitalize(status)}
    </Badge>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LeadsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);

  const { data: leads, isLoading, isError } = useLeads({ status: statusFilter });

  function handleRowClick(lead: Lead) {
    router.push(`/leads/${lead.id}`);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Leads</h1>
        <Button onClick={() => router.push("/leads/new")}>
          <FiPlus className="h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(val) =>
          setStatusFilter(val === "all" ? undefined : (val as LeadStatus))
        }
        className="mb-4"
      >
        <TabsList className="bg-surface-high">
          <TabsTrigger value="all">All</TabsTrigger>
          {ALL_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s}>
              {capitalize(s)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Loading / Error */}
      {isLoading && <TableSkeleton cols={6} />}
      {isError && (
        <p className="text-red-400">Failed to load leads. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && leads && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">Phone</TableHead>
                <TableHead className="text-on-surface-medium">Event Type</TableHead>
                <TableHead className="text-on-surface-medium">Date</TableHead>
                <TableHead className="text-on-surface-medium">Status</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-0">
                    <EmptyState
                      variant="leads"
                      title="No leads found"
                      description="Track enquiries and prospects by adding your first lead."
                    />
                  </TableCell>
                </TableRow>
              )}
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="border-outline-low cursor-pointer hover:bg-surface-high transition-colors"
                  onClick={() => handleRowClick(lead)}
                >
                  <TableCell className="text-on-surface font-medium">
                    {lead.name}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {lead.phone}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {lead.event_type}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {formatDate(lead.approx_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/leads/${lead.id}`);
                        }}
                        title="View"
                      >
                        <FiEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/leads/${lead.id}`);
                        }}
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
