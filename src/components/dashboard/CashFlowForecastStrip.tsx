"use client";

import { useMemo } from "react";
import { Activity } from "lucide-react";
import { useFinanceData } from "@/lib/useFinanceData";
import { calculateUpcomingCashOutflow, getSmartInsights } from "@/lib/insights";

export default function CashFlowForecastStrip() {
  const { paymentOrders, transactions } = useFinanceData();

  const insights = useMemo(() => getSmartInsights(transactions, paymentOrders), [transactions, paymentOrders]);
  const upcomingOutflow = useMemo(() => calculateUpcomingCashOutflow(paymentOrders, transactions, 7), [paymentOrders, transactions]);

  const hasHighOutflow = upcomingOutflow > 5000;

  return (
    <div className={`w-full rounded-lg border p-4 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${hasHighOutflow ? "bg-rose-500/10 border-rose-500/20" : "bg-cyan-500/10 border-cyan-500/20"}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${hasHighOutflow ? "bg-rose-500/20 text-rose-300" : "bg-cyan-500/20 text-cyan-300"}`}>
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Nakit Akışı Tahmini (7 Gün)</h4>
          <p className="text-xs text-slate-300 mt-0.5">
            Beklenen çıkış: <span className="font-bold">₺{upcomingOutflow.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>
      <div className="flex-1 md:ml-4">
        <ul className="space-y-1">
          {insights.slice(0, 2).map((insight) => (
            <li key={insight.id} className="text-xs flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${insight.type === "warning" ? "bg-rose-400" : insight.type === "success" ? "bg-emerald-400" : "bg-cyan-400"}`} />
              <span className="text-slate-300">{insight.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
