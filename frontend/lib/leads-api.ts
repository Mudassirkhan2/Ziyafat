import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Lead, Customer, LeadStatus } from "./types";

export function useLeads(params?: { status?: LeadStatus; search?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.search) query.set("search", params.search);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return useQuery<Lead[]>({
    queryKey: ["leads", params],
    queryFn: () => api.get<Lead[]>(`/leads${qs}`),
  });
}

export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ["leads", id],
    queryFn: () => api.get<Lead>(`/leads/${id}`),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Lead>) => api.post<Lead>("/leads", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Lead>) => api.patch<Lead>(`/leads/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<Customer>(`/leads/${id}/convert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
