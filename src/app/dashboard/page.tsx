import Link from "next/link";
import AppShell from "@/components/AppShell";
import ChartCard from "@/components/ChartCard";
import ForecastCard from "@/components/ForecastCard";
import RiskAlertCard from "@/components/RiskAlertCard";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import ExpenseByCategoryChart from "@/components/dashboard/ExpenseByCategoryChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
import { mockAccounts, mockBudgets, mockTransactions, mockUser } from "@/data/mockData";
import {
  calculateMonthlyExpense,
  calculateMonthlyIncome,
  calculateNetCashFlow,
  calculateTotalBalance,
  getCategoryExpenseTotals,
  getRecentTransactions,
} from "@/lib/finance";
import { forecastAllCategories, getRiskyForecastCategories } from "@/lib/forecasting";
import { formatCurrencyTRY } from "@/lib/format";
import { generateRegTechAlerts } from "@/lib/regtech";
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
  const forecastResults = forecastAllCategories(mockTransactions, mockBudgets, { referenceDate });
  const riskyForecasts = getRiskyForecastCategories(forecastResults, 3);
  const regtechAlerts = generateRegTechAlerts({
    transactions: mockTransactions,
    budgets: mockBudgets,
    userId: mockUser.id,
    referenceDate,
  });
  const priorityAlerts = regtechAlerts.slice(0, 3);
  const transactionById = new Map(mockTransactions.map((transaction) => [transaction.id, transaction]));

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

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
          <h3 className="text-base font-semibold text-cyan-200">Sprint 4 Ozeti</h3>
          <p className="mt-2 text-sm text-slate-200">
            PISP mantigini odeme emri simulasyonu ile test edin.
          </p>
          <Link
            href="/payments"
            className="mt-3 inline-flex items-center rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            Odeme Simulasyonunu Dene
          </Link>
        </article>

        <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <h3 className="text-base font-semibold text-emerald-200">Sprint 4 Ozeti</h3>
          <p className="mt-2 text-sm text-slate-200">
            Risk anketiyle profilinizi gorup portfoy dagilimi simulasyonunu inceleyin.
          </p>
          <Link
            href="/robo-advisor"
            className="mt-3 inline-flex items-center rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          >
            Robo Danismanlik Anketini Dene
          </Link>
        </article>
      </section>

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

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-white">Akilli Uyarilar</h3>
          <p className="text-xs text-slate-400">
            RegTech ve tahminleme ciktisi egitim amacli kural tabanli simulasyondur.
          </p>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-200">Onemli 3 RegTech Uyarisi</h4>
            {priorityAlerts.length > 0 ? (
              priorityAlerts.map((alert) => (
                <RiskAlertCard
                  key={alert.id}
                  alert={alert}
                  transaction={alert.transactionId ? transactionById.get(alert.transactionId) : undefined}
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-slate-700 p-3 text-sm text-slate-400">
                Bu ay icin oncelikli RegTech uyarisi uretilmedi.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-200">Gelecek Ay Butce Riski Olan 3 Kategori</h4>
            {riskyForecasts.length > 0 ? (
              riskyForecasts.map((forecast) => <ForecastCard key={forecast.category} forecast={forecast} />)
            ) : (
              <p className="rounded-lg border border-dashed border-slate-700 p-3 text-sm text-slate-400">
                Gelecek ay icin butce asim riski gorunmuyor.
              </p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
