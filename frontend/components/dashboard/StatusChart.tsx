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

const PALETTE = [
  "#5b8fba", "#d4956a", "#6aaa7e", "#c4a55a", "#8b72b5", "#7abab5",
  "#d47a7a", "#7aafcc", "#b5c45a", "#aa7ab5", "#7ac48f", "#d4a57a",
  "#7a8fb5", "#c47a9a", "#8fb57a", "#b5957a", "#7ab5c4", "#c4b57a",
  "#9a7ab5", "#7ab5a0", "#c4957a", "#7aaab5", "#b57a9a", "#8fc4aa",
];

function pickColors(keys: string[]): string[] {
  const pool = [...PALETTE];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return keys.map((_, i) => pool[i % pool.length]);
}

interface StatusChartProps {
  title: string;
  data: Record<string, number>;
}

export function StatusChart({ title, data }: StatusChartProps) {
  const keys = Object.keys(data);
  const labels = keys.map((k) => k.replace(/_/g, " "));
  const values = Object.values(data);
  const colors = pickColors(keys);

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
    <div className="rounded-lg border border-outline bg-surface-high p-4" style={{ boxShadow: "0 2px 8px 0 color-mix(in srgb, var(--secondary) 20%, transparent)" }}>
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
