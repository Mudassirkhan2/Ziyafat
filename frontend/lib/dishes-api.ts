import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Dish, Paginated } from "./types";

interface DishParams {
  category?: string;
  is_veg?: boolean;
  active_only?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function useDishes(params?: DishParams) {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.is_veg !== undefined) q.set("is_veg", String(params.is_veg));
  if (params?.active_only !== undefined) q.set("active_only", String(params.active_only));
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString();
  return useQuery<Paginated<Dish>>({
    queryKey: ["dishes", params],
    queryFn: () => api.get<Paginated<Dish>>(`/dishes${qs ? `?${qs}` : ""}`),
  });
}

export function useDishesForSelect() {
  return useQuery<Paginated<Dish>>({
    queryKey: ["dishes", "select"],
    queryFn: () => api.get<Paginated<Dish>>("/dishes?page_size=1000&sort_by=name&sort_dir=asc&active_only=true"),
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
    mutationFn: (body: Partial<Dish> & { name: string; category: string; per_plate_cost: number; selling_price: number }) =>
      api.post<Dish>("/dishes", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dishes"] }),
  });
}

export function useUpdateDish(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Dish>) => api.patch<Dish>(`/dishes/${id}`, body),
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

export function useUploadDishImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<Dish>(`/dishes/${id}/image`, fd);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["dishes", id], data);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}

export function useDeleteDishImage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<Dish>(`/dishes/${id}/image`),
    onSuccess: (data) => {
      queryClient.setQueryData(["dishes", id], data);
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
