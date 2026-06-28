"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useLeads,
  useCreateLead,
  useUpdateLead,
  useConvertLead,
} from "@/lib/leads-api";
import type { Lead, LeadStatus } from "@/lib/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
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
// Schema — all fields are strings so react-hook-form types stay simple
// ---------------------------------------------------------------------------

const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  event_type: z.string().min(1, "Event type is required"),
  email: z.string().optional(),
  approx_date: z.string().optional(),
  approx_guest_count: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "quoted", "negotiating", "won", "lost"]).optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

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
// Lead Sheet (Add / Edit)
// ---------------------------------------------------------------------------

type SheetMode = { mode: "add" } | { mode: "edit"; lead: Lead };

function LeadSheet({
  sheetMode,
  open,
  onOpenChange,
}: {
  sheetMode: SheetMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = sheetMode.mode === "edit";
  const lead = isEdit ? (sheetMode as { mode: "edit"; lead: Lead }).lead : undefined;

  const createLead = useCreateLead();
  const updateLead = useUpdateLead(lead?.id ?? "");
  const convertLead = useConvertLead();

  const [convertSuccess, setConvertSuccess] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead?.name ?? "",
      phone: lead?.phone ?? "",
      event_type: lead?.event_type ?? "",
      email: lead?.email ?? "",
      approx_date: lead?.approx_date ?? "",
      approx_guest_count: lead?.approx_guest_count?.toString() ?? "",
      source: lead?.source ?? "",
      notes: lead?.notes ?? "",
      status: lead?.status ?? "new",
    },
  });

  function onSubmit(values: LeadFormValues) {
    const guestCount = values.approx_guest_count
      ? parseInt(values.approx_guest_count, 10)
      : null;

    const payload: Partial<Lead> = {
      name: values.name,
      phone: values.phone,
      event_type: values.event_type,
      email: values.email || null,
      approx_date: values.approx_date || null,
      approx_guest_count: guestCount && !isNaN(guestCount) ? guestCount : null,
      source: values.source || null,
      notes: values.notes || null,
    };

    if (isEdit && values.status) {
      payload.status = values.status;
    }

    if (isEdit) {
      updateLead.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createLead.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  function handleConvert() {
    if (!lead) return;
    convertLead.mutate(lead.id, {
      onSuccess: () => {
        setConvertSuccess(true);
        setTimeout(() => {
          setConvertSuccess(false);
          onOpenChange(false);
        }, 1500);
      },
    });
  }

  const isMutating = createLead.isPending || updateLead.isPending;
  const canConvert =
    isEdit && lead && lead.status !== "won" && lead.status !== "lost";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Lead" : "Add Lead"}</SheetTitle>
        </SheetHeader>

        {convertSuccess && (
          <div className="mt-4 rounded-md bg-green-900/30 border border-green-800 px-4 py-3 text-green-400 text-sm">
            Lead converted to customer successfully.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contact name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="event_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Wedding, Birthday" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="optional@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="approx_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="approx_guest_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approximate Guest Count</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Referral, Instagram" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {capitalize(s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(createLead.isError || updateLead.isError) && (
              <p className="text-sm text-red-400">
                Failed to {isEdit ? "update" : "create"} lead. Try again.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-4">
              {canConvert && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-green-800 text-green-400 hover:bg-green-900/20"
                  onClick={handleConvert}
                  disabled={convertLead.isPending}
                >
                  {convertLead.isPending ? "Converting…" : "Convert to Customer"}
                </Button>
              )}
              {convertLead.isError && (
                <p className="text-sm text-red-400">
                  Failed to convert lead. Try again.
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isMutating}>
                  {isMutating
                    ? isEdit
                      ? "Saving…"
                      : "Creating…"
                    : isEdit
                    ? "Save"
                    : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LeadsPage() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ mode: "add" });

  const { data: leads, isLoading, isError } = useLeads({ status: statusFilter });

  function openAdd() {
    setSheetMode({ mode: "add" });
    setSheetOpen(true);
  }

  function openEdit(lead: Lead) {
    setSheetMode({ mode: "edit", lead });
    setSheetOpen(true);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Leads</h1>
        <Button onClick={openAdd}>+ Add Lead</Button>
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
      {isLoading && <p className="text-on-surface-medium">Loading leads…</p>}
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
                  <TableCell
                    colSpan={6}
                    className="text-center text-on-surface-low py-8"
                  >
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
              {leads.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="border-outline-low cursor-pointer hover:bg-surface-high transition-colors"
                  onClick={() => openEdit(lead)}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(lead);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Sheet */}
      <LeadSheet
        sheetMode={sheetMode}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
