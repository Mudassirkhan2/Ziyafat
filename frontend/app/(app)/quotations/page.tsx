"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useQuotations,
  useCreateQuotation,
} from "@/lib/quotations-api";
import { useBookings } from "@/lib/bookings-api";
import type { Quotation, QuotationStatus } from "@/lib/types";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: QuotationStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "superseded",
];

const STATUS_COLORS: Record<QuotationStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-900/30 text-blue-400 border-blue-800",
  approved: "bg-green-900/30 text-green-400 border-green-800",
  rejected: "bg-red-900/30 text-red-400 border-red-800",
  superseded: "bg-amber-900/30 text-amber-400 border-amber-800",
};

// ---------------------------------------------------------------------------
// Schema — scalar fields only; line items managed separately
// ---------------------------------------------------------------------------

const quotationSchema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  valid_until: z.string().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

// ---------------------------------------------------------------------------
// Line item row type (string fields for controlled inputs)
// ---------------------------------------------------------------------------

interface LineItemRow {
  label: string;
  qty_per_plate: string;
  guest_count: string;
  unit_price: string;
}

const emptyRow = (): LineItemRow => ({
  label: "",
  qty_per_plate: "",
  guest_count: "",
  unit_price: "",
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {capitalize(status)}
    </Badge>
  );
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function rowTotal(row: LineItemRow): number {
  const qty = parseFloat(row.qty_per_plate) || 0;
  const guests = parseFloat(row.guest_count) || 0;
  const price = parseFloat(row.unit_price) || 0;
  return qty * guests * price;
}

// ---------------------------------------------------------------------------
// Create Sheet
// ---------------------------------------------------------------------------

function CreateQuotationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createQuotation = useCreateQuotation();
  const { data: bookings } = useBookings();

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      booking_id: "",
      valid_until: "",
      notes: "",
      discount: "0",
    },
  });

  const discountValue = form.watch("discount") ?? "0";

  const subtotal = lineItems.reduce((sum, row) => sum + rowTotal(row), 0);
  const total = subtotal - (parseFloat(discountValue) || 0);

  function updateRow(index: number, field: keyof LineItemRow, value: string) {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setLineItems((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    form.reset();
    setLineItems([emptyRow()]);
  }

  function onSubmit(values: QuotationFormValues) {
    const payload = {
      booking_id: values.booking_id,
      valid_until: values.valid_until || undefined,
      notes: values.notes || undefined,
      line_items: lineItems.map((row) => ({
        dish_id: null,
        label: row.label,
        qty_per_plate: parseFloat(row.qty_per_plate) || 0,
        guest_count: parseInt(row.guest_count, 10) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        total: rowTotal(row),
      })),
      subtotal,
      discount: parseFloat(values.discount ?? "0") || 0,
      total,
    };

    createQuotation.mutate(payload, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Quotation</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Booking */}
            <FormField
              control={form.control}
              name="booking_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a booking" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(bookings ?? []).map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valid Until */}
            <FormField
              control={form.control}
              name="valid_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valid Until</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any notes for the customer…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discount */}
            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" defaultValue="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-on-surface">Line Items</p>
              {lineItems.map((row, index) => (
                <div
                  key={index}
                  className="rounded-md border border-outline-low p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Item label (e.g. Biryani)"
                      value={row.label}
                      onChange={(e) => updateRow(index, "label", e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(index)}
                      disabled={lineItems.length === 1}
                      className="text-on-surface-low hover:text-red-400 px-2"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Qty/Plate"
                      value={row.qty_per_plate}
                      onChange={(e) => updateRow(index, "qty_per_plate", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Guests"
                      value={row.guest_count}
                      onChange={(e) => updateRow(index, "guest_count", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Unit Price ₹"
                      value={row.unit_price}
                      onChange={(e) => updateRow(index, "unit_price", e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-on-surface-medium text-right">
                    Row total: ₹{rowTotal(row).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addRow}>
                + Add Item
              </Button>

              <div className="rounded-md bg-surface-high border border-outline-low px-4 py-2 text-sm text-on-surface-medium">
                Subtotal: <span className="font-medium text-on-surface">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {createQuotation.isError && (
              <p className="text-sm text-red-400">Failed to create quotation. Try again.</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createQuotation.isPending}>
                {createQuotation.isPending ? "Creating…" : "Create"}
              </Button>
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

export default function QuotationsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: quotations, isLoading, isError } = useQuotations({ status: statusFilter });
  const { data: bookings } = useBookings();

  // Build a lookup map for quick booking title retrieval
  const bookingMap = new Map((bookings ?? []).map((b) => [b.id, b]));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Quotations</h1>
        <Button onClick={() => setSheetOpen(true)}>+ New Quotation</Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(val) =>
          setStatusFilter(val === "all" ? undefined : (val as QuotationStatus))
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
      {isLoading && <p className="text-on-surface-medium">Loading quotations…</p>}
      {isError && (
        <p className="text-red-400">Failed to load quotations. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && quotations && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Booking</TableHead>
                <TableHead className="text-on-surface-medium">Version</TableHead>
                <TableHead className="text-on-surface-medium">Status</TableHead>
                <TableHead className="text-on-surface-medium">Total</TableHead>
                <TableHead className="text-on-surface-medium">Valid Until</TableHead>
                <TableHead className="text-on-surface-medium">Created</TableHead>
                <TableHead className="text-on-surface-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-on-surface-low py-8"
                  >
                    No quotations found.
                  </TableCell>
                </TableRow>
              )}
              {quotations.map((q) => {
                const booking = bookingMap.get(q.booking_id);
                return (
                  <TableRow
                    key={q.id}
                    className="border-outline-low hover:bg-surface-high transition-colors"
                  >
                    <TableCell className="text-on-surface font-medium">
                      {booking ? booking.title : q.booking_id}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      v{q.version}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      ₹{q.total.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {formatDate(q.valid_until)}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {formatDate(q.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/quotations/${q.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Sheet */}
      <CreateQuotationSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
