import AppShell from "@/components/AppShell";
import ChartCard from "@/components/ChartCard";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import ExpenseByCategoryChart from "@/components/dashboard/ExpenseByCategoryChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import { mockAccounts, mockTransactions } from "@/data/mockData";
import {
  calculateMonthlyExpense,
  calculateMonthlyIncome,
  calculateNetCashFlow,
  calculateTotalBalance,
  getCategoryExpenseTotals,
  getRecentTransactions,
} from "@/lib/finance";
import { formatCurrencyTRY } from "@/lib/format";
import type { TransactionCategory } from "@/types/finance";

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

const monthLabels = ["Oca", "Sub", "Mar", "Nis", "May", "Haz", "Tem", "Agu", "Eyl", "Eki", "Kas", "Ara"];

export default function DashboardPage() {
  const referenceDate = new Date();
  const totalBalance = calculateTotalBalance(mockAccounts);
  const monthlyIncome = calculateMonthlyIncome(mockTransactions, referenceDate);
  const monthlyExpense = calculateMonthlyExpense(mockTransactions, referenceDate);
  const netCashFlow = calculateNetCashFlow(mockTransactions, referenceDate);

  const recentTransactions = getRecentTransactions(mockTransactions, 8);

  const categoryTotals = getCategoryExpenseTotals(mockTransactions, referenceDate);
  const categoryExpenseData = Object.entries(categoryTotals)
    .filter(([category, value]) => value > 0 && category !== "maas")
    .map(([category, value]) => ({
      name: categoryLabels[category as TransactionCategory],
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const monthlyTrendData = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (5 - index), 1);

    return {
      month: monthLabels[monthDate.getMonth()],
      gelir: calculateMonthlyIncome(mockTransactions, monthDate),
      gider: calculateMonthlyExpense(mockTransactions, monthDate),
    };
  });

  return (
    <AppShell
      title="Dashboard"
      description="Mock veriler uzerinden toplam bakiye, aylik nakit akisi, hesap ozeti ve temel grafikler sunulur."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Bakiye" value={formatCurrencyTRY(totalBalance)} />
        <StatCard title="Aylik Gelir" value={formatCurrencyTRY(monthlyIncome)} tone="positive" />
        <StatCard title="Aylik Gider" value={formatCurrencyTRY(monthlyExpense)} tone="negative" />
        <StatCard
          title="Net Nakit Akisi"
          value={formatCurrencyTRY(netCashFlow)}
          tone={netCashFlow >= 0 ? "positive" : "negative"}
        />
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {mockAccounts.map((account) => (
          <article key={account.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">{account.type}</p>
            <h3 className="mt-1 text-base font-semibold text-white">{account.bankName}</h3>
            <p className="mt-3 text-lg font-semibold text-cyan-300">{formatCurrencyTRY(account.balance)}</p>
            <p className="mt-1 text-sm text-slate-400">Para Birimi: {account.currency}</p>
          </article>
        ))}
      </section>

      <section>
        <h3 className="mb-3 text-base font-semibold text-white">Son 8 Islem</h3>
        <TransactionTable transactions={recentTransactions} accounts={mockAccounts} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Kategori Bazli Harcama" description="Bu ay icindeki gider islemlerinin dagilimi.">
          <ExpenseByCategoryChart data={categoryExpenseData} />
        </ChartCard>

        <ChartCard title="Aylik Gelir-Gider" description="Son 6 ay icin gelir ve gider degisimi.">
          <IncomeExpenseChart data={monthlyTrendData} />
        </ChartCard>
      </section>
    </AppShell>
  );
}
