"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";
import { FiPlus as PlusIcon } from "react-icons/fi";

import { useQuotation, useUpdateQuotation } from "@/lib/quotations-api";
import { useCurrencyStore } from "@/lib/currency-store";
import { getCurrencyMeta } from "@/lib/currencies";
import { toast } from "sonner";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormDatePicker } from "@/components/ui/form-fields";
import { FormPageShell } from "@/components/layout/FormPageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
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

interface LineItemRow {
  label: string;
  qty_per_plate: string;
  guest_count: string;
  unit_price: string;
}

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

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: quotation, isLoading, isError } = useQuotation(id);
  const updateQuotation = useUpdateQuotation(id);

  const fmt = useCurrencyStore((s) => s.format);
  const symbol = getCurrencyMeta(useCurrencyStore((s) => s.currencyCode)).symbol;

  const [lineItems, setLineItems] = useState<LineItemRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
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

  useEffect(() => {
    if (quotation && !initialized) {
      form.reset({
        valid_until: quotation.valid_until ? new Date(quotation.valid_until) : undefined,
        notes: quotation.notes ?? "",
        discount: String(quotation.discount ?? 0),
        service_charge_percentage: String(quotation.service_charge_percentage ?? 0),
        tax_percentage: String(quotation.tax_percentage ?? 0),
        gratuity_percentage: String(quotation.gratuity_percentage ?? 0),
        delivery_fee: String(quotation.delivery_fee ?? 0),
        setup_fee: String(quotation.setup_fee ?? 0),
        per_person_price: String(quotation.per_person_price ?? 0),
        deposit_amount: String(quotation.deposit_amount ?? 0),
        deposit_percentage: quotation.deposit_percentage != null ? String(quotation.deposit_percentage) : "",
        deposit_due_date: quotation.deposit_due_date ? new Date(quotation.deposit_due_date) : undefined,
        final_balance_due_date: quotation.final_balance_due_date ? new Date(quotation.final_balance_due_date) : undefined,
        minimum_guarantee_count: quotation.minimum_guarantee_count != null ? String(quotation.minimum_guarantee_count) : "",
        payment_terms_text: quotation.payment_terms_text ?? "",
        cancellation_policy_text: quotation.cancellation_policy_text ?? "",
      });
      setLineItems(
        quotation.line_items.map((item) => ({
          label: item.label,
          qty_per_plate: String(item.qty_per_plate),
          guest_count: String(item.guest_count),
          unit_price: String(item.unit_price),
        }))
      );
      setInitialized(true);
    }
  }, [quotation, initialized, form]);

  const discountValue = form.watch("discount") ?? "0";
  const subtotal = lineItems.reduce((sum, row) => sum + rowTotal(row), 0);
  const discount = parseFloat(discountValue) || 0;

  const serviceChargePerc = parseFloat(form.watch("service_charge_percentage") ?? "0") || 0;
  const taxPerc = parseFloat(form.watch("tax_percentage") ?? "0") || 0;
  const gratuityPerc = parseFloat(form.watch("gratuity_percentage") ?? "0") || 0;
  const deliveryFee = parseFloat(form.watch("delivery_fee") ?? "0") || 0;
  const setupFee = parseFloat(form.watch("setup_fee") ?? "0") || 0;

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
    const isDraft = quotation?.status === "draft";

    const body: Parameters<typeof updateQuotation.mutate>[0] = {
      valid_until: values.valid_until ? format(values.valid_until, "yyyy-MM-dd") : undefined,
      notes: values.notes || undefined,
      discount,
      subtotal,
      service_charge_percentage: serviceChargePerc,
      tax_percentage: taxPerc,
      gratuity_percentage: gratuityPerc,
      service_charge_amount: serviceChargeAmount,
      tax_amount: taxAmount,
      gratuity_amount: gratuityAmount,
      delivery_fee: deliveryFee,
      setup_fee: setupFee,
      total,
      per_person_price: parseFloat(values.per_person_price ?? "0") || 0,
      deposit_amount: parseFloat(values.deposit_amount ?? "0") || 0,
      deposit_percentage: values.deposit_percentage ? parseFloat(values.deposit_percentage) : undefined,
      deposit_due_date: values.deposit_due_date ? format(values.deposit_due_date, "yyyy-MM-dd") : undefined,
      final_balance_due_date: values.final_balance_due_date ? format(values.final_balance_due_date, "yyyy-MM-dd") : undefined,
      minimum_guarantee_count: values.minimum_guarantee_count ? parseInt(values.minimum_guarantee_count, 10) : undefined,
      payment_terms_text: values.payment_terms_text || undefined,
      cancellation_policy_text: values.cancellation_policy_text || undefined,
    };

    if (isDraft) {
      body.line_items = lineItems.map((row) => ({
        dish_id: null,
        label: row.label,
        qty_per_plate: parseFloat(row.qty_per_plate) || 0,
        guest_count: parseInt(row.guest_count, 10) || 0,
        unit_price: parseFloat(row.unit_price) || 0,
        total: rowTotal(row),
      }));
    }

    updateQuotation.mutate(body, {
      onSuccess: () => {
        toast.success("Quotation updated.");
        router.push(`/quotations/${id}`);
      },
      onError: () => toast.error("Failed to update quotation. Try again."),
    });
  }

  if (isLoading) return <div className="p-6 text-on-surface-medium">Loading…</div>;
  if (isError || !quotation) return <div className="p-6 text-red-600">Quotation not found.</div>;

  const isDraft = quotation.status === "draft";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormPageShell
          backHref={`/quotations/${id}`}
          backLabel="Back to Quotation"
          icon={<ClipboardList className="h-5 w-5" />}
          title="Edit Quotation"
          subtitle={`Version ${quotation.version} · ${quotation.status}`}
          actions={
            <>
              <button
                type="button"
                onClick={() => router.push(`/quotations/${id}`)}
                className="inline-flex items-center justify-center h-[38px] px-4 rounded-[10px] text-sm font-semibold border border-outline text-on-surface-medium hover:bg-surface-high hover:text-on-surface transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateQuotation.isPending}
                className="inline-flex items-center justify-center h-[38px] px-5 rounded-[10px] text-sm font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
                style={{
                  background: "linear-gradient(180deg, color-mix(in oklab, var(--secondary), #fff 12%), var(--secondary))",
                  color: "var(--secondary-foreground)",
                  boxShadow: "0 8px 22px -10px var(--secondary)",
                }}
              >
                {updateQuotation.isPending ? "Saving…" : "Save Changes"}
              </button>
            </>
          }
        >
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high [&_input]:h-9 [&_input]:text-sm">

            {/* Line Items — draft only */}
            {isDraft && (
              <div className="px-6 py-4 space-y-3">
                <p className="text-sm font-medium text-on-surface">Line Items</p>

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
                      onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== index))}
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
                  onClick={() => setLineItems((prev) => [...prev, { label: "", qty_per_plate: "", guest_count: "", unit_price: "" }])}
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Item
                </Button>

                <div className="rounded-md bg-surface-high border border-outline-low px-4 py-2 text-sm text-on-surface-medium">
                  Subtotal: <span className="font-medium text-on-surface">{fmt(subtotal)}</span>
                </div>
              </div>
            )}

            {/* Valid Until */}
            <div className="px-6 py-4">
              <FormDatePicker name="valid_until" label="Valid Until" />
            </div>

            {/* Notes */}
            <div className="px-6 py-4">
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

            {/* Pricing adjustments */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Pricing</p>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="discount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount ({symbol})</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="per_person_price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Per Person Price ({symbol})</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
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

              {/* Live total preview */}
              <div className="rounded-md bg-surface-high border border-outline-low px-4 py-3 text-sm space-y-1">
                {discount > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>After discount</span><span>{fmt(afterDiscount)}</span>
                  </div>
                )}
                {serviceChargePerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Service charge ({serviceChargePerc}%)</span><span>{fmt(serviceChargeAmount)}</span>
                  </div>
                )}
                {taxPerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Tax ({taxPerc}%)</span><span>{fmt(taxAmount)}</span>
                  </div>
                )}
                {gratuityPerc > 0 && (
                  <div className="flex justify-between text-on-surface-medium">
                    <span>Gratuity ({gratuityPerc}%)</span><span>{fmt(gratuityAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-on-surface border-t border-outline-low pt-1 mt-1">
                  <span>Total</span><span>{fmt(total)}</span>
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

            {/* Terms */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-sm font-medium text-on-surface">Terms</p>
              <FormField control={form.control} name="minimum_guarantee_count" render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Guarantee (guests)</FormLabel>
                  <FormControl><Input type="number" placeholder="Minimum guaranteed headcount" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
        </FormPageShell>
      </form>
    </Form>
  );
}
