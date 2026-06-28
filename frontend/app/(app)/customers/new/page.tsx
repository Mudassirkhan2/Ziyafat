"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateCustomer } from "@/lib/customers-api";
import type { Customer } from "@/lib/types";

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
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    const payload: Partial<Customer> = {
      name: values.name,
      phone: values.phone,
      email: values.email || null,
      address: values.address || null,
      notes: values.notes || null,
    };

    createCustomer.mutate(payload, {
      onSuccess: () => router.push("/customers"),
    });
  }

  return (
    <div className="p-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push("/customers")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Customers
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">New Customer</h1>

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
                      <Input placeholder="Full name" {...field} />
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Address (optional)" {...field} />
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

              {createCustomer.isError && (
                <p className="text-sm text-red-400">
                  Failed to create customer. Please try again.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/customers")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createCustomer.isPending}>
                  {createCustomer.isPending ? "Saving…" : "Save Customer"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
