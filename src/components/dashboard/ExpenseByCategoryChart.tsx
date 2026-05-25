"use client";

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

export default function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300} minWidth={280} minHeight={280}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value) => formatCurrencyTRY(Number(value ?? 0))}
          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.5rem" }}
          labelStyle={{ color: "#cbd5e1" }}
        />
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
