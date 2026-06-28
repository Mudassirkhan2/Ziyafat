"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCurrentUser } from "@/lib/auth";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeactivateUser,
} from "@/lib/users-api";
import type { StaffUser, UserRole } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["owner", "manager", "kitchen", "viewer"]),
});

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["owner", "manager", "kitchen", "viewer"]),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge className="bg-green-900/30 text-green-400 border-green-800">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-on-surface-low">
      Deactivated
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// Add User Dialog
// ---------------------------------------------------------------------------

function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", email: "", password: "", role: "viewer" },
  });

  function onSubmit(values: CreateValues) {
    createUser.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Add User</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Min 8 characters" {...field} />
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
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {createUser.isError && (
                <p className="text-sm text-red-400">Failed to create user. Try again.</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Creating…" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Edit User Dialog
// ---------------------------------------------------------------------------

function EditUserDialog({ user }: { user: StaffUser }) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser(user.id);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: user.name, role: user.role as UserRole },
  });

  function onSubmit(values: EditValues) {
    updateUser.mutate(values, {
      onSuccess: () => {
        setOpen(false);
      },
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
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
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {updateUser.isError && (
                <p className="text-sm text-red-400">Failed to update user. Try again.</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Deactivate Confirmation Dialog
// ---------------------------------------------------------------------------

function DeactivateDialog({ user }: { user: StaffUser }) {
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateUser();

  function handleDeactivate() {
    deactivate.mutate(user.id, {
      onSuccess: () => setOpen(false),
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-400 border-red-800 hover:bg-red-900/20"
        onClick={() => setOpen(true)}
      >
        Deactivate
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
          </DialogHeader>
          <p className="text-on-surface-medium text-sm">
            Are you sure you want to deactivate{" "}
            <span className="text-on-surface font-medium">{user.name}</span>? They
            will no longer be able to log in.
          </p>
          {deactivate.isError && (
            <p className="text-sm text-red-400">Failed to deactivate. Try again.</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivate.isPending}
            >
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function UsersPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: users, isLoading, isError } = useUsers();
  const isOwner = currentUser?.role === "owner";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Users</h1>
        {isOwner && <AddUserDialog />}
      </div>

      {isLoading && (
        <p className="text-on-surface-medium">Loading users…</p>
      )}

      {isError && (
        <p className="text-red-400">Failed to load users. Please try again.</p>
      )}

      {!isLoading && !isError && users && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">Email</TableHead>
                <TableHead className="text-on-surface-medium">Role</TableHead>
                <TableHead className="text-on-surface-medium">Status</TableHead>
                {isOwner && (
                  <TableHead className="text-on-surface-medium text-right">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isOwner ? 5 : 4}
                    className="text-center text-on-surface-low py-8"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id} className="border-outline-low">
                  <TableCell className="text-on-surface font-medium">
                    {user.name}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{capitalize(user.role)}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge isActive={user.is_active} />
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditUserDialog user={user} />
                        {user.id !== currentUser?.id && user.is_active && (
                          <DeactivateDialog user={user} />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
