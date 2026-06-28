// frontend/lib/analytics-api.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface DashboardKPIs {
  revenue_paid: number;
  revenue_outstanding: number;
  active_bookings: number;
  open_leads: number;
  lead_win_rate: number;
  events_this_month: number;
}

export interface RevenueMonth {
  month: string;
  revenue: number;
}

export interface QuotationMonth {
  month: string;
  count: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  leads_by_status: Record<string, number>;
  bookings_by_status: Record<string, number>;
  events_by_status: Record<string, number>;
  quotations_by_status: Record<string, number>;
  invoices_by_status: Record<string, number>;
  customers_by_type: Record<string, number>;
  revenue_by_month: RevenueMonth[];
  quotations_by_month: QuotationMonth[];
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/analytics/dashboard"),
    staleTime: 5 * 60 * 1000,
  });
}
