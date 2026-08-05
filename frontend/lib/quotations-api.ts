import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Quotation, QuotationLineItem, QuotationStatus, Paginated } from "./types";

interface QuotationParams {
  booking_id?: string;
  status?: QuotationStatus;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function useQuotations(params?: QuotationParams) {
  const q = new URLSearchParams();
  if (params?.booking_id) q.set("booking_id", params.booking_id);
  if (params?.status) q.set("status", params.status);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString();
  return useQuery<Paginated<Quotation>>({
    queryKey: ["quotations", params],
    queryFn: () => api.get<Paginated<Quotation>>(`/quotations${qs ? `?${qs}` : ""}`),
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
      service_charge_percentage?: number;
      tax_percentage?: number;
      gratuity_percentage?: number;
      service_charge_amount?: number;
      tax_amount?: number;
      gratuity_amount?: number;
      delivery_fee?: number;
      setup_fee?: number;
      per_person_price?: number;
      deposit_amount?: number;
      deposit_percentage?: number;
      deposit_due_date?: string;
      final_balance_due_date?: string;
      payment_terms_text?: string;
      cancellation_policy_text?: string;
      minimum_guarantee_count?: number;
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
      service_charge_percentage: number;
      tax_percentage: number;
      gratuity_percentage: number;
      service_charge_amount: number;
      tax_amount: number;
      gratuity_amount: number;
      delivery_fee: number;
      setup_fee: number;
      deposit_amount: number;
      per_person_price: number;
      deposit_percentage: number;
      deposit_due_date: string;
      final_balance_due_date: string;
      payment_terms_text: string;
      cancellation_policy_text: string;
      minimum_guarantee_count: number;
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
