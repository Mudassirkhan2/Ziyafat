import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Dish } from "./types";

interface DishParams {
  category?: string;
  is_veg?: boolean;
  active_only?: boolean;
}

export function useDishes(params?: DishParams) {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.is_veg !== undefined) query.set("is_veg", String(params.is_veg));
  if (params?.active_only !== undefined) query.set("active_only", String(params.active_only));
  const qs = query.toString();
  return useQuery<Dish[]>({
    queryKey: ["dishes", params],
    queryFn: () => api.get<Dish[]>(`/dishes${qs ? `?${qs}` : ""}`),
  });
}

export function useDish(id: string) {
  return useQuery<Dish>({
    queryKey: ["dishes", id],
    queryFn: () => api.get<Dish>(`/dishes/${id}`),
    enabled: !!id,
  });
}

export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      category: string;
      description?: string;
      per_plate_cost: number;
      selling_price: number;
      is_veg?: boolean;
    }) => api.post<Dish>("/dishes", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dishes"] }),
  });
}

export function useUpdateDish(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<{
      name: string;
      category: string;
      description: string;
      per_plate_cost: number;
      selling_price: number;
      is_veg: boolean;
      is_active: boolean;
    }>) => api.patch<Dish>(`/dishes/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
      queryClient.invalidateQueries({ queryKey: ["dishes", id] });
    },
  });
}

export function useDeleteDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/dishes/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dishes"] }),
  });
}
