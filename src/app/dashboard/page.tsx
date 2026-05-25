import AppShell from "@/components/AppShell";
import { mockAccounts, mockBudgets, mockTransactions, mockUser } from "@/data/mockData";
import { formatCurrencyTRY } from "@/lib/format";

export default function DashboardPage() {
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const monthlyExpense = mockTransactions
    .filter((txn) => txn.direction === "out")
    .slice(0, 20)
    .reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <AppShell
      title="Dashboard"
      description="FinWise Sprint 1 kapsaminda temel genel gorunum. Detayli grafik ve analizler sonraki sprintlerde eklenecektir."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Kullanici</p>
          <p className="mt-1 text-lg font-semibold text-white">{mockUser.fullName}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Toplam Bakiye</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrencyTRY(totalBalance)}</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm text-slate-400">Ornek Aylik Gider</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrencyTRY(monthlyExpense)}</p>
        </article>
      </div>

      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-base font-semibold text-white">Butce Kategorileri</h3>
        <p className="mt-2 text-sm text-slate-300">Bu sprintte sadece ozet gosterim sunulmustur.</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          {mockBudgets.slice(0, 3).map((budget) => (
            <li key={budget.id} className="flex items-center justify-between rounded-lg bg-slate-800/70 px-3 py-2">
              <span className="capitalize">{budget.category}</span>
              <span>{formatCurrencyTRY(budget.spent)} / {formatCurrencyTRY(budget.limit)}</span>
            </li>
          ))}
        </ul>
      </article>
    </AppShell>
  );
}
