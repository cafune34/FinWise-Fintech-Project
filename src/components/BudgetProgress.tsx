import { calculateBudgetUsagePercent, isBudgetExceeded } from "@/lib/finance";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import { categoryLabels } from "@/lib/labels";
import type { Budget } from "@/types/finance";

type BudgetProgressProps = {
  budget: Budget;
};

export default function BudgetProgress({ budget }: BudgetProgressProps) {
  const usagePercent = calculateBudgetUsagePercent(budget);
  const usageRatio = Math.min(usagePercent / 100, 1);
  const remaining = budget.limit - budget.spent;
  const exceeded = isBudgetExceeded(budget);

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
    </article>
  );
}
