"use client";

import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { useFinanceData } from "@/lib/useFinanceData";
import { formatCurrencyTRY } from "@/lib/format";
import { categoryLabels } from "@/lib/labels";
import type { TransactionCategory } from "@/types/finance";

export default function ScenarioAnalysisCard() {
  const { transactions } = useFinanceData();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("eglence");
  const [reductionPercent, setReductionPercent] = useState<number>(20);

  // Bu ayki kategori harcamasını bul
  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.occurredAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const categoryExpense = thisMonthTransactions
    .filter((t) => t.category === selectedCategory && t.type === "gider")
    .reduce((sum, t) => sum + t.amount, 0);

  const savedAmount = (categoryExpense * reductionPercent) / 100;
  
  // Toplam net nakit akışını bul
  const totalIncome = thisMonthTransactions.filter((t) => t.type === "gelir").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = thisMonthTransactions.filter((t) => t.type === "gider").reduce((sum, t) => sum + t.amount, 0);
  const currentNetFlow = totalIncome - totalExpense;
  const newNetFlow = currentNetFlow + savedAmount;

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-400" />
            Senaryo Analizi
          </h3>
          <p className="mt-1 text-xs text-slate-400">Harcama azaltma simülasyonu</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Kategori Seçin</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
              className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-purple-400"
            >
              {(Object.keys(categoryLabels) as TransactionCategory[]).filter(c => c !== "maas" && c !== "transfer").map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Azaltma Oranı</label>
            <select
              value={reductionPercent}
              onChange={(e) => setReductionPercent(Number(e.target.value))}
              className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-purple-400"
            >
              <option value={10}>%10 Azalt</option>
              <option value={20}>%20 Azalt</option>
              <option value={30}>%30 Azalt</option>
              <option value={50}>%50 Azalt</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-white/5 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs text-slate-400">Bu ayki harcama:</span>
            <span className="text-sm font-medium text-slate-200">{formatCurrencyTRY(categoryExpense)}</span>
          </div>
          
          <div className="flex justify-between items-end">
            <span className="text-xs text-slate-400">Beklenen Tasarruf:</span>
            <span className="text-lg font-semibold text-emerald-400">+{formatCurrencyTRY(savedAmount)}</span>
          </div>

          <div className="h-px w-full bg-white/5 my-2"></div>

          <div className="flex justify-between items-end">
            <span className="text-xs text-slate-400">Yeni Net Nakit Akışı:</span>
            <div className="text-right">
              <span className={`text-sm font-bold flex items-center gap-1 justify-end ${newNetFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                <TrendingUp className="h-3 w-3" />
                {formatCurrencyTRY(newNetFlow)}
              </span>
              <span className="text-[10px] text-slate-500 line-through">Eski: {formatCurrencyTRY(currentNetFlow)}</span>
            </div>
          </div>
        </div>

      </div>
    </article>
  );
}
