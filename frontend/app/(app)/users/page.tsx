"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiEye, FiEdit2, FiPlus, FiLoader, FiX, FiUserMinus } from "react-icons/fi";

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
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
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
      <Button onClick={() => setOpen(true)}>
        <FiPlus className="h-4 w-4" />
        Add User
      </Button>
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
                  <FiX className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? (
                    <FiLoader className="h-4 w-4 animate-spin" />
                  ) : (
                    <FiPlus className="h-4 w-4" />
                  )}
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
// Edit User Dialog (controlled)
// ---------------------------------------------------------------------------

function EditUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: StaffUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateUser = useUpdateUser(user.id);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: user.name, role: user.role as UserRole },
  });

  function onSubmit(values: EditValues) {
    updateUser.mutate(values, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                <FiX className="h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? (
                  <FiLoader className="h-4 w-4 animate-spin" />
                ) : null}
                {updateUser.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// View User Dialog
// ---------------------------------------------------------------------------

function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: StaffUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-medium">Name</span>
            <span className="text-on-surface font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">Email</span>
            <span className="text-on-surface">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">Role</span>
            <span className="text-on-surface">{capitalize(user.role)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-medium">Status</span>
            <StatusBadge isActive={user.is_active} />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <FiX className="h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
        <FiUserMinus className="h-4 w-4" />
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
              <FiX className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivate.isPending}
            >
              {deactivate.isPending ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : (
                <FiUserMinus className="h-4 w-4" />
              )}
              {deactivate.isPending ? "Deactivating…" : "Deactivate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Row actions with local dialog state
// ---------------------------------------------------------------------------

function UserRowActions({
  user,
  currentUserId,
  isOwner,
}: {
  user: StaffUser;
  currentUserId?: string;
  isOwner: boolean;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewOpen(true)}
          title="View"
        >
          <FiEye className="h-4 w-4" />
        </Button>
        {isOwner && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4" />
          </Button>
        )}
        {isOwner && user.id !== currentUserId && user.is_active && (
          <DeactivateDialog user={user} />
        )}
      </div>

      <ViewUserDialog user={user} open={viewOpen} onOpenChange={setViewOpen} />
      {isOwner && (
        <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
      )}
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

      {isLoading && <TableSkeleton cols={5} />}

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
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-0">
                    <EmptyState
                      variant="users"
                      title="No users found"
                      description="Add team members to manage access and roles."
                    />
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
                  <TableCell className="text-right">
                    <UserRowActions
                      user={user}
                      currentUserId={currentUser?.id}
                      isOwner={isOwner}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
