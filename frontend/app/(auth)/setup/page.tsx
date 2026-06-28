"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const setupSchema = z
  .object({
    org_name: z.string().min(2, "Organisation name required"),
    org_slug: z
      .string()
      .min(2, "Slug required")
      .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
    org_phone: z.string().optional(),
    org_email: z.string().email().optional().or(z.literal("")),
    org_address: z.string().optional(),
    org_tagline: z.string().optional(),
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color"),
    on_primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    on_secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    logo_alignment: z.enum(["left", "center", "right"]),
    owner_name: z.string().min(2, "Name required"),
    owner_email: z.string().email("Valid email required"),
    owner_password: z.string().min(8, "At least 8 characters"),
    owner_password_confirm: z.string(),
  })
  .refine((d) => d.owner_password === d.owner_password_confirm, {
    message: "Passwords do not match",
    path: ["owner_password_confirm"],
  });

type SetupValues = z.infer<typeof setupSchema>;

const STEPS = ["Organisation", "Branding", "Report Preferences", "Owner Account"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SetupValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      org_name: "",
      org_slug: "",
      org_phone: "",
      org_email: "",
      org_address: "",
      org_tagline: "",
      primary: "#d97706",
      on_primary: "#0c0a09",
      secondary: "#f59e0b",
      on_secondary: "#0c0a09",
      logo_alignment: "left",
      owner_name: "",
      owner_email: "",
      owner_password: "",
      owner_password_confirm: "",
    },
  });

  const stepFields: (keyof SetupValues)[][] = [
    ["org_name", "org_slug", "org_phone", "org_email", "org_address", "org_tagline"],
    ["primary", "on_primary", "secondary", "on_secondary"],
    ["logo_alignment"],
    ["owner_name", "owner_email", "owner_password", "owner_password_confirm"],
  ];

  async function nextStep() {
    const valid = await form.trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function onSubmit(values: SetupValues) {
    setSubmitting(true);
    try {
      await api.post("/setup", {
        org_name: values.org_name,
        org_slug: values.org_slug,
        org_phone: values.org_phone || null,
        org_email: values.org_email || null,
        org_address: values.org_address || null,
        org_tagline: values.org_tagline || null,
        primary: values.primary,
        on_primary: values.on_primary,
        primary_container: "#451a03",
        on_primary_container: "#fed7aa",
        secondary: values.secondary,
        on_secondary: values.on_secondary,
        secondary_container: "#78350f",
        on_secondary_container: "#fde68a",
        owner_name: values.owner_name,
        owner_email: values.owner_email,
        owner_password: values.owner_password,
      });
      router.push("/login");
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "Setup failed",
      });
      setSubmitting(false);
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Card className="w-full max-w-lg bg-surface-high border-outline">
      <CardHeader>
        <div className="text-primary text-2xl font-bold mb-2">Ziyafat</div>
        <CardTitle className="text-on-surface">Setup — {STEPS[step]}</CardTitle>
        <Progress value={progress} className="mt-3 h-1.5" />
        <p className="text-on-surface-low text-sm mt-1">
          Step {step + 1} of {STEPS.length}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 0 && (
              <>
                <FormField control={form.control} name="org_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Organisation Name *</FormLabel>
                    <FormControl>
                      <Input className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="org_slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">URL Slug *</FormLabel>
                    <FormControl>
                      <Input
                        className="bg-surface border-outline text-on-surface"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="org_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Phone</FormLabel>
                    <FormControl>
                      <Input className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="org_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Business Email</FormLabel>
                    <FormControl>
                      <Input type="email" className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="org_address" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Address</FormLabel>
                    <FormControl><Input className="bg-surface border-outline text-on-surface" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="org_tagline" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Tagline</FormLabel>
                    <FormControl><Input className="bg-surface border-outline text-on-surface" placeholder="e.g. Authentic Hyderabadi flavours" {...field} /></FormControl>
                  </FormItem>
                )} />
              </>
            )}

            {step === 1 && (
              <>
                <p className="text-on-surface-medium text-sm">Choose your brand colors. These will be used across the app and in printed reports.</p>
                <div className="grid grid-cols-2 gap-4">
                  {(["primary", "on_primary", "secondary", "on_secondary"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-on-surface-medium capitalize">{name.replace(/_/g, " ")}</FormLabel>
                        <div className="flex gap-2 items-center">
                          <input type="color" value={field.value} onChange={(e) => field.onChange(e.target.value)}
                            className="h-9 w-12 rounded border-outline cursor-pointer" />
                          <FormControl>
                            <Input className="bg-surface border-outline text-on-surface font-mono text-sm" {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </div>
                <div className="rounded-lg p-4 mt-2 border border-outline" style={{
                  backgroundColor: form.watch("primary"),
                  color: form.watch("on_primary"),
                }}>
                  Preview: Button in your primary color
                </div>
              </>
            )}

            {step === 2 && (
              <FormField control={form.control} name="logo_alignment" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-on-surface-medium">Logo alignment in printed reports</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="gap-3 mt-2">
                      {(["left", "center", "right"] as const).map((v) => (
                        <div key={v} className="flex items-center gap-3 rounded-lg border border-outline p-3 cursor-pointer hover:border-primary">
                          <RadioGroupItem value={v} id={v} />
                          <Label htmlFor={v} className="text-on-surface cursor-pointer capitalize">{v}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {step === 3 && (
              <>
                <FormField control={form.control} name="owner_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Your Name *</FormLabel>
                    <FormControl>
                      <Input className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="owner_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Your Email *</FormLabel>
                    <FormControl>
                      <Input type="email" className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="owner_password" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Password *</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="owner_password_confirm" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-on-surface-medium">Confirm Password *</FormLabel>
                    <FormControl>
                      <Input type="password" className="bg-surface border-outline text-on-surface" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </>
            )}

            {form.formState.errors.root && (
              <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}
                  className="flex-1 border-outline text-on-surface">
                  Back
                </Button>
              )}
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}
                  className="flex-1 bg-primary text-on-primary hover:opacity-90">
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}
                  className="flex-1 bg-primary text-on-primary hover:opacity-90">
                  {submitting ? "Setting up…" : "Complete Setup"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
