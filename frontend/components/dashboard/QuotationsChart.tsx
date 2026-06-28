"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { QuotationMonth } from "@/lib/analytics-api";
import { EmptyState } from "@/components/ui/empty-state";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface QuotationsChartProps {
  data: QuotationMonth[];
}

export function QuotationsChart({ data }: QuotationsChartProps) {
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Quotations",
        data: data.map((d) => d.count),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139,92,246,0.12)",
        borderWidth: 2,
        pointBackgroundColor: "#8b5cf6",
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
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
          label: (ctx: { raw: unknown }) => ` ${ctx.raw} quotation(s)`,
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
          stepSize: 1,
          callback: (value: number | string) => Math.floor(Number(value)),
        },
        grid: { color: "rgba(148,163,184,0.15)" },
        min: 0,
      },
    },
  };

  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="rounded-lg border border-outline bg-surface-high p-4" style={{ boxShadow: "0 2px 8px 0 color-mix(in srgb, var(--secondary) 20%, transparent)" }}>
      <h3 className="text-base font-bold text-on-surface mb-1">
        Quotations Created
      </h3>
      <p className="text-xs text-on-surface-low mb-3">Last 6 months</p>
      {!hasData ? (
        <EmptyState
          variant="chart"
          title="No quotations yet"
          description="New quotations will appear here"
          className="py-4"
        />
      ) : (
        <div className="h-48">
          <Line data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
