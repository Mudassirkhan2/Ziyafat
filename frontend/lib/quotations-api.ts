import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Quotation, QuotationLineItem, QuotationStatus } from "./types";

interface QuotationParams {
  booking_id?: string;
  status?: QuotationStatus;
}

export function useQuotations(params?: QuotationParams) {
  const query = new URLSearchParams();
  if (params?.booking_id) query.set("booking_id", params.booking_id);
  if (params?.status) query.set("status", params.status);
  const qs = query.toString();
  return useQuery<Quotation[]>({
    queryKey: ["quotations", params],
    queryFn: () => api.get<Quotation[]>(`/quotations${qs ? `?${qs}` : ""}`),
  });
}

export function useQuotation(id: string) {
  return useQuery<Quotation>({
    queryKey: ["quotations", id],
    queryFn: () => api.get<Quotation>(`/quotations/${id}`),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      booking_id: string;
      event_id?: string;
      line_items: QuotationLineItem[];
      subtotal: number;
      discount: number;
      total: number;
      notes?: string;
      valid_until?: string;
    }) => api.post<Quotation>("/quotations", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useUpdateQuotation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{
      status: QuotationStatus;
      line_items: QuotationLineItem[];
      subtotal: number;
      discount: number;
      total: number;
      notes: string;
      valid_until: string;
    }>) => api.patch<Quotation>(`/quotations/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotations", id] });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/quotations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

export function useDuplicateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Quotation>(`/quotations/${id}/duplicate`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
}
