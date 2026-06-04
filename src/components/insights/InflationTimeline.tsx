"use client";

import { AlertTriangle, TrendingDown, Clock, Info } from "lucide-react";
import type { InflationTimelineResult } from "@/lib/inflationTimeline";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import { clsx } from "clsx";

type InflationTimelineProps = {
  data: InflationTimelineResult;
};

export default function InflationTimeline({ data }: InflationTimelineProps) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Mevcut TL Varlık</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatCurrencyTRY(data.baseAmount)}</p>
        </div>
        
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Baz Yıl Endeksi ({data.baseYear})</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">100</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Mevcut Endeks ({data.currentYear})</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-bold text-rose-400">{data.points[data.points.length - 1]?.purchasingPowerIndex || 0}</p>
            <TrendingDown className="h-5 w-5 text-rose-400" />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Toplam Demo Değer Kaybı</p>
          <p className="mt-2 text-2xl font-bold text-amber-300">-{formatPercent(data.totalPurchasingPowerLossPercent)}</p>
        </div>
      </div>

      {/* Main Timeline Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-300" />
              Yıllara Göre Zaman Tüneli
            </h3>
            <p className="mt-1 text-sm text-slate-400">{data.summary}</p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Demo Veri - Resmi TÜFE Değildir</span>
          </div>
        </div>

        {data.points.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
            <p className="text-sm text-slate-400">Zaman tüneli verisi bulunamadı.</p>
          </div>
        ) : (
          <div className="relative mt-8">
            {/* Horizontal connection line for desktop */}
            <div className="absolute top-8 left-0 hidden h-0.5 w-full bg-gradient-to-r from-emerald-500/50 via-amber-500/50 to-rose-500/50 md:block" />
            
            {/* Vertical connection line for mobile */}
            <div className="absolute top-0 left-6 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/50 via-amber-500/50 to-rose-500/50 md:hidden" />

            <div className="flex flex-col gap-8 md:flex-row md:justify-between md:gap-4">
              {data.points.map((point, index) => {
                const isBaseYear = index === 0;
                const isCurrentYear = index === data.points.length - 1;
                
                return (
                  <div key={point.year} className="relative flex flex-row items-start gap-4 md:flex-col md:items-center md:gap-3 flex-1">
                    {/* Node point */}
                    <div className={clsx(
                      "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[#0b1220] font-bold shadow-lg transition-transform hover:scale-110",
                      isBaseYear ? "bg-emerald-400 text-[#0b1220]" : 
                      isCurrentYear ? "bg-rose-400 text-[#0b1220]" : 
                      "bg-amber-400 text-[#0b1220]"
                    )}>
                      {point.year}
                    </div>

                    {/* Card */}
                    <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center md:min-h-[140px] md:p-3 hover:bg-white/[0.06] transition">
                      <div className="mb-2 text-sm font-semibold text-white">
                        Endeks: {point.purchasingPowerIndex}
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <p>Alım Gücü Karşılığı:</p>
                        <p className="font-bold text-cyan-300">{point.formattedEquivalentValue}</p>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-500 line-clamp-2 md:line-clamp-3" title={point.note}>
                        {point.note}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl bg-cyan-500/5 p-4 border border-cyan-500/20">
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-cyan-400" />
            <div>
              <h4 className="text-sm font-semibold text-cyan-200">Kur ve Enflasyon Yorumu</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">{data.interpretation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-xl border border-white/10 bg-[#111827]/80 p-6">
        <h3 className="mb-4 text-sm font-semibold text-white">Aksiyon Önerileri</h3>
        <ul className="grid gap-3 sm:grid-cols-3">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs leading-relaxed text-slate-300">
              <span className="mb-1 block text-cyan-400 font-bold">Öneri {i + 1}</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-slate-500">
        {data.disclaimer}
      </p>
    </div>
  );
}
