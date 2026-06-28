"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { format } from "date-fns"
import { useBooking, useUpdateBooking } from "@/lib/bookings-api";
import { toast } from "sonner";
import {
  FormDatePicker,
  FormInput,
  FormSelect,
  FormTextarea,
  SectionLabel,
} from "@/components/ui/form-fields";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATERING_MODEL_OPTIONS = [
  { value: "per_plate", label: "Per Plate" },
  { value: "chef_driven", label: "Chef Driven" },
];

const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  in_progress: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  completed: "bg-surface-highest text-on-surface-medium border-outline",
  cancelled: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
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
  date: z.date({ error: "Date is required" }),
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

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-on-surface-low uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-on-surface">{value}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-on-surface-low uppercase tracking-wide">{label}</p>
      <p className="text-sm text-on-surface-medium whitespace-pre-wrap">{value}</p>
    </div>
  );
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
      date: event?.date ? new Date(event.date) : undefined as unknown as Date,
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
      date: format(values.date, "yyyy-MM-dd"),
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
        {
          onSuccess: () => { toast.success("Event updated."); onOpenChange(false); },
          onError: () => toast.error("Failed to update event. Try again."),
        }
      );
    } else {
      createEvent.mutate(payload, {
        onSuccess: () => {
          toast.success("Event created.");
          form.reset();
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to create event. Try again."),
      });
    }
  }

  const isMutating = createEvent.isPending || updateEvent.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:w-[70vw] data-[side=right]:max-w-[70vw] data-[side=right]:sm:max-w-[70vw] p-0 gap-0 flex flex-col">
        <SheetHeader className="px-[30px] py-5 border-b border-outline-low shrink-0">
          <SheetTitle className="text-xl font-semibold text-on-surface">
            {isEdit ? "Edit Event" : "Add Event"}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="rounded-[20px] border border-outline-low overflow-hidden divide-y divide-outline-low shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.15)] bg-surface-high">

                {/* 1 · Event Info */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={1}>Event Info</SectionLabel>
                  <FormInput name="name" label="Event Name *" placeholder="e.g. Nikah Ceremony" />
                  <div className="grid grid-cols-3 gap-3">
                    <FormDatePicker name="date" label="Date *" />
                    <FormInput name="start_time" label="Start Time" type="time" />
                    <FormInput name="end_time" label="End Time" type="time" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect name="ceremony_type" label="Ceremony Type" placeholder="Select type" options={CEREMONY_TYPE_OPTIONS} />
                    <FormSelect name="event_status" label="Event Status" placeholder="Select status" options={EVENT_STATUS_OPTIONS} />
                  </div>
                </div>

                {/* 2 · Catering */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={2}>Catering</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect name="service_style" label="Service Style" placeholder="Select style" options={SERVICE_STYLE_OPTIONS} />
                    <FormSelect name="food_preference" label="Food Preference" placeholder="Select preference" options={FOOD_PREFERENCE_OPTIONS} />
                  </div>
                  <FormSelect name="catering_model" label="Catering Model *" placeholder="Select model" options={CATERING_MODEL_OPTIONS} />
                </div>

                {/* 3 · Headcount */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={3}>Headcount</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput name="guest_count" label="Expected Guests *" type="number" placeholder="e.g. 250" />
                    <FormInput name="confirmed_count" label="Confirmed Count" type="number" placeholder="Confirmed" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <FormInput name="veg_count" label="Veg" type="number" placeholder="0" />
                    <FormInput name="non_veg_count" label="Non-Veg" type="number" placeholder="0" />
                    <FormInput name="actual_headcount" label="Actual (post-event)" type="number" placeholder="0" />
                  </div>
                </div>

                {/* 4 · Venue */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={4}>Venue</SectionLabel>
                  <FormInput name="venue" label="Venue Name" placeholder="e.g. Grand Hall" />
                  <FormTextarea name="venue_address" label="Venue Address" placeholder="Full venue address" rows={2} />
                  <FormInput name="venue_contact" label="Venue Contact" placeholder="Venue manager name / phone" />
                </div>

                {/* 5 · Operations */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={5}>Operations</SectionLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <FormInput name="room_setup_style" label="Room Setup Style" placeholder="e.g. Banquet, Buffet" />
                    <FormInput name="staffing_count" label="Staff Required" type="number" placeholder="e.g. 12" />
                  </div>
                  <FormTextarea name="equipment_needed" label="Equipment Needed" placeholder="e.g. Chafing dishes, crockery sets" rows={2} />
                  <FormTextarea name="kitchen_notes" label="Kitchen Notes" placeholder="Special prep instructions" rows={2} />
                  <FormTextarea name="access_instructions" label="Access Instructions" placeholder="Gate access, parking, loading bay" rows={2} />
                </div>

                {/* 6 · Notes */}
                <div className="space-y-4 px-[30px] py-[26px]">
                  <SectionLabel number={6}>Notes</SectionLabel>
                  <FormTextarea name="notes" label="Notes" placeholder="Any additional notes…" rows={3} />
                </div>

              </div>
            </div>

            <div className="shrink-0 border-t border-outline-low px-[30px] py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center h-[44px] px-5 rounded-[11px] text-sm font-semibold border border-outline text-on-surface-medium hover:bg-surface-high hover:text-on-surface transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isMutating}
                className="inline-flex items-center justify-center h-[44px] px-6 rounded-[11px] text-sm font-bold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
                style={{
                  background: "linear-gradient(180deg, color-mix(in oklab, var(--secondary), #fff 12%), var(--secondary))",
                  color: "var(--secondary-foreground)",
                  boxShadow: "0 8px 22px -10px var(--secondary)",
                }}
              >
                {isMutating ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save" : "Create")}
              </button>
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
      {
        onSuccess: () => { toast.success("Menu saved."); onOpenChange(false); },
        onError: () => toast.error("Failed to save menu. Try again."),
      }
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
                <span className="text-xs text-green-600 dark:text-green-400">✓ recipe</span>
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
      onSuccess: () => { toast.success("Event deleted."); setOpen(false); },
      onError: () => toast.error("Failed to delete event. Try again."),
    });
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-red-700 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
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
  const { data: dishes } = useDishes();
  const updateBooking = useUpdateBooking(id);

  const dishMap = new Map(dishes?.items?.map((d) => [d.id, d.name]) ?? []);

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
    updateBooking.mutate(
      { status: status as BookingStatus },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: () => toast.error("Failed to update status. Try again."),
      }
    );
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
        <p className="text-red-600 dark:text-red-400">Failed to load booking. Please try again.</p>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface mb-3">{booking.title}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-low uppercase tracking-wide">Customer</span>
            <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {booking.customer_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-low uppercase tracking-wide">Status</span>
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
      </div>

      {/* Booking Details Card */}
      {(booking.deposit_amount || booking.deposit_due_date || booking.deposit_paid_date ||
        booking.minimum_guarantee || booking.contract_signed || booking.payment_terms ||
        booking.cancellation_policy || booking.special_instructions || booking.notes) && (
        <div className="mb-8 rounded-lg border border-outline bg-surface-high overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-low">
            <h2 className="text-xs font-semibold text-on-surface-medium uppercase tracking-wide">Booking Details</h2>
          </div>
          <div className="p-5 space-y-5">
            {(booking.deposit_amount || booking.deposit_due_date || booking.deposit_paid_date || booking.minimum_guarantee || booking.contract_signed) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {booking.deposit_amount != null && (
                  <InfoCell label="Deposit Amount" value={`₹${booking.deposit_amount.toLocaleString("en-IN")}`} />
                )}
                {booking.deposit_due_date && (
                  <InfoCell label="Deposit Due" value={formatDate(booking.deposit_due_date)} />
                )}
                {booking.deposit_paid_date && (
                  <InfoCell label="Deposit Paid" value={formatDate(booking.deposit_paid_date)} />
                )}
                {booking.minimum_guarantee != null && (
                  <InfoCell label="Min. Guarantee" value={`${booking.minimum_guarantee} guests`} />
                )}
                {booking.contract_signed && (
                  <InfoCell
                    label="Contract"
                    value={booking.contract_signed_date ? `Signed ${formatDate(booking.contract_signed_date)}` : "Signed"}
                  />
                )}
              </div>
            )}
            {(booking.payment_terms || booking.cancellation_policy || booking.special_instructions || booking.notes) && (
              <div className="space-y-4 pt-1 border-t border-outline-low">
                {booking.payment_terms && <InfoBlock label="Payment Terms" value={booking.payment_terms} />}
                {booking.cancellation_policy && <InfoBlock label="Cancellation Policy" value={booking.cancellation_policy} />}
                {booking.special_instructions && <InfoBlock label="Special Instructions" value={booking.special_instructions} />}
                {booking.notes && <InfoBlock label="Notes" value={booking.notes} />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Events Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-on-surface">Events</h2>
        <Button onClick={openAddEvent}>+ Add Event</Button>
      </div>

      {eventsLoading && (
        <p className="text-on-surface-medium">Loading events…</p>
      )}
      {eventsError && (
        <p className="text-red-600 dark:text-red-400">Failed to load events. Please try again.</p>
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
                <React.Fragment key={event.id}>
                  <TableRow className="border-outline-low">
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
                  {event.menu_dish_ids.length > 0 && (
                    <TableRow className="border-outline-low hover:bg-transparent">
                      <TableCell colSpan={6} className="pt-0 pb-2.5 pl-10">
                        <div className="flex flex-wrap gap-1.5">
                          {event.menu_dish_ids.map((dishId) => (
                            <span
                              key={dishId}
                              className="text-xs text-on-surface-medium bg-surface-highest border border-outline-low px-2.5 py-0.5 rounded-full"
                            >
                              {dishMap.get(dishId) ?? dishId}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
