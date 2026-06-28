"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useUser, useUpdateUser, useDeactivateUser } from "@/lib/users-api";
import type { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiLoader, FiUserX } from "react-icons/fi";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "manager", label: "Manager" },
  { value: "kitchen", label: "Kitchen" },
  { value: "viewer", label: "Viewer" },
];

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["owner", "manager", "kitchen", "viewer"]),
});

type FormValues = z.infer<typeof schema>;

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const { data: user, isLoading, isError } = useUser(id);
  const updateUser = useUpdateUser(id);
  const deactivateUser = useDeactivateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", role: "viewer" },
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name, role: user.role as UserRole });
    }
  }, [user]);

  function onSubmit(values: FormValues) {
    updateUser.mutate(values, {
      onSuccess: () => router.push("/users"),
    });
  }

  function handleDeactivate() {
    deactivateUser.mutate(id, {
      onSuccess: () => {
        setDeactivateOpen(false);
        router.push("/users");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center gap-2 text-on-surface-medium">
        <FiLoader className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6">
        <p className="text-destructive">Failed to load user.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/users")}>
          ← Back to Users
        </Button>
      </div>
    );
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-on-surface">{user.name}</h1>
          <p className="text-sm text-on-surface-medium">{user.email}</p>
          {!user.is_active && (
            <span className="inline-block mt-1 text-xs text-destructive border border-destructive/30 rounded px-2 py-0.5">
              Deactivated
            </span>
          )}
        </div>

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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {updateUser.isError && (
                <p className="text-sm text-destructive">
                  Failed to save changes. Please try again.
                </p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  onClick={() => setDeactivateOpen(true)}
                  disabled={!user.is_active}
                >
                  <FiUserX className="h-4 w-4 mr-1" />
                  {user.is_active ? "Deactivate" : "Deactivated"}
                </Button>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/users")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUser.isPending}>
                    {updateUser.isPending ? (
                      <><FiLoader className="h-4 w-4 mr-1 animate-spin" /> Saving…</>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate {user.name}?</DialogTitle>
            <DialogDescription>
              This will prevent the user from logging in. Contact an owner to reactivate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateUser.isPending}
            >
              {deactivateUser.isPending ? (
                <><FiLoader className="h-4 w-4 mr-1 animate-spin" /> Deactivating…</>
              ) : (
                <><FiUserX className="h-4 w-4 mr-1" /> Deactivate</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
