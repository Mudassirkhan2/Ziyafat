import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { BookingEvent, CateringModel } from "./types";

export function useBookingEvents(bookingId: string) {
  return useQuery<BookingEvent[]>({
    queryKey: ["bookings", bookingId, "events"],
    queryFn: () => api.get<BookingEvent[]>(`/bookings/${bookingId}/events`),
    enabled: !!bookingId,
  });
}

export function useCreateEvent(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      date: string;
      guest_count: number;
      catering_model: CateringModel;
      venue?: string;
      notes?: string;
    }) => api.post<BookingEvent>(`/bookings/${bookingId}/events`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId, "events"] }),
  });
}

export function useUpdateEvent(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, body }: { eventId: string; body: Partial<BookingEvent> }) =>
      api.patch<BookingEvent>(`/bookings/${bookingId}/events/${eventId}`, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId, "events"] }),
  });
}

export function useDeleteEvent(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) =>
      api.delete(`/bookings/${bookingId}/events/${eventId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId, "events"] }),
  });
}
