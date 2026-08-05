"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { FiPlus } from "react-icons/fi";

import { useCreateQuotation } from "@/lib/quotations-api";
import { useBookingsForSelect } from "@/lib/bookings-api";
import { useBookingEvents } from "@/lib/events-api";
import { useDishesForSelect } from "@/lib/dishes-api";
import { useCurrencyStore } from "@/lib/currency-store";
import { getCurrencyMeta } from "@/lib/currencies";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormDatePicker } from "@/components/ui/form-fields";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  booking_id: z.string().min(1, "Booking is required"),
  event_id: z.string().optional(),
  valid_until: z.date().optional(),
  notes: z.string().optional(),
  discount: z.string().optional(),
  service_charge_percentage: z.string().optional(),
  tax_percentage: z.string().optional(),
  gratuity_percentage: z.string().optional(),
  delivery_fee: z.string().optional(),
  setup_fee: z.string().optional(),
  per_person_price: z.string().optional(),
  deposit_amount: z.string().optional(),
  deposit_percentage: z.string().optional(),
  deposit_due_date: z.date().optional(),
  final_balance_due_date: z.date().optional(),
  minimum_guarantee_count: z.string().optional(),
  payment_terms_text: z.string().optional(),
  cancellation_policy_text: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Line item helpers
// ---------------------------------------------------------------------------

interface LineItemRow {
  dish_id: string | null;
  label: string;
  qty_per_plate: string;
  guest_count: string;
  unit_price: string;
}

