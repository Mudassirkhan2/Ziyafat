import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Booking, BookingStatus, Paginated } from "./types";

export function useBookings(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return useQuery<Paginated<Booking>>({
    queryKey: ["bookings", params],
    queryFn: () => api.get<Paginated<Booking>>(`/bookings${qs}`),
  });
}

export function useBookingsForSelect() {
  return useQuery<Paginated<Booking>>({
    queryKey: ["bookings", "select"],
    queryFn: () => api.get<Paginated<Booking>>("/bookings?page_size=1000&sort_by=created_at&sort_dir=desc"),
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
    mutationFn: (body: Partial<Booking> & { customer_id: string; title: string }) =>
      api.post<Booking>("/bookings", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useUpdateBooking(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Booking>) =>
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
