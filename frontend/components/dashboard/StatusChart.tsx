// frontend/components/dashboard/StatusChart.tsx
"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { EmptyState } from "@/components/ui/empty-state";

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS: Record<string, string> = {
  // Lead
  new: "#64748b",
  quoted: "#3b82f6",
  negotiating: "#f59e0b",
  won: "#22c55e",
  lost: "#ef4444",
  // Booking
  confirmed: "#3b82f6",
  in_progress: "#06b6d4",
  completed: "#22c55e",
  cancelled: "#ef4444",
  // Event
  enquiry: "#64748b",
  deposit_received: "#8b5cf6",
  event_day: "#f97316",
  // Quotation
  approved: "#22c55e",
  rejected: "#ef4444",
  sent: "#3b82f6",
  draft: "#64748b",
  superseded: "#f59e0b",
  // Invoice
  paid: "#22c55e",
  // Customer type
  individual: "#3b82f6",
  corporate: "#8b5cf6",
  wedding_planner: "#f59e0b",
  venue: "#06b6d4",
  ngo: "#22c55e",
};

interface StatusChartProps {
  title: string;
  data: Record<string, number>;
}

export function StatusChart({ title, data }: StatusChartProps) {
  const labels = Object.keys(data).map((k) => k.replace(/_/g, " "));
  const values = Object.values(data);
  const colors = Object.keys(data).map(
    (k) => STATUS_COLORS[k] ?? "#94a3b8"
  );

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.06)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#64748b",
          font: { size: 11 },
          padding: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { label: string; raw: unknown }) =>
            ` ${ctx.label}: ${ctx.raw}`,
        },
      },
    },
  };

  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4">
      <h3 className="text-base font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-xs text-on-surface-low mb-3">Total: {total}</p>
      {total === 0 ? (
        <EmptyState variant="chart" title="No data yet" className="py-4" />
      ) : (
        <div className="h-48">
          <Doughnut data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
