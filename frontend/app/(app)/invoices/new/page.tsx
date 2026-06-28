"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { FileText } from "lucide-react";

import { useCreateInvoice } from "@/lib/invoices-api";
import { useQuotations } from "@/lib/quotations-api";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { toast } from "sonner";
import type { QuotationLineItem } from "@/lib/types";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormDatePicker } from "@/components/ui/form-fields";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus } from "react-icons/fi";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const invoiceSchema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  quotation_id: z.string().optional(),
  due_date: z.date().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ---------------------------------------------------------------------------
// Line item helpers
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

function rowTotal(row: LineItemRow): number {
  return (
    (parseFloat(row.qty_per_plate) || 0) *
    (parseFloat(row.guest_count) || 0) *
    (parseFloat(row.unit_price) || 0)
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewInvoicePage() {
  const router = useRouter();
  const createInvoice = useCreateInvoice();
  const { data: bookings } = useBookingsForSelect();

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      booking_id: "",
      quotation_id: "",
      due_date: undefined,
      notes: "",
      discount: "0",
    },
  });

  const selectedBookingId = form.watch("booking_id");
  const selectedQuotationId = form.watch("quotation_id");
  const discountValue = form.watch("discount") ?? "0";

  const { data: bookingQuotationsData } = useQuotations(
    selectedBookingId ? { booking_id: selectedBookingId } : undefined
  );
  const bookingQuotations = bookingQuotationsData?.items ?? [];
  const hasQuotation = !!selectedQuotationId;

  const subtotal = lineItems.reduce((sum, row) => sum + rowTotal(row), 0);
  const total = subtotal - (parseFloat(discountValue) || 0);

  function updateRow(index: number, field: keyof LineItemRow, value: string) {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function onSubmit(values: InvoiceFormValues) {
    if (hasQuotation) {
      createInvoice.mutate(
        {
          booking_id: values.booking_id,
          quotation_id: values.quotation_id || undefined,
          subtotal: 0,
          discount: parseFloat(values.discount ?? "0") || 0,
          total: 0,
          due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : undefined,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => { toast.success("Invoice created."); router.push("/invoices"); },
          onError: () => toast.error("Failed to create invoice. Try again."),
        }
      );
    } else {
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
          due_date: values.due_date ? format(values.due_date, "yyyy-MM-dd") : undefined,
          notes: values.notes || undefined,
        },
        {
          onSuccess: () => { toast.success("Invoice created."); router.push("/invoices"); },
          onError: () => toast.error("Failed to create invoice. Try again."),
        }
      );
    }
  }

  return (
    <FormPageShell
      backHref="/invoices"
      backLabel="Back to Invoices"
      icon={<FileText className="h-5 w-5" />}
      title="New Invoice"
      subtitle="Generate an invoice for a booking."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            {/* Booking */}
            <div className="px-6 py-5">
              <FormField
                control={form.control}
                name="booking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking *</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
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
                        {(bookings?.items ?? []).map((b) => (
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
            </div>

            {/* Link to Quotation */}
            <div className="px-6 py-5">
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
                          <SelectValue
                            placeholder={
                              selectedBookingId
                                ? "Select a quotation"
                                : "Select a booking first"
                            }
                          />
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
            </div>

            {/* Due Date */}
            <div className="px-6 py-5">
              <FormDatePicker name="due_date" label="Due Date" />
            </div>

            {/* Notes */}
            <div className="px-6 py-5">
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
            </div>

            {/* Discount */}
            <div className="px-6 py-5">
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
            </div>

            {/* Line Items */}
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm font-medium text-on-surface">Line Items</p>
              {hasQuotation ? (
                <div className="rounded-md border border-outline-low p-4 bg-surface-high">
                  <p className="text-sm text-on-surface-medium">
                    Line items will be copied from the selected quotation automatically.
                  </p>
                </div>
              ) : (
                <>
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
                          onClick={() =>
                            setLineItems((prev) => prev.filter((_, i) => i !== index))
                          }
                          disabled={lineItems.length === 1}
                          className="text-on-surface-low hover:text-red-600 dark:hover:text-red-400 px-2"
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

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLineItems((prev) => [...prev, emptyRow()])}
                  >
                    <FiPlus className="h-4 w-4" />
                    Add Item
                  </Button>

                  <div className="rounded-md bg-surface-high border border-outline-low px-4 py-2 text-sm text-on-surface-medium">
                    Subtotal:{" "}
                    <span className="font-medium text-on-surface">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <FormStickyFooter
            cancelHref="/invoices"
            isPending={createInvoice.isPending}
            saveLabel="Create Invoice"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
