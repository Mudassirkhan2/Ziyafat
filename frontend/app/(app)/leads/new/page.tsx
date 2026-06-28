"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateLead } from "@/lib/leads-api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewLeadPage() {
  const router = useRouter();
  const createLead = useCreateLead();

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
    },
  });

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      phone: values.phone,
      event_type: values.event_type,
      email: values.email || undefined,
      approx_date: values.approx_date || undefined,
      approx_guest_count: values.approx_guest_count
        ? parseInt(values.approx_guest_count, 10)
        : undefined,
      source: values.source || undefined,
      notes: values.notes || undefined,
    };

    createLead.mutate(payload, {
      onSuccess: () => router.push("/leads"),
    });
  }

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
        <h1 className="text-2xl font-bold text-on-surface mb-6">New Lead</h1>

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

              {createLead.isError && (
                <p className="text-sm text-red-400">
                  Failed to create lead. Please try again.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/leads")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createLead.isPending}>
                  {createLead.isPending ? "Saving…" : "Save Lead"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
