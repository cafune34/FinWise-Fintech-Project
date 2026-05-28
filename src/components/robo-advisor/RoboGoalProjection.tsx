"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Info } from "lucide-react";
import { formatCurrencyTRY } from "@/lib/format";

type RoboGoalProjectionProps = {
  profile: "dusuk" | "orta" | "yuksek";
  baseAmount?: number;
};

export default function RoboGoalProjection({ profile, baseAmount = 10000 }: RoboGoalProjectionProps) {
  const data = useMemo(() => {
    const points = [];
    let current = baseAmount;
    
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Generate 12 months of mock projection data based on profile
    for (let month = 1; month <= 12; month++) {
      let change = 0;
      const rand = pseudoRandom(month);
      if (profile === "dusuk") {
        change = current * (0.02 + rand * 0.01); // 2-3%
      } else if (profile === "orta") {
        change = current * (0.03 + (rand - 0.2) * 0.04); // 1-5%
      } else {
        change = current * (0.05 + (rand - 0.5) * 0.1); // -5% to 15%
      }
      current += change;
      
      points.push({
        month: `${month}. Ay`,
        amount: Math.round(current),
      });
    }
    return points;
  }, [profile, baseAmount]);

  const profileLabel = profile === "dusuk" ? "Düşük Risk" : profile === "orta" ? "Orta Risk" : "Yüksek Risk";
  const expectedReturn = data[11].amount - baseAmount;

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            12 Aylık Varsayımsal Hedef Görünümü
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            <strong>{profileLabel}</strong> profiline göre örnek birikim rotası.
          </p>
        </div>
      </div>

      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px" }}
              itemStyle={{ color: "#22d3ee" }}
              formatter={(value: unknown) => [formatCurrencyTRY(Number(value) || 0), "Tahmini Tutar"]}
              labelStyle={{ color: "#94a3b8", marginBottom: "4px" }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#22d3ee" 
              strokeWidth={3}
              dot={{ fill: "#0f172a", stroke: "#22d3ee", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#22d3ee" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/50 border border-white/5">
        <div>
          <p className="text-xs text-slate-400">Başlangıç</p>
          <p className="text-sm font-medium text-slate-200">{formatCurrencyTRY(baseAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">12 Ay Sonunda Varsayımsal Tutar</p>
          <p className="text-lg font-semibold text-cyan-300">{formatCurrencyTRY(data[11].amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Potansiyel Getiri</p>
          <p className="text-sm font-medium text-emerald-400">+{formatCurrencyTRY(expectedReturn)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-1.5 text-[10px] text-slate-500">
        <Info className="h-3.5 w-3.5 shrink-0 text-slate-500 mt-0.5" />
        <p>
          Bilgilendirme amaçlı ön izleme: Bu grafik risk profiline göre oluşturulan varsayımsal birikim rotasıdır; gerçek piyasa koşulları değişebilir.
        </p>
      </div>
    </article>
  );
}
