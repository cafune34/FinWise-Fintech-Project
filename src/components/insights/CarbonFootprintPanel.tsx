"use client";

import {
  AlertTriangle,
  Leaf,
  Info,
  Sparkles,
  ShieldCheck,
  Globe,
} from "lucide-react";
import type { CarbonFootprintResult } from "@/lib/carbonFootprint";
import {
  formatCurrencyTRY,
  formatKgCo2,
  formatPercent,
} from "@/lib/carbonFootprint";
import { clsx } from "clsx";

type CarbonFootprintPanelProps = {
  result: CarbonFootprintResult;
};

export default function CarbonFootprintPanel({ result }: CarbonFootprintPanelProps) {
  const {
    totalExpenseAnalyzed,
    totalEstimatedKgCo2,
    highestImpactCategory,
    categoryBreakdown,
    impactLevel,
    summary,
    recommendations,
    methodologyNote,
    disclaimer,
    dataSourceLabel,
  } = result;

  const impactColors = {
    dusuk: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      badge: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
      label: "Düşük Etki",
    },
    orta: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      badge: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
      label: "Orta Etki",
    },
    yuksek: {
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/25",
      badge: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
      label: "Yüksek Etki",
    },
  };

  const currentImpact = impactColors[impactLevel];

  return (
    <div className="space-y-6">
      {/* 1. Üst Metrik Kartları */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Analiz Edilen Harcama */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm hover:bg-white/[0.05] transition-all">
          <p className="text-xs uppercase tracking-wider text-slate-400">Analiz Edilen Harcama</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrencyTRY(totalExpenseAnalyzed)}</p>
          <p className="mt-1 text-xs text-slate-500">Son 30 Günlük Giderler</p>
        </div>

        {/* Toplam Tahmini CO2 */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm hover:bg-white/[0.05] transition-all">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-slate-400">Tahmini CO2 Salınımı</p>
            <Leaf className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{formatKgCo2(totalEstimatedKgCo2)}</p>
          <p className="mt-1 text-xs text-slate-500">Eşdeğer Sera Gazı Etkisi</p>
        </div>

        {/* En Yüksek Karbon Etkisi Yapan Kategori */}
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm hover:bg-white/[0.05] transition-all">
          <p className="text-xs uppercase tracking-wider text-slate-400">En Yüksek Karbon Etkisi</p>
          {highestImpactCategory ? (
            <>
              <p className="mt-2 text-2xl font-bold text-white truncate" title={highestImpactCategory.label}>
                {highestImpactCategory.label}
              </p>
              <p className="mt-1 text-xs text-rose-400 font-medium">
                {formatKgCo2(highestImpactCategory.estimatedKgCo2)} (%{highestImpactCategory.percentage.toFixed(1)})
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-2xl font-bold text-slate-500">Kayıt Yok</p>
              <p className="mt-1 text-xs text-slate-500">Harcama tespit edilemedi</p>
            </>
          )}
        </div>

        {/* Genel ESG Etki Seviyesi */}
        <div className={clsx("rounded-xl border p-5 shadow-sm transition-all", currentImpact.border, currentImpact.bg)}>
          <p className="text-xs uppercase tracking-wider text-slate-400">Genel Karbon Seviyesi</p>
          <p className={clsx("mt-2 text-2xl font-bold", currentImpact.text)}>
            {currentImpact.label}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {totalEstimatedKgCo2 <= 50 ? "✓ Sürdürülebilir düzeyde" : "⚠️ ESG optimizasyonu önerilir"}
          </p>
        </div>
      </div>

      {/* 2. ESG Analiz Detay Bölümü */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kategori Kırılımı Tablosu */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 backdrop-blur-xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Globe className="h-5 w-5 text-cyan-300" />
                Kategori Bazlı Karbon Kırılımı
              </h3>
              <p className="mt-1 text-xs text-slate-400">Harcamalarınızın demo katsayılara göre karbon emisyon dağılımı</p>
            </div>
            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-medium text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{dataSourceLabel}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Kategori</th>
                  <th className="pb-3 text-right font-semibold">Harcama</th>
                  <th className="pb-3 text-right font-semibold">Demo Katsayı</th>
                  <th className="pb-3 text-right font-semibold">Tahmini Emisyon</th>
                  <th className="pb-3 text-right font-semibold">Pay (%)</th>
                  <th className="pb-3 text-right font-semibold">Etki Derecesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categoryBreakdown.map((row) => {
                  const itemImpact = impactColors[row.impactLevel];
                  return (
                    <tr key={row.category} className="group hover:bg-white/[0.02] transition-all">
                      <td className="py-3 font-medium text-white flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        {row.label}
                      </td>
                      <td className="py-3 text-right text-slate-300">{formatCurrencyTRY(row.amount)}</td>
                      <td className="py-3 text-right text-slate-400">
                        {row.coefficientKgPer1000Try} kg / 1k ₺
                      </td>
                      <td className="py-3 text-right text-emerald-300 font-semibold">
                        {formatKgCo2(row.estimatedKgCo2)}
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        {formatPercent(row.percentage)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={clsx("rounded-full px-2 py-0.5 text-[9px] font-semibold", itemImpact.badge)}>
                          {itemImpact.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* En Yüksek Karbon Etkisi Vurgu ve Özet Kartı */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-300" />
                ESG Karbon Görünümü
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {summary}
              </p>
            </div>

            {highestImpactCategory && (
              <div className="mt-6 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
                <h4 className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                  Kritik Emisyon Kaynağı: {highestImpactCategory.label}
                </h4>
                <p className="mt-2 text-xs text-slate-300 leading-normal">
                  Harcamalarınız içindeki en yüksek karbon etkisi <strong>{highestImpactCategory.label}</strong> kategorisinde gerçekleşmiştir. Toplam karbon salınımınızın <strong>%{highestImpactCategory.percentage.toFixed(1)}</strong> kadarı bu gruptan kaynaklanmaktadır.
                </p>
              </div>
            )}
          </div>

          {/* Sürdürülebilirlik Rozeti */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eğitim & ESG Farkındalığı</h4>
              <p className="text-[10px] text-slate-400 mt-1">Bu panel, harcamalarınızın karbon ayak izi bilincini geliştirmek amacıyla hazırlanmış bir fintech prototipidir.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Öneriler */}
      <div className="rounded-xl border border-white/10 bg-[#111827]/80 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          Karbon Ayak İzini Azaltma Önerileri
        </h3>
        <ul className="grid gap-3 sm:grid-cols-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-300">
              <span className="mb-1 block text-cyan-400 font-bold">Öneri {i + 1}</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Metodoloji Notu */}
      <div className="rounded-xl bg-cyan-500/5 p-4 border border-cyan-500/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h4 className="text-xs font-semibold text-cyan-200">Metodoloji ve Hesaplama Notu</h4>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{methodologyNote}</p>
          </div>
        </div>
      </div>

      {/* 5. Disclaimer */}
      <p className="text-center text-[10px] text-slate-500 leading-normal max-w-2xl mx-auto">
        {disclaimer}
      </p>
    </div>
  );
}
