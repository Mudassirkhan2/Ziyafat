import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { StaffUser, Paginated } from "./types";

export function useUsers(params?: {
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  if (params?.pageSize) q.set("page_size", String(params.pageSize));
  if (params?.sortBy) q.set("sort_by", params.sortBy);
  if (params?.sortDir) q.set("sort_dir", params.sortDir);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return useQuery<Paginated<StaffUser>>({
    queryKey: ["users", params],
    queryFn: () => api.get<Paginated<StaffUser>>(`/users${qs}`),
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

export function useUploadMyAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<StaffUser>("/users/me/avatar", fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

export function useDeleteMyAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<StaffUser>("/users/me/avatar"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}
