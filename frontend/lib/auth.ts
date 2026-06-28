import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export type UserRole = "owner" | "manager" | "kitchen" | "viewer";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
};

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: () => api.get<CurrentUser>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      api.post<CurrentUser>("/auth/login", credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(["current-user"], user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
