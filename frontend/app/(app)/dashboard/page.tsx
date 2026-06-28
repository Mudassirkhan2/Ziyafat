// frontend/app/(app)/dashboard/page.tsx
"use client";

import { useCurrentUser } from "@/lib/auth";
import { useDashboard } from "@/lib/analytics-api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FiDollarSign,
  FiAlertCircle,
  FiCalendar,
  FiTrendingUp,
  FiPercent,
  FiClock,
} from "react-icons/fi";

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, isError } = useDashboard();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
      <p className="text-on-surface-medium mt-1">
        Welcome back, {user?.name ?? "…"}
      </p>

      {isError && (
        <div className="mt-6 rounded-lg border border-outline bg-surface-high p-4 text-sm text-on-surface-low">
          Could not load dashboard data. Check that the backend is running.
        </div>
      )}

      {isLoading && <DashboardSkeleton />}

      {data && (
        <>
          {/* KPI Strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiCard
              label="Revenue (Paid)"
              value={formatCurrency(data.kpis.revenue_paid)}
              icon={<FiDollarSign />}
              accent="emerald"
            />
            <KpiCard
              label="Outstanding"
              value={formatCurrency(data.kpis.revenue_outstanding)}
              icon={<FiAlertCircle />}
              accent="red"
            />
            <KpiCard
              label="Active Bookings"
              value={data.kpis.active_bookings}
              icon={<FiCalendar />}
              accent="blue"
            />
            <KpiCard
              label="Open Leads"
              value={data.kpis.open_leads}
              icon={<FiTrendingUp />}
              accent="amber"
            />
            <KpiCard
              label="Lead Win Rate"
              value={`${data.kpis.lead_win_rate}%`}
              icon={<FiPercent />}
              accent="violet"
            />
            <KpiCard
              label="Events This Month"
              value={data.kpis.events_this_month}
              icon={<FiClock />}
              accent="cyan"
            />
          </div>

          {/* Charts Grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <RevenueChart data={data.revenue_by_month} />
            </div>
            <StatusChart title="Leads by Status" data={data.leads_by_status} />
            <StatusChart title="Bookings by Status" data={data.bookings_by_status} />
            <StatusChart title="Events by Status" data={data.events_by_status} />
            <StatusChart title="Quotations by Status" data={data.quotations_by_status} />
            <StatusChart title="Invoices by Status" data={data.invoices_by_status} />
            <StatusChart title="Customers by Type" data={data.customers_by_type} />
          </div>
        </>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4 flex flex-col gap-2">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-7 w-20 rounded" />
      <Skeleton className="h-3 w-24 rounded" />
    </div>
  );
}

function StatusChartSkeleton() {
  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4">
      <Skeleton className="h-4 w-32 rounded mb-1" />
      <Skeleton className="h-3 w-16 rounded mb-4" />
      <div className="flex items-center justify-center h-48">
        <div className="relative">
          <Skeleton className="h-36 w-36 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-surface-high" />
          </div>
        </div>
      </div>
    </div>
  );
}

function RevenueChartSkeleton() {
  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4">
      <Skeleton className="h-4 w-44 rounded mb-1" />
      <Skeleton className="h-3 w-28 rounded mb-4" />
      <div className="h-48 flex items-end gap-2 px-2">
        {[55, 75, 40, 90, 65, 50].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <RevenueChartSkeleton />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <StatusChartSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
