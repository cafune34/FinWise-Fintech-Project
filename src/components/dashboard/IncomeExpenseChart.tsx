"use client";

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

export default function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260} minWidth={280} minHeight={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Math.round(Number(value) / 1000)}K`} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value) => formatCurrencyTRY(Number(value ?? 0))}
          contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.5rem" }}
          labelStyle={{ color: "#cbd5e1" }}
        />
        <Legend />
        <Line type="monotone" dataKey="gelir" stroke="#34d399" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="gider" stroke="#fb7185" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
