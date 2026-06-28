"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCreateCustomer } from "@/lib/customers-api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  customerSchema,
  type CustomerFormValues,
  CustomerFormFields,
} from "@/components/forms/CustomerFormFields";

export default function NewCustomerPage() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      company_name: "",
      contact_type: "",
      billing_address: "",
      dietary_restrictions: "",
      referral_source: "",
      gstin: "",
      preferred_payment_method: "",
      communication_preference: "",
    },
  });

  function onSubmit(values: CustomerFormValues) {
    createCustomer.mutate(
      {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        address: values.address || null,
        notes: values.notes || null,
        company_name: values.company_name || null,
        contact_type: (values.contact_type as never) || null,
        billing_address: values.billing_address || null,
        dietary_restrictions: values.dietary_restrictions || null,
        referral_source: values.referral_source || null,
        gstin: values.gstin || null,
        preferred_payment_method: values.preferred_payment_method || null,
        communication_preference: values.communication_preference || null,
      },
      {
        onSuccess: () => { toast.success("Customer saved."); router.push("/customers"); },
        onError: () => toast.error("Failed to create customer. Please try again."),
      },
    );
  }

  return (
    <div className="p-6">
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
              <CustomerFormFields />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/customers")}>
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
