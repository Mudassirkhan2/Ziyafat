import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { StaffUser } from "./types";

export function useUsers() {
  return useQuery<StaffUser[]>({
    queryKey: ["users"],
    queryFn: () => api.get<StaffUser[]>("/users"),
  });
}

export function useUser(id: string) {
  return useQuery<StaffUser>({
    queryKey: ["users", id],
    queryFn: () => api.get<StaffUser>(`/users/${id}`),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role: string }) =>
      api.post<StaffUser>("/users", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; role?: string; avatar_url?: string }) =>
      api.patch<StaffUser>(`/users/${id}`, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: { current_password?: string; new_password: string } }) =>
      api.patch(`/users/${id}/password`, body),
  });
}
