import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Booking, BookingStatus } from "./types";

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: () => api.get<Booking[]>("/bookings"),
  });
}

export function useBooking(id: string) {
  return useQuery<Booking>({
    queryKey: ["bookings", id],
    queryFn: () => api.get<Booking>(`/bookings/${id}`),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { customer_id: string; title: string; notes?: string }) =>
      api.post<Booking>("/bookings", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useUpdateBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { title?: string; status?: BookingStatus; notes?: string }) =>
      api.patch<Booking>(`/bookings/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
}

export function useDeleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/bookings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}
