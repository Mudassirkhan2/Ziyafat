import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Ingredient, DishRecipe, ProcurementItem, Paginated } from "./types";

// ---------- Ingredients CRUD ----------

export function useIngredients(params?: {
  active_only?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const q = new URLSearchParams();
  if (params?.active_only !== undefined) q.set("active_only", String(params.active_only));
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString();
  return useQuery<Paginated<Ingredient>>({
    queryKey: ["ingredients", params],
    queryFn: () => api.get<Paginated<Ingredient>>(`/ingredients${qs ? `?${qs}` : ""}`),
  });
}

export function useIngredient(id: string) {
  return useQuery<Ingredient>({
    queryKey: ["ingredients", id],
    queryFn: () => api.get<Ingredient>(`/ingredients/${id}`),
    enabled: !!id,
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Ingredient> & { name: string; base_unit: string; cost_per_unit: number }) =>
      api.post<Ingredient>("/ingredients", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

export function useUpdateIngredient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Ingredient>) =>
      api.patch<Ingredient>(`/ingredients/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

export function useDeleteIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/ingredients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

// ---------- Dish Recipes ----------

export function useDishRecipe(dishId: string) {
  return useQuery<DishRecipe>({
    queryKey: ["dish-recipe", dishId],
    queryFn: () => api.get<DishRecipe>(`/dishes/${dishId}/recipe`),
    enabled: !!dishId,
  });
}

export function useReplaceDishRecipe(dishId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ingredients: Array<{ ingredient_id: string; quantity_per_100_guests: number; unit: string }>) =>
      api.put<DishRecipe>(`/dishes/${dishId}/recipe`, { ingredients }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dish-recipe", dishId] });
      qc.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}

export function useClearDishRecipe(dishId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/dishes/${dishId}/recipe`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dish-recipe", dishId] });
      qc.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}

// ---------- Procurement ----------

export function useProcurementList(bookingId: string, eventId: string, wastage_pct = 0) {
  return useQuery<ProcurementItem[]>({
    queryKey: ["procurement", eventId, wastage_pct],
    queryFn: () =>
      api.get<ProcurementItem[]>(
        `/bookings/${bookingId}/events/${eventId}/procurement?wastage_pct=${wastage_pct}`
      ),
    enabled: !!bookingId && !!eventId,
  });
}
