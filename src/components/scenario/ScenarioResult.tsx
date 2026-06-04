"use client";

import React from "react";
import type { ScenarioSimulationResult } from "@/lib/scenarioSimulator";
import { formatCurrencyTRY, formatPercent, getScenarioTypeLabel } from "@/lib/scenarioSimulator";
import { categoryLabels } from "@/lib/labels";
import type { TransactionCategory } from "@/types/finance";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

type ScenarioResultProps = {
  result: ScenarioSimulationResult;
};

export default function ScenarioResult({ result }: ScenarioResultProps) {
  const {
    scenario,
    currentBalance,
    simulatedBalance,
    balanceDelta,
    simulatedMonthlyIncome,
    simulatedMonthlyExpense,
    currentNetCashFlow,
    simulatedNetCashFlow,
    netCashFlowDelta,
    budgetImpact,
    emergencyFundImpact,
    finWiseScoreImpact,
    riskLevel,
    recommendations,
    warnings,
    disclaimer,
  } = result;

  // Score color helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-cyan-300";
    return "text-rose-400";
  };

  // Risk Level styling helpers
  const getRiskStyles = (level: typeof riskLevel) => {
    switch (level) {
      case "kritik":
        return {
          bg: "bg-rose-500/10 border-rose-500/30",
          text: "text-rose-400",
          badge: "bg-rose-500 text-slate-950 font-black",
          label: "KRİTİK",
        };
      case "yuksek":
        return {
          bg: "bg-orange-500/10 border-orange-500/30",
          text: "text-orange-400",
          badge: "bg-orange-500 text-slate-950 font-bold",
          label: "YÜKSEK",
        };
      case "orta":
        return {
          bg: "bg-amber-500/10 border-amber-500/30",
          text: "text-amber-400",
          badge: "bg-amber-500 text-slate-950 font-medium",
          label: "ORTA",
        };
      default:
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30",
          text: "text-emerald-400",
          badge: "bg-emerald-500 text-slate-950 font-medium",
          label: "Düşük",
        };
    }
  };

  const riskStyles = getRiskStyles(riskLevel);

  // Budget status styles
  const getBudgetStatusBadgeClass = (status: string) => {
    if (status === "Bütçe Aşıldı") return "bg-rose-500/15 text-rose-400 border border-rose-500/25";
    if (status === "Limite Yakın") return "bg-amber-500/15 text-amber-400 border border-amber-500/25";
    return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25";
  };

  // Emergency Fund status styles
  const getEFStatusClass = (status: string) => {
    if (status === "Kritik") return "text-rose-400";
    if (status === "Geliştirilmeli") return "text-amber-400";
    return "text-emerald-400";
  };

  return (
    <div className="space-y-6">
      {/* Risk Seviyesi ve Üst Özet Kartı */}
      <div className={`rounded-2xl border p-6 backdrop-blur-xl ${riskStyles.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4.5">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950/40 border border-white/5">
              <Activity className={`h-6 w-6 ${riskStyles.text}`} />
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] tracking-wide mb-1 uppercase ${riskStyles.badge}`}>
                {riskStyles.label} RİSK
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                {scenario.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tür: {getScenarioTypeLabel(scenario.type)} | Tutar: {formatCurrencyTRY(scenario.amount)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400">Simüle Edilen Risk Seviyesi</p>
            <p className={`text-2xl font-bold mt-1 ${riskStyles.text}`}>
              {riskStyles.label}
            </p>
          </div>
        </div>
        {scenario.note && (
          <div className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-300 italic leading-relaxed">
            &ldquo;{scenario.note}&rdquo;
          </div>
        )}
      </div>

      {/* FinWise Score ve Bakiye / Akış Etkisi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Score Kartı */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Simülasyon Skoru</h4>
              <p className="text-xs text-slate-500 mt-1">
                Senaryo sonrası tahmin edilen finansal skor
              </p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-extrabold ${getScoreColor(finWiseScoreImpact.after)}`}>
                {finWiseScoreImpact.after}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/100</span>
            </div>
          </div>

          <div className="space-y-4.5 mt-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Mevcut Durum Skoru:</span>
              <span className="font-semibold text-white">{finWiseScoreImpact.before}/100</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Skor Değişimi:</span>
              <span className={`font-bold inline-flex items-center gap-1 ${finWiseScoreImpact.delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {finWiseScoreImpact.delta >= 0 ? "+" : ""}
                {finWiseScoreImpact.delta}
                {finWiseScoreImpact.delta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
              </span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2 mt-4">
              <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className="absolute top-0 left-0 h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${finWiseScoreImpact.before}%` }}
                />
              </div>
              <div className="relative h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                    finWiseScoreImpact.delta >= 0 ? "bg-cyan-400" : "bg-rose-500"
                  }`}
                  style={{ width: `${finWiseScoreImpact.after}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 pt-1">
                <span>Gri: Mevcut ({finWiseScoreImpact.before})</span>
                <span>Renkli: Simülasyon ({finWiseScoreImpact.after})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bakiye & Nakit Akışı Değişimi */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Ana Finansal Değişim</h4>

            {/* Bakiye Değişimi */}
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Toplam Bakiye</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 line-through">{formatCurrencyTRY(currentBalance)}</p>
                <p className="text-sm font-bold text-white mt-0.5">{formatCurrencyTRY(simulatedBalance)}</p>
                <p className={`text-[10px] font-semibold ${balanceDelta >= 0 ? "text-emerald-400" : "text-rose-400"} mt-0.5`}>
                  {balanceDelta >= 0 ? "+" : ""}
                  {formatCurrencyTRY(balanceDelta)}
                </p>
              </div>
            </div>

            {/* Nakit Akışı Değişimi */}
            <div className="flex justify-between items-center pt-1.5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-300" />
                <span className="text-sm text-slate-200">Aylık Nakit Akışı</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 line-through">{formatCurrencyTRY(currentNetCashFlow)}</p>
                <p className={`text-sm font-bold mt-0.5 ${simulatedNetCashFlow >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  {formatCurrencyTRY(simulatedNetCashFlow)}
                </p>
                <p className={`text-[10px] font-semibold ${netCashFlowDelta >= 0 ? "text-emerald-400" : "text-rose-400"} mt-0.5`}>
                  {netCashFlowDelta >= 0 ? "+" : ""}
                  {formatCurrencyTRY(netCashFlowDelta)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-900/60 p-2.5 border border-white/5 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Aylık Gelir: <b className="text-emerald-400 font-semibold">{formatCurrencyTRY(simulatedMonthlyIncome)}</b></span>
            <span>Aylık Gider: <b className="text-rose-400 font-semibold">{formatCurrencyTRY(simulatedMonthlyExpense)}</b></span>
          </div>
        </div>
      </div>

      {/* Kategori Bütçe Etkisi */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
        <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Kategori Bütçe Etkisi</h4>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-white">
                {categoryLabels[budgetImpact.category as TransactionCategory] || budgetImpact.category} Kategorisi
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                {budgetImpact.limit !== undefined
                  ? `Aylık bütçe limiti: ${formatCurrencyTRY(budgetImpact.limit)}`
                  : "Bu kategori için bütçe limiti tanımlanmamış."}
              </p>
            </div>
            {budgetImpact.limit !== undefined && (
              <span className={`self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-bold ${getBudgetStatusBadgeClass(budgetImpact.status)}`}>
                {budgetImpact.status}
              </span>
            )}
          </div>

          {budgetImpact.limit !== undefined ? (
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
                  <p className="text-slate-400">Mevcut Harcama</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    {formatCurrencyTRY(budgetImpact.currentSpent)} ({formatPercent(budgetImpact.usageBefore ?? 0)})
                  </p>
                </div>
                <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
                  <p className="text-slate-400">Simüle Harcama</p>
                  <p className="text-sm font-semibold text-cyan-200 mt-1">
                    {formatCurrencyTRY(budgetImpact.simulatedSpent)} ({formatPercent(budgetImpact.usageAfter ?? 0)})
                  </p>
                </div>
              </div>

              {/* Progress bar comparison */}
              <div className="relative pt-2">
                <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="absolute top-0 left-0 h-full bg-slate-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, budgetImpact.usageBefore ?? 0)}%` }}
                  />
                  <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                      (budgetImpact.usageAfter ?? 0) > 100 ? "bg-rose-500" : "bg-cyan-400"
                    }`}
                    style={{ width: `${Math.min(100, budgetImpact.usageAfter ?? 0)}%` }}
                  />
                </div>
                {budgetImpact.limit !== undefined && (
                  <div className="absolute right-0 top-full text-[9px] text-slate-500 mt-0.5">
                    Limit: {formatCurrencyTRY(budgetImpact.limit)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-4 text-center mt-3 text-xs text-slate-400">
              Limit olmadığı için bütçe aşım hesaplaması yapılmamıştır. Bu harcama genel birikimlerinize veya nakit akışınıza yansır.
            </div>
          )}
        </div>
      </div>

      {/* Acil Durum Fonu Etkisi */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Acil Durum Fonu Etkisi</h4>
            <p className="text-xs text-slate-500 mt-1">
              3 Aylık temel yaşam gideri hedefine göre koruma seviyesi
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Simüle Durum: </span>
            <span className={`text-sm font-bold ${getEFStatusClass(emergencyFundImpact.statusLabel)}`}>
              {emergencyFundImpact.statusLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
              <span className="text-slate-400 block mb-0.5">Yeni Hedef Tutar (3 Aylık)</span>
              <span className="text-sm font-bold text-white">{formatCurrencyTRY(emergencyFundImpact.targetAmount)}</span>
            </div>
            <div className="rounded-xl bg-slate-900/40 border border-white/5 p-3">
              <span className="text-slate-400 block mb-0.5">Eksik Kalan Tampon</span>
              <span className={`text-sm font-bold ${emergencyFundImpact.missingAmountAfterScenario > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                {emergencyFundImpact.missingAmountAfterScenario > 0
                  ? formatCurrencyTRY(emergencyFundImpact.missingAmountAfterScenario)
                  : "Tampon Eksiksiz"}
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Koruma Seviyesi (Tamamlanma Oranı)</span>
              <span>{formatPercent(emergencyFundImpact.simulatedCompletion)}</span>
            </div>
            
            {/* Compare progress bars */}
            <div className="relative h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
              <div
                className="absolute top-0 left-0 h-full bg-slate-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, emergencyFundImpact.currentCompletion)}%` }}
              />
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  emergencyFundImpact.simulatedCompletion >= 100
                    ? "bg-emerald-400"
                    : emergencyFundImpact.simulatedCompletion >= 67
                    ? "bg-cyan-400"
                    : emergencyFundImpact.simulatedCompletion >= 34
                    ? "bg-amber-400"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, emergencyFundImpact.simulatedCompletion)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500">
              <span>Mevcut Oran: {formatPercent(emergencyFundImpact.currentCompletion)}</span>
              <span>Yeni Oran: {formatPercent(emergencyFundImpact.simulatedCompletion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Uyarılar ve Öneriler */}
      {(warnings.length > 0 || recommendations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Uyarılar */}
          {warnings.length > 0 && (
            <div className="rounded-2xl border border-rose-500/10 bg-rose-500/[0.025] p-5">
              <h4 className="text-xs uppercase tracking-wider text-rose-400 font-bold mb-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-rose-400" />
                Önemli Risk Uyarıları
              </h4>
              <ul className="space-y-2 text-xs text-rose-300/90 pl-1 list-none">
                {warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-rose-400 select-none font-bold mt-0.5">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Önerilen Aksiyonlar */}
          {recommendations.length > 0 && (
            <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/[0.025] p-5">
              <h4 className="text-xs uppercase tracking-wider text-cyan-300 font-bold mb-3 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-300" />
                Önerilen Karar Aksiyonları
              </h4>
              <ul className="space-y-2 text-xs text-cyan-200/90 pl-1 list-none">
                {recommendations.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-cyan-300 select-none font-bold mt-0.5">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Feragatname Bilgisi */}
      <footer className="text-[10px] text-slate-500 text-center leading-relaxed border-t border-white/5 pt-4 mt-6">
        {disclaimer}
      </footer>
    </div>
  );
}
