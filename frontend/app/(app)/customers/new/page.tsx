"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "lucide-react";
import { useCreateCustomer } from "@/lib/customers-api";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { FormPageShell, FormStickyFooter } from "@/components/layout/FormPageShell";
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
      name: "", phone: "", email: "", address: "", notes: "",
      company_name: "", contact_type: "", billing_address: "",
      dietary_restrictions: "", referral_source: "", gstin: "",
      preferred_payment_method: "", communication_preference: "",
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
    <FormPageShell
      backHref="/customers"
      backLabel="Back to Customers"
      icon={<Users className="h-5 w-5" />}
      title="New Customer"
      subtitle="Add a new customer to your contacts."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">
            <CustomerFormFields />
          </div>
          <FormStickyFooter
            cancelHref="/customers"
            isPending={createCustomer.isPending}
            saveLabel="Save Customer"
          />
        </form>
      </Form>
    </FormPageShell>
  );
}
