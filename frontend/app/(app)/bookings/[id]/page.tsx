"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useBooking, useUpdateBooking } from "@/lib/bookings-api";
import {
  useBookingEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from "@/lib/events-api";
import type { BookingEvent, BookingStatus, CateringModel } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-green-900/30 text-green-400 border-green-800",
  in_progress: "bg-blue-900/30 text-blue-400 border-blue-800",
  completed: "bg-surface-highest text-on-surface-medium border-outline",
  cancelled: "bg-red-900/30 text-red-400 border-red-800",
};

const BOOKING_STATUSES: BookingStatus[] = [
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const eventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date: z.string().min(1, "Date is required"),
  venue: z.string().optional(),
  guest_count: z.string().min(1, "Guest count is required"),
  catering_model: z.enum(["per_plate", "chef_driven"]),
  notes: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusLabel(status: BookingStatus) {
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function cateringLabel(model: CateringModel) {
  return model === "per_plate" ? "Per Plate" : "Chef Driven";
}

// ---------------------------------------------------------------------------
// Event Sheet (Add / Edit)
// ---------------------------------------------------------------------------

type EventSheetMode =
  | { mode: "add" }
  | { mode: "edit"; event: BookingEvent };

function EventSheet({
  bookingId,
  sheetMode,
  open,
  onOpenChange,
}: {
  bookingId: string;
  sheetMode: EventSheetMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = sheetMode.mode === "edit";
  const event =
    isEdit ? (sheetMode as { mode: "edit"; event: BookingEvent }).event : undefined;

  const createEvent = useCreateEvent(bookingId);
  const updateEvent = useUpdateEvent(bookingId);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name ?? "",
      date: event?.date ?? "",
      venue: event?.venue ?? "",
      guest_count: event?.guest_count?.toString() ?? "",
      catering_model: event?.catering_model ?? "per_plate",
      notes: event?.notes ?? "",
    },
  });

  function onSubmit(values: EventFormValues) {
    const payload = {
      name: values.name,
      date: values.date,
      guest_count: parseInt(values.guest_count, 10),
      catering_model: values.catering_model,
      venue: values.venue || undefined,
      notes: values.notes || undefined,
    };

    if (isEdit && event) {
      updateEvent.mutate(
        { eventId: event.id, body: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      });
    }
  }

  const isMutating = createEvent.isPending || updateEvent.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Event" : "Add Event"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Nikah Ceremony" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grand Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guest_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Count *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 250" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="catering_model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catering Model *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select catering model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="per_plate">Per Plate</SelectItem>
                      <SelectItem value="chef_driven">Chef Driven</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(createEvent.isError || updateEvent.isError) && (
              <p className="text-sm text-red-400">
                Failed to {isEdit ? "update" : "create"} event. Try again.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating
                  ? isEdit
                    ? "Saving…"
                    : "Creating…"
                  : isEdit
                  ? "Save"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Delete Event Dialog
// ---------------------------------------------------------------------------

function DeleteEventDialog({
  bookingId,
  event,
}: {
  bookingId: string;
  event: BookingEvent;
}) {
  const [open, setOpen] = useState(false);
  const deleteEvent = useDeleteEvent(bookingId);

  function handleDelete() {
    deleteEvent.mutate(event.id, {
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
        Delete
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="text-on-surface-medium text-sm">
            Are you sure you want to delete{" "}
            <span className="text-on-surface font-medium">{event.name}</span>? This
            action cannot be undone.
          </p>
          {deleteEvent.isError && (
            <p className="text-sm text-red-400">Failed to delete event. Try again.</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteEvent.isPending}
            >
              {deleteEvent.isPending ? "Deleting…" : "Delete"}
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

export default function BookingDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: booking, isLoading: bookingLoading, isError: bookingError } = useBooking(id);
  const { data: events, isLoading: eventsLoading, isError: eventsError } = useBookingEvents(id);
  const updateBooking = useUpdateBooking(id);

  const [eventSheetOpen, setEventSheetOpen] = useState(false);
  const [eventSheetMode, setEventSheetMode] = useState<EventSheetMode>({ mode: "add" });

  function openAddEvent() {
    setEventSheetMode({ mode: "add" });
    setEventSheetOpen(true);
  }

  function openEditEvent(event: BookingEvent) {
    setEventSheetMode({ mode: "edit", event });
    setEventSheetOpen(true);
  }

  function handleStatusChange(status: string | null) {
    if (!status) return;
    updateBooking.mutate({ status: status as BookingStatus });
  }

  if (bookingLoading) {
    return (
      <div className="p-6">
        <p className="text-on-surface-medium">Loading booking…</p>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="p-6">
        <p className="text-red-400">Failed to load booking. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Link */}
      <Link
        href="/bookings"
        className="inline-flex items-center text-on-surface-medium hover:text-on-surface text-sm mb-6 transition-colors"
      >
        ← Back to Bookings
      </Link>

      {/* Booking Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface mb-2">{booking.title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-on-surface-medium text-sm">
            Customer:{" "}
            <span className="text-on-surface font-medium">{booking.customer_name}</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-on-surface-medium text-sm">Status:</span>
            <Select
              value={booking.status}
              onValueChange={handleStatusChange}
              disabled={updateBooking.isPending}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue>
                  <Badge
                    variant="outline"
                    className={BOOKING_STATUS_COLORS[booking.status]}
                  >
                    {statusLabel(booking.status)}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BOOKING_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {updateBooking.isError && (
          <p className="text-sm text-red-400 mt-2">
            Failed to update status. Try again.
          </p>
        )}
      </div>

      {/* Events Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-on-surface">Events</h2>
        <Button onClick={openAddEvent}>+ Add Event</Button>
      </div>

      {eventsLoading && (
        <p className="text-on-surface-medium">Loading events…</p>
      )}
      {eventsError && (
        <p className="text-red-400">Failed to load events. Please try again.</p>
      )}

      {!eventsLoading && !eventsError && events && (
        <div className="rounded-lg border border-outline overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-high">
                <TableHead className="text-on-surface-medium">Name</TableHead>
                <TableHead className="text-on-surface-medium">Date</TableHead>
                <TableHead className="text-on-surface-medium">Venue</TableHead>
                <TableHead className="text-on-surface-medium">Guests</TableHead>
                <TableHead className="text-on-surface-medium">Catering</TableHead>
                <TableHead className="text-on-surface-medium text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-on-surface-low py-8"
                  >
                    No events yet. Add the first event for this booking.
                  </TableCell>
                </TableRow>
              )}
              {events.map((event: BookingEvent) => (
                <TableRow key={event.id} className="border-outline-low">
                  <TableCell className="text-on-surface font-medium">
                    {event.name}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {formatDate(event.date)}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {event.venue ?? "—"}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {event.guest_count}
                  </TableCell>
                  <TableCell className="text-on-surface-medium">
                    {cateringLabel(event.catering_model)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditEvent(event)}
                      >
                        Edit
                      </Button>
                      <DeleteEventDialog bookingId={id} event={event} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Event Sheet */}
      <EventSheet
        bookingId={id}
        sheetMode={eventSheetMode}
        open={eventSheetOpen}
        onOpenChange={setEventSheetOpen}
      />
    </div>
  );
}
