"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useInvoices,
  useCreateInvoice,
} from "@/lib/invoices-api";
import { useBookings } from "@/lib/bookings-api";
import { useQuotations } from "@/lib/quotations-api";
import type { Invoice, InvoiceStatus, QuotationLineItem } from "@/lib/types";

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

const ALL_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid"];

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "border-outline text-on-surface-medium",
  sent: "bg-blue-900/30 text-blue-400 border-blue-800",
  paid: "bg-green-900/30 text-green-400 border-green-800",
};

// ---------------------------------------------------------------------------
// Schema — scalar fields only; line items managed separately
// ---------------------------------------------------------------------------

const invoiceSchema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  quotation_id: z.string().optional(),
  due_date: z.string().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

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

function StatusBadge({ status }: { status: InvoiceStatus }) {
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

function CreateInvoiceSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createInvoice = useCreateInvoice();
  const { data: bookings } = useBookings();
  const { data: allQuotations } = useQuotations();

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      booking_id: "",
      quotation_id: "",
      due_date: "",
      notes: "",
      discount: "0",
    },
  });

  const selectedBookingId = form.watch("booking_id");
  const selectedQuotationId = form.watch("quotation_id");
  const discountValue = form.watch("discount") ?? "0";

  // Filter quotations to only those belonging to the selected booking
  const bookingQuotations = (allQuotations ?? []).filter(
    (q) => q.booking_id === selectedBookingId
  );

  const hasQuotation = !!selectedQuotationId;

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

  function onSubmit(values: InvoiceFormValues) {
    if (hasQuotation) {
      // Backend copies line items from the quotation
      createInvoice.mutate(
        {
          booking_id: values.booking_id,
          quotation_id: values.quotation_id || undefined,
          subtotal: 0,
          discount: parseFloat(values.discount ?? "0") || 0,
          total: 0,
          due_date: values.due_date || undefined,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        }
      );
    } else {
      // Manual line items
      const lineItemsPayload: QuotationLineItem[] = lineItems.map((row) => ({
        dish_id: null,
        label: row.label,
        qty_per_plate: parseFloat(row.qty_per_plate) || 0,
        guest_count: parseInt(row.guest_count, 10) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        total: rowTotal(row),
      }));

      createInvoice.mutate(
        {
          booking_id: values.booking_id,
          line_items: lineItemsPayload,
          subtotal,
          discount: parseFloat(values.discount ?? "0") || 0,
          total,
          due_date: values.due_date || undefined,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => {
            resetForm();
            onOpenChange(false);
          },
        }
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Invoice</SheetTitle>
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
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val);
                      // Reset quotation when booking changes
                      form.setValue("quotation_id", "");
                    }}
                    value={field.value}
                  >
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

            {/* Link to Quotation (optional) */}
            <FormField
              control={form.control}
              name="quotation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Quotation (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedBookingId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectedBookingId ? "Select a quotation" : "Select a booking first"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {bookingQuotations.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          v{q.version} — ₹{q.total.toLocaleString("en-IN")} ({q.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
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

            {/* Line Items — conditional on whether a quotation is linked */}
            {hasQuotation ? (
              <div className="rounded-md border border-outline-low p-4 bg-surface-high">
                <p className="text-sm text-on-surface-medium">
                  Line items will be copied from the selected quotation automatically.
                </p>
              </div>
            ) : (
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
                  Subtotal:{" "}
                  <span className="font-medium text-on-surface">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}

            {createInvoice.isError && (
              <p className="text-sm text-red-400">Failed to create invoice. Try again.</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Creating…" : "Create"}
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

export default function InvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>(undefined);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: invoices, isLoading, isError } = useInvoices({ status: statusFilter });
  const { data: bookings } = useBookings();

  // Build a lookup map for quick booking title retrieval
  const bookingMap = new Map((bookings ?? []).map((b) => [b.id, b]));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Invoices</h1>
        <Button onClick={() => setSheetOpen(true)}>+ New Invoice</Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter ?? "all"}
        onValueChange={(val) =>
          setStatusFilter(val === "all" ? undefined : (val as InvoiceStatus))
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
      {isLoading && <p className="text-on-surface-medium">Loading invoices…</p>}
      {isError && (
        <p className="text-red-400">Failed to load invoices. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && invoices && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Invoice #</TableHead>
                <TableHead className="text-on-surface-medium">Booking</TableHead>
                <TableHead className="text-on-surface-medium">Status</TableHead>
                <TableHead className="text-on-surface-medium">Total</TableHead>
                <TableHead className="text-on-surface-medium">Due Date</TableHead>
                <TableHead className="text-on-surface-medium">Created</TableHead>
                <TableHead className="text-on-surface-medium text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-on-surface-low py-8"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
              {invoices.map((invoice) => {
                const booking = bookingMap.get(invoice.booking_id);
                return (
                  <TableRow
                    key={invoice.id}
                    className="border-outline-low hover:bg-surface-high transition-colors"
                  >
                    <TableCell className="text-on-surface font-medium font-mono">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {booking ? booking.title : invoice.booking_id}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      ₹{invoice.total.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell className="text-on-surface-medium">
                      {formatDate(invoice.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
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
      <CreateInvoiceSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
