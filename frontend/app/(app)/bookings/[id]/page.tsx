"use client";

import { useState, useEffect } from "react";
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
  useUpdateEventById,
  useDeleteEvent,
} from "@/lib/events-api";
import { useDishes } from "@/lib/dishes-api";
import type { BookingEvent, BookingStatus, CateringModel } from "@/lib/types";
import {
  CEREMONY_TYPE_OPTIONS,
  SERVICE_STYLE_OPTIONS,
  FOOD_PREFERENCE_OPTIONS,
  EVENT_STATUS_OPTIONS,
} from "@/lib/constants";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
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
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue: z.string().optional(),
  venue_address: z.string().optional(),
  venue_contact: z.string().optional(),
  guest_count: z.string().min(1, "Guest count is required"),
  veg_count: z.string().optional(),
  non_veg_count: z.string().optional(),
  confirmed_count: z.string().optional(),
  actual_headcount: z.string().optional(),
  catering_model: z.enum(["per_plate", "chef_driven"]),
  ceremony_type: z.string().optional(),
  service_style: z.string().optional(),
  food_preference: z.string().optional(),
  event_status: z.string().optional(),
  room_setup_style: z.string().optional(),
  staffing_count: z.string().optional(),
  equipment_needed: z.string().optional(),
  kitchen_notes: z.string().optional(),
  access_instructions: z.string().optional(),
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
      start_time: event?.start_time ?? "",
      end_time: event?.end_time ?? "",
      venue: event?.venue ?? "",
      venue_address: event?.venue_address ?? "",
      venue_contact: event?.venue_contact ?? "",
      guest_count: event?.guest_count?.toString() ?? "",
      veg_count: event?.veg_count?.toString() ?? "",
      non_veg_count: event?.non_veg_count?.toString() ?? "",
      confirmed_count: event?.confirmed_count?.toString() ?? "",
      actual_headcount: event?.actual_headcount?.toString() ?? "",
      catering_model: event?.catering_model ?? "per_plate",
      ceremony_type: event?.ceremony_type ?? "",
      service_style: event?.service_style ?? "",
      food_preference: event?.food_preference ?? "",
      event_status: event?.event_status ?? "",
      room_setup_style: event?.room_setup_style ?? "",
      staffing_count: event?.staffing_requirements?.toString() ?? "",
      equipment_needed: event?.equipment_needed ?? "",
      kitchen_notes: event?.kitchen_notes ?? "",
      access_instructions: event?.access_instructions ?? "",
      notes: event?.notes ?? "",
    },
  });

  function onSubmit(values: EventFormValues) {
    const payload = {
      name: values.name,
      date: values.date,
      start_time: values.start_time || undefined,
      end_time: values.end_time || undefined,
      venue: values.venue || undefined,
      venue_address: values.venue_address || undefined,
      venue_contact: values.venue_contact || undefined,
      guest_count: parseInt(values.guest_count, 10),
      veg_count: values.veg_count ? parseInt(values.veg_count, 10) : undefined,
      non_veg_count: values.non_veg_count ? parseInt(values.non_veg_count, 10) : undefined,
      confirmed_count: values.confirmed_count ? parseInt(values.confirmed_count, 10) : undefined,
      actual_headcount: values.actual_headcount ? parseInt(values.actual_headcount, 10) : undefined,
      catering_model: values.catering_model,
      ceremony_type: (values.ceremony_type as never) || undefined,
      service_style: (values.service_style as never) || undefined,
      food_preference: (values.food_preference as never) || undefined,
      event_status: (values.event_status as never) || undefined,
      room_setup_style: values.room_setup_style || undefined,
      staffing_requirements: values.staffing_count ? parseInt(values.staffing_count, 10) : undefined,
      equipment_needed: values.equipment_needed || undefined,
      kitchen_notes: values.kitchen_notes || undefined,
      access_instructions: values.access_instructions || undefined,
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

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl><Input type="time" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="ceremony_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ceremony Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CEREMONY_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVENT_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="service_style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Style</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SERVICE_STYLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="food_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Food Preference</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FOOD_PREFERENCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Grand Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Full venue address" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue Contact</FormLabel>
                  <FormControl>
                    <Input placeholder="Venue manager name / phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="guest_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Guests *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmed_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmed Count</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Confirmed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="veg_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veg</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="non_veg_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Non-Veg</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actual_headcount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual (post-event)</FormLabel>
                    <FormControl><Input type="number" placeholder="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
              name="room_setup_style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Setup Style</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Banquet, Buffet, Classroom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffing_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Required (count)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment_needed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Needed</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g. Chafing dishes, crockery sets" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kitchen_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kitchen Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Special prep instructions" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="access_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Gate access, parking, loading bay" rows={2} {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Any additional notes…" rows={2} {...field} />
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
// Menu Dialog
// ---------------------------------------------------------------------------

function MenuDialog({
  event,
  open,
  onOpenChange,
  bookingId,
}: {
  event: BookingEvent;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingId: string;
}) {
  const { data: dishes } = useDishes();
  const updateEvent = useUpdateEventById(bookingId, event.id);
  const [selected, setSelected] = useState<string[]>(event.menu_dish_ids);

  useEffect(() => {
    setSelected(event.menu_dish_ids);
  }, [event.id, event.menu_dish_ids]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function save() {
    updateEvent.mutate(
      { menu_dish_ids: selected },
      { onSuccess: () => onOpenChange(false) }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Set Menu — {event.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto py-2">
          {(dishes?.items ?? []).map((dish) => (
            <label key={dish.id} className="flex items-center gap-3 cursor-pointer rounded-lg border border-outline p-2 hover:bg-surface-high">
              <input
                type="checkbox"
                checked={selected.includes(dish.id)}
                onChange={() => toggle(dish.id)}
                className="h-4 w-4"
              />
              <span className="flex-1 text-sm text-on-surface">{dish.name}</span>
              <span className="text-xs text-on-surface-medium">{dish.category}</span>
              {dish.has_recipe && (
                <span className="text-xs text-green-400">✓ recipe</span>
              )}
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={updateEvent.isPending}>
            {updateEvent.isPending ? "Saving…" : "Save Menu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [menuTarget, setMenuTarget] = useState<BookingEvent | null>(null);

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
                    className="py-0"
                  >
                    <EmptyState
                      variant="events"
                      title="No events yet"
                      description="Add the first event to schedule catering for this booking."
                    />
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
                      <Button variant="outline" size="sm" onClick={() => setMenuTarget(event)}>
                        Set Menu{event.menu_dish_ids.length > 0 ? ` (${event.menu_dish_ids.length})` : ""}
                      </Button>
                      <Link href={`/bookings/${id}/procurement/${event.id}`}>
                        <Button variant="outline" size="sm">Procurement</Button>
                      </Link>
                      <DeleteEventDialog bookingId={id} event={event} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Menu Dialog */}
      {menuTarget && (
        <MenuDialog
          event={menuTarget}
          open={!!menuTarget}
          onOpenChange={(open) => { if (!open) setMenuTarget(null); }}
          bookingId={id}
        />
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
