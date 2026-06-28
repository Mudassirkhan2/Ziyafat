"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateBooking } from "@/lib/bookings-api";
import { useCustomers } from "@/lib/customers-api";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  notes: z.string().optional(),
  deposit_amount: z.string().optional(),
  deposit_due_date: z.string().optional(),
  minimum_guarantee: z.string().optional(),
  payment_terms: z.string().optional(),
  cancellation_policy: z.string().optional(),
  special_instructions: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewBookingPage() {
  const router = useRouter();
  const createBooking = useCreateBooking();
  const { data: customersPage } = useCustomers({ pageSize: 100 });
  const customers = customersPage?.items ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: "",
      title: "",
      notes: "",
      deposit_amount: "",
      deposit_due_date: "",
      minimum_guarantee: "",
      payment_terms: "",
      cancellation_policy: "",
      special_instructions: "",
    },
  });

  function onSubmit(values: FormValues) {
    createBooking.mutate(
      {
        customer_id: values.customer_id,
        title: values.title,
        notes: values.notes || undefined,
        deposit_amount: values.deposit_amount ? parseFloat(values.deposit_amount) : undefined,
        deposit_due_date: values.deposit_due_date || undefined,
        minimum_guarantee: values.minimum_guarantee ? parseInt(values.minimum_guarantee, 10) : undefined,
        payment_terms: values.payment_terms || undefined,
        cancellation_policy: values.cancellation_policy || undefined,
        special_instructions: values.special_instructions || undefined,
      },
      { onSuccess: (booking) => router.push(`/bookings/${booking.id}`) },
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <button
          onClick={() => router.push("/bookings")}
          className="text-on-surface-medium hover:text-on-surface text-sm mb-2"
        >
          ← Back to Bookings
        </button>
        <h1 className="text-2xl font-bold text-on-surface">New Booking</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.company_name ? ` — ${c.company_name}` : ""}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ahmed's Wedding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deposit_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Advance deposit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deposit_due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="minimum_guarantee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Guarantee (guests)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Minimum guaranteed headcount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. 50% advance, balance on event day" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cancellation_policy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cancellation Policy</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g. No refund within 7 days of event" rows={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="special_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any special requirements for this booking" rows={2} {...field} />
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

          {createBooking.isError && (
            <p className="text-sm text-red-400">Failed to create booking. Try again.</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={createBooking.isPending}>
              {createBooking.isPending ? "Creating…" : "Create Booking"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/bookings")}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
