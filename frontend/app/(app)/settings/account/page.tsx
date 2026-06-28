"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useOrg, useUpdateOrg } from "@/lib/organisation-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const accountSchema = z.object({
  name:    z.string().min(1, "Name is required"),
  slug:    z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  address: z.string().optional(),
  phone:   z.string().optional(),
  email:   z.string().email("Must be a valid email").optional().or(z.literal("")),
  tagline: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountSettingsPage() {
  const { data: org, isLoading } = useOrg();
  const updateOrg = useUpdateOrg();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: "", slug: "", address: "", phone: "", email: "", tagline: "" },
  });

  useEffect(() => {
    if (org) {
      form.reset({
        name:    org.name,
        slug:    org.slug,
        address: org.address ?? "",
        phone:   org.phone ?? "",
        email:   org.email ?? "",
        tagline: org.tagline ?? "",
      });
    }
  }, [org, form]);

  function onSubmit(values: AccountFormValues) {
    updateOrg.mutate({
      name:    values.name,
      slug:    values.slug,
      address: values.address || undefined,
      phone:   values.phone || undefined,
      email:   values.email || undefined,
      tagline: values.tagline || undefined,
    });
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
              <FormControl><Input placeholder="e.g. +91 98000 00000" {...field} /></FormControl>
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

        {updateOrg.isError && (
          <p className="text-sm text-red-400">Failed to save. Try again.</p>
        )}
        {updateOrg.isSuccess && (
          <p className="text-sm text-green-400">Saved successfully.</p>
        )}

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={updateOrg.isPending}>
            {updateOrg.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
