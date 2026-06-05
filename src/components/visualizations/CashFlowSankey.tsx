"use client";

import { CashFlowSankeyResult, formatCurrencyTRY, formatPercent } from "@/lib/cashFlowSankey";
import { Info, TrendingDown, TrendingUp, Wallet, AlertCircle, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

export default function CashFlowSankey({ data }: { data: CashFlowSankeyResult }) {
  const rightNodes = data.nodes.filter(n => n.id !== "income");
  
  const getNodeColor = (type: string) => {
    switch (type) {
      case "income": return "from-emerald-400 to-emerald-600 border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
      case "investment": return "from-indigo-400 to-indigo-600 border-indigo-400/30 bg-indigo-400/10 text-indigo-300";
      case "transfer": return "from-cyan-400 to-cyan-600 border-cyan-400/30 bg-cyan-400/10 text-cyan-300";
      case "remaining": return "from-emerald-300 to-emerald-500 border-emerald-300/30 bg-emerald-300/10 text-emerald-200";
      case "shortfall": return "from-rose-500 to-rose-700 border-rose-500/30 bg-rose-500/10 text-rose-300";
      case "expense": default: return "from-slate-400 to-slate-600 border-slate-400/30 bg-slate-400/10 text-slate-300";
    }
  };

  const getLinkColor = (type: string) => {
    switch (type) {
      case "investment": return "bg-indigo-500/20";
      case "transfer": return "bg-cyan-500/20";
      case "remaining": return "bg-emerald-500/20";
      case "shortfall": return "bg-rose-500/20";
      case "expense": default: return "bg-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Toplam Gelir</p>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCurrencyTRY(data.totalIncome)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Toplam Çıkış</p>
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{formatCurrencyTRY(data.totalOutflow)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Net Durum</p>
            <Wallet className={clsx("h-5 w-5", data.remainingCash >= 0 ? "text-emerald-400" : "text-rose-400")} />
          </div>
          <p className={clsx("mt-2 text-2xl font-semibold", data.remainingCash >= 0 ? "text-white" : "text-rose-300")}>
            {formatCurrencyTRY(data.remainingCash)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Tasarruf Oranı</p>
            <Info className="h-5 w-5 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(data.savingsRate)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <h3 className="text-lg font-semibold text-white mb-6">Para Akış Diyagramı ({data.periodLabel})</h3>
        
        {data.totalIncome === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-slate-500 mb-4" />
            <p className="text-slate-300">Bu dönem için gelir verisi bulunamadı.</p>
            <p className="text-sm text-slate-500 mt-2">Giderlerinizi harcama kategorilerinden inceleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-8 lg:gap-16">
            <div className="w-full lg:w-1/3 flex-shrink-0 flex flex-col justify-center min-h-[300px]">
              <div className="relative z-10 w-full rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                <h4 className="text-sm uppercase tracking-wider text-emerald-400 font-semibold mb-2">GELİR</h4>
                <p className="text-3xl font-bold text-white">{formatCurrencyTRY(data.totalIncome)}</p>
                <p className="text-sm text-emerald-300 mt-1">%100</p>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 flex-col justify-center py-8 relative min-h-[300px]">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent w-full rounded-full" />
              <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1/2 text-slate-500 h-6 w-6" />
            </div>

            <div className="w-full lg:w-1/2 flex-shrink-0 flex flex-col gap-4">
              {rightNodes.map(node => (
                <div key={node.id} className="relative group">
                  <div className={clsx("w-full rounded-xl border p-4 backdrop-blur-md transition-all hover:scale-[1.02]", getNodeColor(node.type))}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold truncate pr-4">{node.label}</h4>
                      <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded-md">
                        {formatPercent(node.percentage)}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">{formatCurrencyTRY(node.amount)}</p>
                    
                    <div className="mt-3 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className={clsx("h-full rounded-full", getLinkColor(node.type).replace('/20', '/80'))} 
                        style={{ width: `${Math.min(node.percentage, 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4">Finansal İçgörüler</h3>
          {data.insights.length > 0 ? (
            <ul className="space-y-3">
              {data.insights.map((insight, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Yeterli içgörü bulunamadı.</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white mb-4">Akıllı Öneriler</h3>
          {data.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {data.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Uygun öneri bulunamadı.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-slate-500 mt-8">{data.disclaimer}</p>
    </div>
  );
}
