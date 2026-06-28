// frontend/components/dashboard/RevenueChart.tsx
"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { RevenueMonth } from "@/lib/analytics-api";
import { EmptyState } from "@/components/ui/empty-state";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface RevenueChartProps {
  data: RevenueMonth[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.map((d) => d.revenue),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown }) =>
            ` ₹${Number(ctx.raw).toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b" },
        grid: { color: "rgba(148,163,184,0.15)" },
      },
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: number | string) =>
            `₹${Number(value).toLocaleString("en-IN")}`,
        },
        grid: { color: "rgba(148,163,184,0.15)" },
      },
    },
  };

  const hasData = data.some((d) => d.revenue > 0);

  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4" style={{ boxShadow: "0 2px 8px 0 color-mix(in srgb, var(--secondary) 20%, transparent)" }}>
      <h3 className="text-base font-bold text-on-surface mb-1">
        Revenue — Last 6 Months
      </h3>
      <p className="text-xs text-on-surface-low mb-3">Paid invoices only</p>
      {!hasData ? (
        <EmptyState
          variant="revenue"
          title="No revenue yet"
          description="Paid invoices will appear here"
          className="py-4"
        />
      ) : (
        <div className="h-48">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
