"use client";

import { useState } from "react";
import { calculateBudgetUsagePercent, isBudgetExceeded } from "@/lib/finance";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import { categoryLabels } from "@/lib/labels";
import type { Budget } from "@/types/finance";

type BudgetProgressProps = {
  budget: Budget;
  editable?: boolean;
  onUpdateLimit?: (budgetId: string, limit: number) => void;
};

function getCategoryInsight(category: string, usagePercent: number): string {
  const isHigh = usagePercent >= 90;
  const isMedium = usagePercent >= 60 && usagePercent < 90;

  switch (category) {
    case "yatirim":
      if (isHigh) return "Yatırım kategorisinde limit aşımı yüksek. Likit bakiye ve kısa vadeli ödeme planı birlikte değerlendirilmeli.";
      if (isMedium) return "Yatırım harcamaları artış eğiliminde, portföy hedefleri çerçevesinde takip edilmesi önerilir.";
      return "Yatırım bütçesi dengeli düzeyde ilerliyor, mevcut limit korunabilir.";
    case "fatura":
      if (isHigh) return "Fatura harcamaları limitini aşmış durumda. Gelecek dönem otomatik ödemeler ve fatura detayları incelenmeli.";
      if (isMedium) return "Fatura harcamaları düzenli gider etkisi oluşturuyor. Otomatik ödeme ve limit takibi önerilir.";
      return "Fatura harcamaları kontrol altında, mevcut bütçe koridorunda ilerliyor.";
    case "market":
      if (isHigh) return "Market harcamaları limit sınırına yakın/aşılmış durumda. Günlük temel harcama planı gözden geçirilmeli.";
      if (isMedium) return "Market harcamaları günlük bütçe disiplini açısından takip edilmeli.";
      return "Market harcamaları bütçe planına uyumlu seyrediyor.";
    case "ulasim":
      if (isHigh) return "Ulaşım giderlerinde yüksek kullanım tespit edildi, alternatif yol ve bütçe planları değerlendirilebilir.";
      if (isMedium) return "Ulaşım giderleri kontrollü görünüyor, mevcut limit korunabilir.";
      return "Ulaşım bütçesi son derece verimli yönetiliyor.";
    case "eglence":
      if (isHigh) return "Eğlence harcamaları limitini aşmış durumda. Bu ayki isteğe bağlı harcamalar durdurulabilir.";
      if (isMedium) return "Eğlence harcamaları isteğe bağlı giderler arasında izlenmeli.";
      return "Eğlence harcamaları tasarruf planı sınırları dahilinde dengeli seyrediyor.";
    default:
      if (isHigh) return "Bu kategorideki harcamalar limit sınırını aşmıştır. Acil kısıtlama önerilir.";
      if (isMedium) return "Harcamalar bütçe limitine yaklaşmaktadır, harcama hızı düşürülmelidir.";
      return "Kategori harcamaları bütçe limitleri dahilinde stabil görünmektedir.";
  }
}

export default function BudgetProgress({ budget, editable = false, onUpdateLimit }: BudgetProgressProps) {
  const [limitValue, setLimitValue] = useState(String(budget.limit));
  const usagePercent = calculateBudgetUsagePercent(budget);
  const usageRatio = Math.min(usagePercent / 100, 1);
  const remaining = budget.limit - budget.spent;
  const exceeded = isBudgetExceeded(budget);
  const parsedLimit = Number(limitValue);
  const limitIsValid = Number.isFinite(parsedLimit) && parsedLimit >= 0;

  function handleSave() {
    if (!limitIsValid || !onUpdateLimit) {
      return;
    }

    onUpdateLimit(budget.id, parsedLimit);
  }

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10 flex flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{categoryLabels[budget.category]}</h3>
          <span className={exceeded ? "text-sm text-rose-300" : "text-sm text-cyan-300"}>
            {formatPercent(usagePercent / 100)}
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-800/90">
          <div
            className={`h-full rounded-full transition-all ${exceeded ? "bg-rose-400" : "bg-cyan-400"}`}
            style={{ width: `${Math.max(0, Math.min(usageRatio * 100, 100))}%` }}
          />
        </div>

        <div className="mt-3 grid gap-1 text-sm text-slate-300">
          <p>Limit: {formatCurrencyTRY(budget.limit)}</p>
          <p>Harcanan: {formatCurrencyTRY(budget.spent)}</p>
          <p className={exceeded ? "text-rose-300" : "text-emerald-300"}>
            {exceeded ? `Aşım: ${formatCurrencyTRY(Math.abs(remaining))}` : `Kalan: ${formatCurrencyTRY(remaining)}`}
          </p>
        </div>

        {/* Akıllı İçgörü */}
        <div className="mt-3.5 border-t border-white/5 pt-3">
          <p className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-cyan-300">Akıllı İçgörü:</span> {getCategoryInsight(budget.category, usagePercent)}
          </p>
        </div>
      </div>

      {editable ? (
        <div className="mt-4 border-t border-white/10 pt-4">
          <label className="text-sm text-slate-200">
            Yeni limit
            <input
              type="number"
              min="0"
              step="0.01"
              value={limitValue}
              onChange={(event) => setLimitValue(event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>
          {!limitIsValid ? <p className="mt-2 text-xs text-rose-300">Limit 0 veya daha büyük olmalıdır.</p> : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={!limitIsValid}
            className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      ) : null}
    </article>
  );
}
