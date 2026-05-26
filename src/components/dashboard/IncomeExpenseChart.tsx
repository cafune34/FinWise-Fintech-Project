"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
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
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1220]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md space-y-1">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label} Görünümü</p>
        {payload.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4 text-xs">
            <span style={{ color: item.stroke }} className="font-medium">{item.name}:</span>
            <span className="font-bold text-white">{formatCurrencyTRY(Number(item.value ?? 0))}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isClient) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-slate-900/10 rounded-xl">
        <p className="text-xs text-slate-500">Grafik yükleniyor...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Legend />
        <Line name="Gelir" type="monotone" dataKey="gelir" stroke="#34d399" strokeWidth={2.5} dot={false} />
        <Line name="Gider" type="monotone" dataKey="gider" stroke="#fb7185" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
