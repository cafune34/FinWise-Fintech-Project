import AppShell from "@/components/AppShell";
import { mockBudgets } from "@/data/mockData";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";

export default function BudgetPage() {
  return (
    <AppShell title="Butce" description="Kategori bazli butce takibi icin temel iskelet. Ileri analizler sonraki sprintte ele alinacak.">
      <div className="grid gap-3">
        {mockBudgets.map((budget) => {
          const ratio = budget.spent / budget.limit;

          return (
            <article key={budget.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between">
                <h3 className="capitalize text-base font-semibold text-white">{budget.category}</h3>
                <span className="text-sm text-cyan-300">{formatPercent(ratio)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {formatCurrencyTRY(budget.spent)} / {formatCurrencyTRY(budget.limit)}
              </p>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
