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
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
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
