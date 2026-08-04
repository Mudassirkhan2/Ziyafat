import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { applyOrgTheme } from "./dls/tokens";
import type { Organisation } from "./types";
import { useCurrencyStore } from "./currency-store";

export function useOrg() {
  return useQuery<Organisation>({
    queryKey: ["org"],
    queryFn: async () => {
      const data = await api.get<Organisation>("/organisation");
      useCurrencyStore.getState().setFromOrg(data.currency_code ?? "INR");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

type OrgUpdateBody = Partial<Organisation & {
  report_header: Partial<Organisation["report_header"]>;
}>;

export function useUpdateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrgUpdateBody) =>
      api.patch<Organisation>("/organisation", body),
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
      applyOrgTheme(data);
      useCurrencyStore.getState().setFromOrg(data.currency_code ?? "INR");
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

export function useDeleteOrgLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<Organisation>("/organisation/logo"),
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
      applyOrgTheme(data);
    },
  });
}

export function useDeleteOrgBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<Organisation>("/organisation/banner"),
    onSuccess: (data) => {
      queryClient.setQueryData(["org"], data);
      queryClient.invalidateQueries({ queryKey: ["org-info"] });
      applyOrgTheme(data);
    },
  });
}
