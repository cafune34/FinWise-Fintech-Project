"use client";

import { useState } from "react";
import { clsx } from "clsx";
import {
  CalendarDays,
  Info,
  TrendingDown,
  Activity,
  Flame,
  MousePointerClick
} from "lucide-react";
import type { SpendingHeatmapDay, SpendingHeatmapResult } from "@/lib/spendingHeatmap";

type SpendingHeatmapProps = {
  result: SpendingHeatmapResult;
};

const intensityStyles = {
  none: "bg-slate-800/40 border-white/5",
  low: "bg-cyan-900/60 border-cyan-800/50",
  medium: "bg-cyan-700/80 border-cyan-600/50",
  high: "bg-cyan-500 border-cyan-400",
  extreme: "bg-cyan-300 border-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.5)]",
};

export function SpendingHeatmap({ result }: SpendingHeatmapProps) {
  const [selectedDay, setSelectedDay] = useState<SpendingHeatmapDay | null>(null);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
          <p className="text-xs text-slate-400">Toplam Harcama</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.totalSpent)} TL
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
          <p className="text-xs text-slate-400">Günlük Ortalama</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(result.averageDailySpend)} TL
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
          <p className="text-xs text-slate-400">Harcama Yapılan Gün</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {result.activeSpendingDays} / {result.days.length}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
          <p className="text-xs text-slate-400">En Yoğun Gün</p>
          <p className="mt-1 text-lg font-semibold text-cyan-300 truncate" title={result.highestSpendDay?.dayLabel}>
            {result.highestSpendDay ? result.highestSpendDay.dayLabel : "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Heatmap Grid Area */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarDays className="h-4 w-4 text-cyan-400" />
              Harcama Yoğunluğu
            </h3>
            <span className="text-xs text-slate-400">Son {result.days.length} Gün</span>
          </div>
          <p className="mb-6 text-sm text-slate-400 leading-relaxed">
            Günlük harcama yoğunluğunuzu renk koyuluğuna göre inceleyebilirsiniz. Detaylar için ilgili güne tıklayın.
          </p>

          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {result.days.map((day) => (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={clsx(
                  "h-5 w-5 md:h-6 md:w-6 rounded-[4px] border transition-all hover:scale-110",
                  intensityStyles[day.intensity],
                  selectedDay?.date === day.date && "ring-2 ring-white ring-offset-2 ring-offset-[#070b14]"
                )}
                title={`${day.dayLabel}: ${day.formattedAmount}`}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">Yoğunluk:</span>
              <div className="flex items-center gap-1.5">
                {result.intensityLegend.map((legend) => (
                  <div key={legend.intensity} className="flex items-center gap-1" title={legend.label}>
                    <div className={clsx("h-3 w-3 rounded-[3px] border", intensityStyles[legend.intensity])} />
                    <span className="hidden sm:inline">{legend.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <MousePointerClick className="h-3 w-3" />
              <span>Günlere tıklayarak detay görebilirsiniz</span>
            </div>
          </div>
        </div>

        {/* Selected Day Detail & Summary Area */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Seçilen Gün Detayı</h3>
            {selectedDay ? (
              <div className="space-y-4 animate-fade-in-slide">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-400">Tarih</span>
                  <span className="text-sm font-medium text-white">{selectedDay.dayLabel}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-400">Tutar</span>
                  <span className="text-sm font-semibold text-cyan-300">{selectedDay.formattedAmount}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-400">İşlem Sayısı</span>
                  <span className="text-sm text-slate-200">{selectedDay.transactionCount} Adet</span>
                </div>
                {selectedDay.topCategory && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-xs text-slate-400">En Baskın Kategori</span>
                    <span className="text-sm text-amber-200 truncate max-w-[120px]" title={selectedDay.topCategory}>
                      {selectedDay.topCategory}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center text-slate-500">
                <CalendarDays className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-xs text-center px-4 leading-relaxed">
                  Bir güne tıklayarak o güne ait toplam harcama, işlem sayısı ve baskın kategoriyi görebilirsiniz.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex-1">
            <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
              <Activity className="h-4 w-4 text-emerald-400" />
              İçgörüler
            </h3>
            <ul className="space-y-3">
              {result.insights.map((insight, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>

            <h3 className="flex items-center gap-2 mt-6 mb-4 text-sm font-semibold text-white">
              <Flame className="h-4 w-4 text-amber-400" />
              Öneriler
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <TrendingDown className="mt-0.5 h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
          <h4 className="text-xs font-semibold text-white mb-1.5">Bu harita neyi gösterir?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Her kare bir günü temsil eder. Renk yoğunluğu o gün yapılan toplam harcamayı gösterir.
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
          <h4 className="text-xs font-semibold text-white mb-1.5">Renkler nasıl okunur?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Koyu ve açık tonlar dönem içindeki harcama sıralamasına göre düşük, orta, yüksek ve aşırı günleri gösterir.
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
          <h4 className="text-xs font-semibold text-white mb-1.5">Aşırı günler neden önemli?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aşırı günler bütçe dengesini bozan tekil harcama sıçramalarını bulmak için kullanılır.
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
          <h4 className="text-xs font-semibold text-white mb-1.5">Nasıl aksiyon alınır?</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Aşırı günlerdeki kategoriye bakıp tekrar eden harcamalar için limit belirleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/50 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}
