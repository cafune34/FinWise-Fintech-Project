"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyTRY } from "@/lib/format";

type ExpenseCategoryDatum = {
  name: string;
  value: number;
};

type ExpenseByCategoryChartProps = {
  data: ExpenseCategoryDatum[];
};

const colors = ["#22d3ee", "#60a5fa", "#2dd4bf", "#34d399", "#f59e0b", "#fb7185", "#c084fc"];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b1220]/95 p-3 shadow-xl backdrop-blur-md">
      <p className="mb-1 text-xs font-semibold text-slate-400">{label}</p>
      <p className="text-sm font-bold text-cyan-300">{formatCurrencyTRY(Number(payload[0].value ?? 0))}</p>
    </div>
  );
};

export default function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  const [hasStableSize, setHasStableSize] = useState(false);
  const [chartWidth, setChartWidth] = useState(1);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const hasChartData = data.length > 0;

  useEffect(() => {
    const updateSize = () => {
      const rect = chartRef.current?.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.floor(rect?.width ?? 0));
      setChartWidth(nextWidth);
      setHasStableSize(Boolean(rect && rect.width > 0 && rect.height > 0));
    };

    const frameId = window.requestAnimationFrame(updateSize);
    const observer = new ResizeObserver(updateSize);

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  if (!hasStableSize) {
    return (
      <div
        ref={chartRef}
        className="flex h-[300px] min-h-[300px] w-full min-w-[1px] items-center justify-center rounded-xl bg-slate-900/10"
      >
        <p className="text-xs text-slate-500">Grafik yukleniyor...</p>
      </div>
    );
  }

  if (!hasChartData) {
    return (
      <div
        ref={chartRef}
        className="flex h-[300px] min-h-[300px] w-full min-w-[1px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30"
      >
        <p className="text-xs text-slate-500">Grafik icin yeterli veri yok.</p>
      </div>
    );
  }

  return (
    <div ref={chartRef} className="h-[300px] min-h-[300px] w-full min-w-[1px] overflow-hidden">
      <BarChart width={chartWidth} height={300} data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Legend />
        <Bar dataKey="value" name="Harcama" radius={[6, 6, 0, 0]} activeBar={false}>
          {data.map((entry, index) => (
            <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}
