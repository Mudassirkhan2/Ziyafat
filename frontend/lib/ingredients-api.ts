import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Ingredient, DishRecipe, ProcurementItem } from "./types";

// ---------- Ingredients CRUD ----------

export function useIngredients(params?: { active_only?: boolean; supplier?: string }) {
  const qs = new URLSearchParams();
  if (params?.active_only !== undefined) qs.set("active_only", String(params.active_only));
  if (params?.supplier) qs.set("supplier", params.supplier);
  const query = qs.toString();
  return useQuery<Ingredient[]>({
    queryKey: ["ingredients", params],
    queryFn: () => api.get<Ingredient[]>(`/ingredients${query ? `?${query}` : ""}`),
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      base_unit: string;
      cost_per_unit: number;
      supplier?: string;
      stock_on_hand?: number;
      reorder_threshold?: number;
    }) => api.post<Ingredient>("/ingredients", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
  });
}

export function useUpdateIngredient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Omit<Ingredient, "id" | "created_at" | "updated_at">>) =>
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
