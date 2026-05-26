"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
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
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1220]/95 border border-white/10 rounded-xl p-3 shadow-xl backdrop-blur-md">
        <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-cyan-300">
          {formatCurrencyTRY(Number(payload[0].value ?? 0))}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
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
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="value" name="Harcama" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
