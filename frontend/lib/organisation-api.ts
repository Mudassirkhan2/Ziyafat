import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { applyOrgTheme } from "./dls/tokens";
import type { Organisation } from "./types";

export function useOrg() {
  return useQuery<Organisation>({
    queryKey: ["org"],
    queryFn: () => api.get<Organisation>("/organisation"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Organisation & { report_header: Partial<Organisation["report_header"]> }>) =>
      api.patch<Organisation>("/organisation", body),
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
      applyOrgTheme(data);
    },
  });
}

export function useUploadOrgLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<Organisation>("/organisation/logo", fd);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
    },
  });
}

export function useUploadOrgBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<Organisation>("/organisation/banner", fd);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
    },
  });
}

export function useUploadDishImage(dishId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.upload<{ image_url: string }>(`/dishes/${dishId}/image`, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dishes"] });
    },
  });
}
