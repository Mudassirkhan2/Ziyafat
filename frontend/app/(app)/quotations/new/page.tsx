"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

import { useCreateQuotation } from "@/lib/quotations-api";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { toast } from "sonner";

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

const quotationSchema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  valid_until: z.date().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

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

export default function NewQuotationPage() {
  const router = useRouter();
  const createQuotation = useCreateQuotation();
  const { data: bookings } = useBookingsForSelect();

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      booking_id: "",
      valid_until: undefined,
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

  function onSubmit(values: QuotationFormValues) {
    createQuotation.mutate(
      {
        booking_id: values.booking_id,
        valid_until: values.valid_until ? format(values.valid_until, "yyyy-MM-dd") : undefined,
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
      },
      {
        onSuccess: () => { toast.success("Quotation created."); router.push("/quotations"); },
        onError: () => toast.error("Failed to create quotation. Try again."),
      }
    );
  }

  return (
    <FormPageShell
      backHref="/quotations"
      backLabel="Back to Quotations"
      icon={<ClipboardList className="h-5 w-5" />}
      title="New Quotation"
      subtitle="Create a quotation for a booking to share with your customer."
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
                    <Select onValueChange={field.onChange} value={field.value}>
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

            {/* Valid Until */}
            <div className="px-6 py-5">
              <FormDatePicker name="valid_until" label="Valid Until" />
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
            </div>
          </div>

          <FormStickyFooter
            cancelHref="/quotations"
            isPending={createQuotation.isPending}
            saveLabel="Create Quotation"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
