"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useLead, useUpdateLead, useConvertLead } from "@/lib/leads-api";
import type { LeadStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALL_STATUSES: LeadStatus[] = ["new", "quoted", "negotiating", "won", "lost"];

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  event_type: z.string().min(1, "Event type is required"),
  approx_date: z.string().optional(),
  approx_guest_count: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["new", "quoted", "negotiating", "won", "lost"]),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function EditLeadPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : (params.id?.[0] ?? "");

  const { data: lead, isLoading, isError } = useLead(id);
  const updateLead = useUpdateLead(id);
  const convertLead = useConvertLead();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      event_type: "",
      approx_date: "",
      approx_guest_count: "",
      source: "",
      notes: "",
      status: "new",
    },
  });

  // Pre-fill form once lead data is loaded
  useEffect(() => {
    if (lead) {
      form.reset({
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? "",
        event_type: lead.event_type,
        approx_date: lead.approx_date ?? "",
        approx_guest_count: lead.approx_guest_count?.toString() ?? "",
        source: lead.source ?? "",
        notes: lead.notes ?? "",
        status: lead.status,
      });
    }
  }, [lead, form]);

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      phone: values.phone,
      event_type: values.event_type,
      status: values.status,
      email: values.email || null,
      approx_date: values.approx_date || null,
      approx_guest_count: values.approx_guest_count
        ? parseInt(values.approx_guest_count, 10)
        : null,
      source: values.source || null,
      notes: values.notes || null,
    };

    updateLead.mutate(payload, {
      onSuccess: () => router.push("/leads"),
    });
  }

  function handleConvert() {
    if (!lead) return;
    convertLead.mutate(lead.id, {
      onSuccess: () => router.push("/customers"),
    });
  }

  const canConvert =
    lead && lead.status !== "won" && lead.status !== "lost";

  // ---------------------------------------------------------------------------
  // Loading / Error states
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-on-surface-medium">Loading lead…</p>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load lead. Please go back and try again.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/leads")}
        >
          ← Back to Leads
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  return (
    <div className="p-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push("/leads")}
        className="text-sm text-on-surface-medium hover:text-on-surface mb-6 flex items-center gap-1"
      >
        ← Back to Leads
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">Edit Lead</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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

              {(updateLead.isError || convertLead.isError) && (
                <p className="text-sm text-red-400">
                  {updateLead.isError
                    ? "Failed to save changes. Please try again."
                    : "Failed to convert lead. Please try again."}
                </p>
              )}

              <div className="flex items-center justify-between gap-2 pt-2">
                {/* Convert to Customer */}
                <div>
                  {canConvert && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-green-800 text-green-400 hover:bg-green-900/20"
                      onClick={handleConvert}
                      disabled={convertLead.isPending}
                    >
                      {convertLead.isPending ? "Converting…" : "Convert to Customer"}
                    </Button>
                  )}
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/leads")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateLead.isPending}>
                    {updateLead.isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
