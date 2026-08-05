"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useOrg, useUpdateOrg } from "@/lib/organisation-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { CURRENCIES } from "@/lib/currencies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  tagline: z.string().optional(),
  website: z.string().optional(),
  gstin: z.string().optional(),
  default_service_charge_percentage: z.string().optional(),
  default_tax_rate: z.string().optional(),
  default_gratuity_percentage: z.string().optional(),
  invoice_prefix: z.string().optional(),
  quotation_prefix: z.string().optional(),
  default_payment_terms: z.string().optional(),
  default_cancellation_policy: z.string().optional(),
  currency_code: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountSettingsPage() {
  const { data: org, isLoading } = useOrg();
  const updateOrg = useUpdateOrg();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "", slug: "", address: "", phone: "", email: "", tagline: "",
      website: "", gstin: "",
      default_service_charge_percentage: "0",
      default_tax_rate: "0",
      default_gratuity_percentage: "0",
      invoice_prefix: "INV",
      quotation_prefix: "QT",
      default_payment_terms: "",
      default_cancellation_policy: "",
      currency_code: "INR",
    },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name: org.name,
        slug: org.slug,
        address: org.address ?? "",
        phone: org.phone ?? "",
        email: org.email ?? "",
        tagline: org.tagline ?? "",
        website: org.website ?? "",
        gstin: org.gstin ?? "",
        default_service_charge_percentage: String(org.default_service_charge_percentage ?? 0),
        default_tax_rate: String(org.default_tax_rate ?? 0),
        default_gratuity_percentage: String(org.default_gratuity_percentage ?? 0),
        invoice_prefix: org.invoice_prefix ?? "INV",
        quotation_prefix: org.quotation_prefix ?? "QT",
        default_payment_terms: org.default_payment_terms ?? "",
        default_cancellation_policy: org.default_cancellation_policy ?? "",
        currency_code: org.currency_code ?? "INR",
      });
    }
  }, [org, form]);

  function onSubmit(values: AccountFormValues) {
    updateOrg.mutate(
      {
        name: values.name,
        slug: values.slug,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        tagline: values.tagline || undefined,
        website: values.website || undefined,
        gstin: values.gstin || undefined,
        default_service_charge_percentage: values.default_service_charge_percentage
          ? parseFloat(values.default_service_charge_percentage)
          : undefined,
        default_tax_rate: values.default_tax_rate
          ? parseFloat(values.default_tax_rate)
          : undefined,
        default_gratuity_percentage: values.default_gratuity_percentage
          ? parseFloat(values.default_gratuity_percentage)
          : undefined,
        invoice_prefix: values.invoice_prefix || undefined,
        quotation_prefix: values.quotation_prefix || undefined,
        default_payment_terms: values.default_payment_terms || undefined,
        default_cancellation_policy: values.default_cancellation_policy || undefined,
        currency_code: values.currency_code || undefined,
      },
      {
        onSuccess: () => toast.success("Settings saved."),
        onError: () => toast.error("Failed to save settings. Please try again."),
      },
    );
  }

  if (isLoading) return <p className="text-on-surface-medium">Loading…</p>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Organisation Name *</FormLabel>
            <FormControl><Input placeholder="e.g. Al-Kareem Caterers" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl><Input placeholder="e.g. al-kareem-caterers" {...field} /></FormControl>
            <FormMessage />
            <p className="text-xs text-on-surface-low">Used in your public storefront URL: /storefront/{"{slug}"}</p>
          </FormItem>
        )} />

        <FormField control={form.control} name="tagline" render={({ field }) => (
          <FormItem>
            <FormLabel>Tagline</FormLabel>
            <FormControl><Input placeholder="e.g. Authentic Hyderabadi Catering" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl><Input placeholder="https://yoursite.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="gstin" render={({ field }) => (
            <FormItem>
              <FormLabel>GSTIN</FormLabel>
              <FormControl><Input placeholder="22AAAAA0000A1Z5" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="address" render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl><Textarea placeholder="Full address" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl><Input placeholder="+91 98000 00000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <Separator className="my-2" />
        <p className="text-sm font-medium text-on-surface">Invoice &amp; Billing Defaults</p>

          <FormField control={form.control} name="currency_code" render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {`${c.symbol} — ${c.name} (${c.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="default_service_charge_percentage" render={({ field }) => (
            <FormItem>
              <FormLabel>Service Charge (%)</FormLabel>
              <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="default_tax_rate" render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="default_gratuity_percentage" render={({ field }) => (
            <FormItem>
              <FormLabel>Gratuity (%)</FormLabel>
              <FormControl><Input type="number" step="0.1" placeholder="0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="invoice_prefix" render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Number Prefix</FormLabel>
              <FormControl><Input placeholder="INV" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="quotation_prefix" render={({ field }) => (
            <FormItem>
              <FormLabel>Quotation Number Prefix</FormLabel>
              <FormControl><Input placeholder="QT" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="default_payment_terms" render={({ field }) => (
          <FormItem>
            <FormLabel>Default Payment Terms</FormLabel>
            <FormControl><Textarea placeholder="e.g. 50% advance, balance on event day" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="default_cancellation_policy" render={({ field }) => (
          <FormItem>
            <FormLabel>Default Cancellation Policy</FormLabel>
            <FormControl><Textarea placeholder="e.g. No refund within 7 days of event" rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={updateOrg.isPending}>
            {updateOrg.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
