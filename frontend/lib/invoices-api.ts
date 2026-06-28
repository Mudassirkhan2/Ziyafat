import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Invoice, QuotationLineItem, InvoiceStatus, Paginated } from "./types";

interface InvoiceParams {
  booking_id?: string;
  status?: InvoiceStatus;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function useInvoices(params?: InvoiceParams) {
  const q = new URLSearchParams();
  if (params?.booking_id) q.set("booking_id", params.booking_id);
  if (params?.status) q.set("status", params.status);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString();
  return useQuery<Paginated<Invoice>>({
    queryKey: ["invoices", params],
    queryFn: () => api.get<Paginated<Invoice>>(`/invoices${qs ? `?${qs}` : ""}`),
  });
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: () => api.get<Invoice>(`/invoices/${id}`),
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      booking_id: string;
      quotation_id?: string;
      line_items?: QuotationLineItem[];
      subtotal: number;
      discount: number;
      total: number;
      due_date?: string;
      notes?: string;
    }) => api.post<Invoice>("/invoices", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoice(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{
      status: InvoiceStatus;
      line_items: QuotationLineItem[];
      subtotal: number;
      discount: number;
      total: number;
      due_date: string;
      notes: string;
    }>) => api.patch<Invoice>(`/invoices/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoices", id] });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
