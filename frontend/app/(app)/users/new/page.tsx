"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCreateUser } from "@/lib/users-api";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "kitchen", label: "Kitchen" },
  { value: "viewer", label: "Viewer" },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["owner", "manager", "kitchen", "viewer"]),
});

type FormValues = z.infer<typeof schema>;

export default function NewUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "viewer",
    },
  });

  function onSubmit(values: FormValues) {
    createUser.mutate(values, {
      onSuccess: () => { toast.success("User created."); router.push("/users"); },
      onError: () => toast.error("Failed to create user. Please try again."),
    });
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => router.push("/users")}
        className="text-on-surface-medium hover:text-on-surface text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Users
      </button>

      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-on-surface mb-6">New User</h1>

        <div className="rounded-lg border border-outline bg-surface-high p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput name="name" label="Name *" placeholder="Full name" />
              <FormInput name="email" label="Email *" type="email" placeholder="user@example.com" />
              <FormInput name="password" label="Password *" type="password" placeholder="Min. 8 characters" />
              <FormSelect name="role" label="Role *" placeholder="Select role" options={ROLES} />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => router.push("/users")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Creating…" : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
