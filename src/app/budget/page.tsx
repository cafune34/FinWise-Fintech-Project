import AppShell from "@/components/AppShell";
import BudgetProgress from "@/components/BudgetProgress";
import { mockBudgets } from "@/data/mockData";
import { isBudgetExceeded } from "@/lib/finance";

export default function BudgetPage() {
  const exceededBudgets = mockBudgets.filter((budget) => isBudgetExceeded(budget));

  return (
    <AppShell
      title="Butce"
      description="Kategori bazli butce takibi mock verilerle yapilir. Bu sprintte tahminleme yoktur, yalnizca mevcut durum gosterilir."
    >
      {exceededBudgets.length > 0 ? (
        <article className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          <p className="font-medium">Butce asimi uyarisi</p>
          <p className="mt-1">{exceededBudgets.length} kategoride harcama limiti asilmis durumda.</p>
        </article>
      ) : (
        <article className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Tum kategoriler butce limitleri icinde gorunuyor.
        </article>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {mockBudgets.map((budget) => (
          <BudgetProgress key={budget.id} budget={budget} />
        ))}
      </div>
    </AppShell>
  );
}
