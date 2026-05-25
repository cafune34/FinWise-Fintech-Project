"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PortfolioAllocation } from "@/types/finance";

type RoboAllocationChartProps = {
  data: PortfolioAllocation[];
};

const COLORS = ["#22d3ee", "#2dd4bf", "#60a5fa", "#f59e0b"];

export default function RoboAllocationChart({ data }: RoboAllocationChartProps) {
  return (
    <div className="h-72 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="mb-3 text-sm font-medium text-slate-200">Önerilen Portföy Dağılımı</p>
      <ResponsiveContainer width="100%" height="100%" minHeight={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="percentage"
            nameKey="asset"
            cx="50%"
            cy="50%"
            outerRadius={78}
            label={({ name, value }) => `${name}: %${value}`}
          >
            {data.map((item, index) => (
              <Cell key={item.asset} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `%${value}`}
            contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.5rem" }}
            labelStyle={{ color: "#cbd5e1" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

