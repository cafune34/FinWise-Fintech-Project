"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { PortfolioAllocation } from "@/types/finance";

type RoboAllocationChartProps = {
  data: PortfolioAllocation[];
};

const COLORS = ["#22d3ee", "#2dd4bf", "#60a5fa", "#f59e0b"];

export default function RoboAllocationChart({ data }: RoboAllocationChartProps) {
  const hasChartData = data.length > 0;

  return (
    <div className="h-[360px] min-h-[360px] min-w-0 rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
      <p className="mb-3 text-sm font-medium text-slate-200">Önerilen Dağılım</p>
      <div className="h-[300px] min-h-[300px] min-w-0">
        {hasChartData ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-white/10 bg-slate-950/30">
            <p className="text-xs text-slate-500">Grafik için yeterli veri yok.</p>
          </div>
        )}
      </div>
    </div>
  );
}

