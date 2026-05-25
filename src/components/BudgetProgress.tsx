import { calculateBudgetUsagePercent, isBudgetExceeded } from "@/lib/finance";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import type { Budget, TransactionCategory } from "@/types/finance";

const categoryLabels: Record<TransactionCategory, string> = {
  market: "Market",
  ulasim: "Ulasim",
  fatura: "Fatura",
  egitim: "Egitim",
  eglence: "Eglence",
  saglik: "Saglik",
  kira: "Kira",
  maas: "Maas",
  transfer: "Transfer",
  yatirim: "Yatirim",
  diger: "Diger",
};

type BudgetProgressProps = {
  budget: Budget;
};

export default function BudgetProgress({ budget }: BudgetProgressProps) {
  const usagePercent = calculateBudgetUsagePercent(budget);
  const usageRatio = Math.min(usagePercent / 100, 1);
  const remaining = budget.limit - budget.spent;
  const exceeded = isBudgetExceeded(budget);

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">{categoryLabels[budget.category]}</h3>
        <span className={exceeded ? "text-sm text-rose-300" : "text-sm text-cyan-300"}>
          {formatPercent(usagePercent / 100)}
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all ${exceeded ? "bg-rose-400" : "bg-cyan-400"}`}
          style={{ width: `${Math.max(0, Math.min(usageRatio * 100, 100))}%` }}
        />
      </div>

      <div className="mt-3 grid gap-1 text-sm text-slate-300">
        <p>Limit: {formatCurrencyTRY(budget.limit)}</p>
        <p>Harcanan: {formatCurrencyTRY(budget.spent)}</p>
        <p className={exceeded ? "text-rose-300" : "text-emerald-300"}>
          {exceeded ? `Asim: ${formatCurrencyTRY(Math.abs(remaining))}` : `Kalan: ${formatCurrencyTRY(remaining)}`}
        </p>
      </div>
    </article>
  );
}
