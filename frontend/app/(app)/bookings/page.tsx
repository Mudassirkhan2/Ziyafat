"use client";

import { useRouter } from "next/navigation";
import { FiEye, FiEdit2, FiPlus } from "react-icons/fi";

import { useBookings } from "@/lib/bookings-api";
import type { Booking, BookingStatus } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-green-900/30 text-green-400 border-green-800",
  in_progress: "bg-blue-900/30 text-blue-400 border-blue-800",
  completed: "bg-surface-highest text-on-surface-medium border-outline",
  cancelled: "bg-red-900/30 text-red-400 border-red-800",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: BookingStatus }) {
  const label =
    status === "in_progress"
      ? "In Progress"
      : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={STATUS_COLORS[status]}>
      {label}
    </Badge>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BookingsPage() {
  const router = useRouter();

  const { data: bookings, isLoading, isError } = useBookings();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Bookings</h1>
        <Button onClick={() => router.push("/bookings/new")}>
          <FiPlus className="h-4 w-4" />
          New Booking
        </Button>
      </div>

      {/* Loading / Error */}
      {isLoading && <TableSkeleton cols={5} />}
      {isError && (
        <p className="text-red-400">Failed to load bookings. Please try again.</p>
      )}

      {/* Table */}
      {!isLoading && !isError && bookings && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Title</TableHead>
                <TableHead className="text-on-surface-medium">Customer</TableHead>
                <TableHead className="text-on-surface-medium">Status</TableHead>
                <TableHead className="text-on-surface-medium">Created</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-0">
                    <EmptyState
                      variant="bookings"
                      title="No bookings found"
                      description="Create your first booking to get started."
                    />
                  </TableCell>
                </TableRow>
              )}
              {bookings.map((booking: Booking) => (
                <TableRow
                  key={booking.id}
                  className="border-outline-low cursor-pointer hover:bg-surface-high transition-colors"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <TableCell className="text-on-surface font-medium">
                    {booking.title}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {booking.customer_name}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {formatDate(booking.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/bookings/${booking.id}`);
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
                          router.push(`/bookings/${booking.id}`);
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
