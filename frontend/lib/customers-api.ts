import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Customer, Booking } from "./types";

export function useCustomers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return useQuery<Customer[]>({
    queryKey: ["customers", search],
    queryFn: () => api.get<Customer[]>(`/customers${qs}`),
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Customer>) => api.post<Customer>("/customers", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Customer>) => api.patch<Customer>(`/customers/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}

export function useCustomerBookings(customerId: string) {
  return useQuery<Booking[]>({
    queryKey: ["customers", customerId, "bookings"],
    queryFn: () => api.get<Booking[]>(`/customers/${customerId}/bookings`),
    enabled: !!customerId,
  });
}
