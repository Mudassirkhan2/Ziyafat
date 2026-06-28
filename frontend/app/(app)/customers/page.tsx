"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { FiEye, FiEdit2, FiPlus } from "react-icons/fi";

import { useCustomers } from "@/lib/customers-api";
import type { Customer } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

export default function CustomersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: customers, isLoading, isError } = useCustomers(search);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Customers</h1>
        <Button onClick={() => router.push("/customers/new")}>
          <FiPlus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search customers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Loading / Error */}
      {isLoading && <TableSkeleton cols={5} />}
      {isError && (
        <p className="text-red-400">Failed to load customers. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && customers && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">Phone</TableHead>
                <TableHead className="text-on-surface-medium">Email</TableHead>
                <TableHead className="text-on-surface-medium">Notes</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-0">
                    <EmptyState
                      variant="customers"
                      title="No customers found"
                      description="Add your first customer to begin managing bookings."
                    />
                  </TableCell>
                </TableRow>
              )}
              {customers.map((customer: Customer) => (
                <TableRow
                  key={customer.id}
                  className="border-outline-low cursor-pointer hover:bg-surface-high transition-colors"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell className="text-on-surface font-medium">
                    {customer.name}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {customer.phone}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {customer.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-on-surface-medium max-w-xs truncate">
                    {customer.notes ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/customers/${customer.id}`);
                        }}
                        title="View"
                      >
                        <FiEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/customers/${customer.id}`);
                        }}
                        title="Edit"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </Button>
                    </div>
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