const emptyRow = (): LineItemRow => ({
  dish_id: null,
  label: "",
  qty_per_plate: "1",
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

function NewQuotationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefilledBookingId = searchParams.get("booking_id") ?? "";
  const prefilledEventId = searchParams.get("event_id") ?? "";

  const createQuotation = useCreateQuotation();

  const { data: bookingsPage } = useBookingsForSelect();
  const bookings = bookingsPage?.items ?? [];

  const { data: dishesPage } = useDishesForSelect();
  // Stable reference — avoids effect thrashing on every render
  const allDishes = useMemo(() => dishesPage?.items ?? [], [dishesPage]);

  const fmt = useCurrencyStore((s) => s.format);
  const symbol = getCurrencyMeta(useCurrencyStore((s) => s.currencyCode)).symbol;

  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyRow()]);
  const [autoLoaded, setAutoLoaded] = useState(false);
  // Track which event ID we've already populated to avoid re-triggering on unrelated renders
  const [populatedForEventId, setPopulatedForEventId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      booking_id: prefilledBookingId,
      event_id: prefilledEventId,
      valid_until: undefined,
      notes: "",
      discount: "0",
      service_charge_percentage: "0",
      tax_percentage: "0",
      gratuity_percentage: "0",
      delivery_fee: "0",
      setup_fee: "0",
      per_person_price: "0",
      deposit_amount: "0",
      deposit_percentage: "",
      deposit_due_date: undefined,
      final_balance_due_date: undefined,
      minimum_guarantee_count: "",
      payment_terms_text: "",
      cancellation_policy_text: "",
    },
  });

  const selectedBookingId = form.watch("booking_id");
  const selectedEventId = form.watch("event_id");

  const { data: events } = useBookingEvents(selectedBookingId);

  const selectedEvent = events?.find((e) => e.id === selectedEventId);
  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);

  // Populate line items from event menu once both event and dishes are loaded
  useEffect(() => {
    if (!selectedEvent || allDishes.length === 0) return;
    if (populatedForEventId === selectedEvent.id) return; // already done for this event

    const menuDishIds = selectedEvent.menu_dish_ids ?? [];
    if (menuDishIds.length === 0) return;

    const rows: LineItemRow[] = menuDishIds
      .map((dishId) => allDishes.find((d) => d.id === dishId))
      .filter((d): d is NonNullable<typeof d> => d != null)
      .map((dish) => ({
        dish_id: dish.id,
        label: dish.name,
        qty_per_plate: "1",
        guest_count: String(selectedEvent.guest_count),
        unit_price: String(dish.selling_price),
      }));

    if (rows.length > 0) {
      setLineItems(rows);
      setAutoLoaded(true);
      setPopulatedForEventId(selectedEvent.id);
    }
  }, [selectedEvent, allDishes, populatedForEventId]);

  // Recalculate totals live
  const discountValue = form.watch("discount") ?? "0";
  const serviceChargePerc = parseFloat(form.watch("service_charge_percentage") ?? "0") || 0;
  const taxPerc = parseFloat(form.watch("tax_percentage") ?? "0") || 0;
  const gratuityPerc = parseFloat(form.watch("gratuity_percentage") ?? "0") || 0;
  const deliveryFee = parseFloat(form.watch("delivery_fee") ?? "0") || 0;
  const setupFee = parseFloat(form.watch("setup_fee") ?? "0") || 0;

  const subtotal = lineItems.reduce((sum, row) => sum + rowTotal(row), 0);
  const discount = parseFloat(discountValue) || 0;
  const afterDiscount = subtotal - discount;
  const serviceChargeAmount = afterDiscount * (serviceChargePerc / 100);
  const taxAmount = afterDiscount * (taxPerc / 100);
  const gratuityAmount = afterDiscount * (gratuityPerc / 100);
  const total = afterDiscount + serviceChargeAmount + taxAmount + gratuityAmount + deliveryFee + setupFee;

  function updateRow(index: number, field: keyof LineItemRow, value: string) {
    setLineItems((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function onSubmit(values: FormValues) {
    createQuotation.mutate(
      {
        booking_id: values.booking_id,
        event_id: values.event_id || undefined,
        valid_until: values.valid_until ? format(values.valid_until, "yyyy-MM-dd") : undefined,
        notes: values.notes || undefined,
        line_items: lineItems.map((row) => ({
          dish_id: row.dish_id,
          label: row.label,
          qty_per_plate: parseFloat(row.qty_per_plate) || 0,
          guest_count: parseInt(row.guest_count, 10) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
          total: rowTotal(row),
        })),
        subtotal,
        discount,
        total,
        service_charge_percentage: serviceChargePerc,
        tax_percentage: taxPerc,
        gratuity_percentage: gratuityPerc,
        service_charge_amount: serviceChargeAmount,
        tax_amount: taxAmount,
        gratuity_amount: gratuityAmount,
        delivery_fee: deliveryFee,
        setup_fee: setupFee,
        per_person_price: parseFloat(values.per_person_price ?? "0") || 0,
        deposit_amount: parseFloat(values.deposit_amount ?? "0") || 0,
        deposit_percentage: values.deposit_percentage ? parseFloat(values.deposit_percentage) : undefined,
        deposit_due_date: values.deposit_due_date ? format(values.deposit_due_date, "yyyy-MM-dd") : undefined,
        final_balance_due_date: values.final_balance_due_date ? format(values.final_balance_due_date, "yyyy-MM-dd") : undefined,
        minimum_guarantee_count: values.minimum_guarantee_count ? parseInt(values.minimum_guarantee_count, 10) : undefined,
        payment_terms_text: values.payment_terms_text || undefined,
        cancellation_policy_text: values.cancellation_policy_text || undefined,
      },
      {
        onSuccess: (q) => {
          toast.success("Quotation created.");
          router.push(`/quotations/${q.id}`);
        },
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
      subtitle="Select a booking and event to auto-populate dishes, or add line items manually."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high [&_input]:h-9 [&_input]:text-sm">

            {/* Booking */}
            <div className="px-6 py-4">
              <FormField
                control={form.control}
                name="booking_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking *</FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("event_id", "");
                        setLineItems([emptyRow()]);
                        setAutoLoaded(false);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select a booking">
                            {selectedBooking?.title}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bookings.map((b) => (
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

            {/* Event — shows once booking is picked */}
            {selectedBookingId && (
              <div className="px-6 py-4">
                <FormField
                  control={form.control}
                  name="event_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          setLineItems([emptyRow()]);
                          setAutoLoaded(false);
                          setPopulatedForEventId(null);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select an event (optional)">
                              {selectedEvent
                                ? `${selectedEvent.name} — ${selectedEvent.guest_count} guests`
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(events ?? []).map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                              {e.name} — {e.guest_count} guests
                              {(e.menu_dish_ids?.length ?? 0) > 0
                                ? ` · ${e.menu_dish_ids.length} dishes`
                                : " · no menu yet"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(events ?? []).length === 0 && (
                        <p className="text-xs text-on-surface-low mt-1">
                          No events found for this booking. You can still create a quotation with manual line items.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Line Items */}
            <div className="px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-on-surface">Line Items</p>
                {autoLoaded && (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    Auto-loaded from event menu
                  </Badge>
                )}
              </div>

              {/* Column headers */}
              <div className="grid items-center gap-2 px-1" style={{ gridTemplateColumns: "1fr 5rem 5rem 7rem 6rem 2rem" }}>
                <p className="text-xs text-on-surface-low">Item</p>
                <p className="text-xs text-on-surface-low text-center">Qty/Plate</p>
                <p className="text-xs text-on-surface-low text-center">Guests</p>
                <p className="text-xs text-on-surface-low">Unit Price</p>
                <p className="text-xs text-on-surface-low text-right">Total</p>
                <span />
              </div>

              {lineItems.map((row, index) => (
                <div
                  key={index}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "1fr 5rem 5rem 7rem 6rem 2rem" }}
                >
                  <Input
                    placeholder="Item label (e.g. Biryani)"
                    value={row.label}
                    onChange={(e) => updateRow(index, "label", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="1"
                    value={row.qty_per_plate}
                    onChange={(e) => updateRow(index, "qty_per_plate", e.target.value)}
                    className="text-center"
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={row.guest_count}
                    onChange={(e) => updateRow(index, "guest_count", e.target.value)}
                    className="text-center"
                  />
                  <Input
                    type="number"
                    placeholder="0"
                    value={row.unit_price}
                    onChange={(e) => updateRow(index, "unit_price", e.target.value)}
                  />
                  <p className="text-xs text-on-surface-medium text-right tabular-nums">
                    {fmt(rowTotal(row))}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setLineItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    disabled={lineItems.length === 1}
                    className="text-on-surface-low hover:text-red-600 dark:hover:text-red-400 px-1 h-8 w-8"
                  >
                    ✕
                  </Button>
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
            </div>

            {/* Pricing */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Pricing</p>

              <FormField control={form.control} name="discount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount ({symbol})</FormLabel>
                  <FormControl><Input type="number" step="0.01" defaultValue="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="service_charge_percentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tax_percentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gratuity_percentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gratuity (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="delivery_fee" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Fee ({symbol})</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="setup_fee" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setup Fee ({symbol})</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="per_person_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Per Person Price ({symbol})</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Live total summary */}
              <div className="rounded-md bg-surface-high border border-outline-low px-4 py-3 text-sm space-y-1">
                <div className="flex justify-between text-on-surface-medium">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Discount</span>
                    <span>− {fmt(discount)}</span>
                  </div>
                )}
                {serviceChargePerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Service Charge ({serviceChargePerc}%)</span>
                    <span>{fmt(serviceChargeAmount)}</span>
                  </div>
                )}
                {taxPerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Tax ({taxPerc}%)</span>
                    <span>{fmt(taxAmount)}</span>
                  </div>
                )}
                {gratuityPerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Gratuity ({gratuityPerc}%)</span>
                    <span>{fmt(gratuityAmount)}</span>
                  </div>
                )}
                {(deliveryFee > 0 || setupFee > 0) && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Fees</span>
                    <span>{fmt(deliveryFee + setupFee)}</span>
                  </div>
                )}
                <Separator className="my-1 border-outline-low" />
                <div className="flex justify-between font-semibold text-on-surface">
                  <span>Total</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Deposit */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Deposit</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="deposit_amount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit Amount ({symbol})</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="deposit_percentage" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit (%)</FormLabel>
                    <FormControl><Input type="number" step="0.01" placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormDatePicker name="deposit_due_date" label="Deposit Due Date" />
                <FormDatePicker name="final_balance_due_date" label="Balance Due Date" />
              </div>
            </div>

            {/* Validity & Notes */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Details</p>
              <FormDatePicker name="valid_until" label="Valid Until" />
              <FormField control={form.control} name="minimum_guarantee_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Guarantee (guests)</FormLabel>
                  <FormControl><Input type="number" placeholder="Minimum guaranteed headcount" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea placeholder="Any notes for the customer…" rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Terms */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Terms</p>
              <FormField control={form.control} name="payment_terms_text" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <FormControl><Textarea placeholder="e.g. 50% advance, balance on event day" rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="cancellation_policy_text" render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Policy</FormLabel>
                  <FormControl><Textarea placeholder="e.g. No refund within 7 days of event" rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-6 text-on-surface-medium">Loading…</div>}>
      <NewQuotationForm />
    </Suspense>
  );
}
