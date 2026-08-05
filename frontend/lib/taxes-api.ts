import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Tax } from "./types";

export function useTaxes() {
  return useQuery<Tax[]>({
    queryKey: ["taxes"],
    queryFn: () => api.get<Tax[]>("/taxes"),
  });
}

export function useCreateTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; rate: number; calculation_method: string; is_active: boolean }) =>
      api.post<Tax>("/taxes", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["taxes"] }),
  });
}

export function useUpdateTax(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{ name: string; rate: number; calculation_method: string; is_active: boolean }>) =>
      api.patch<Tax>(`/taxes/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["taxes"] }),
  });
}

export function useDeleteTax() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/taxes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["taxes"] }),
  });
}
