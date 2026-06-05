"use client";

import { useEffect, useRef, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrencyTRY } from "@/lib/format";

type IncomeExpenseDatum = {
  month: string;
  gelir: number;
  gider: number;
};

type IncomeExpenseChartProps = {
  data: IncomeExpenseDatum[];
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    stroke?: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="space-y-1 rounded-xl border border-white/10 bg-[#0b1220]/95 p-3 shadow-xl backdrop-blur-md">
      <p className="mb-1 text-xs font-semibold text-slate-400">{label} Gorunumu</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
          <span style={{ color: item.stroke }} className="font-medium">
            {item.name}:
          </span>
          <span className="font-bold text-white">{formatCurrencyTRY(Number(item.value ?? 0))}</span>
        </div>
      ))}
    </div>
  );
};

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
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
      <LineChart width={chartWidth} height={300} data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Legend />
        <Line name="Gelir" type="monotone" dataKey="gelir" stroke="#34d399" strokeWidth={2.5} dot={false} />
        <Line name="Gider" type="monotone" dataKey="gider" stroke="#fb7185" strokeWidth={2.5} dot={false} />
      </LineChart>
    </div>
  );
}
