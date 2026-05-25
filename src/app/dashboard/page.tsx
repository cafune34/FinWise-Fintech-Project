"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Gauge, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";
import AppShell from "@/components/AppShell";
import ChartCard from "@/components/ChartCard";
import ForecastCard from "@/components/ForecastCard";
import RiskAlertCard from "@/components/RiskAlertCard";
import StatCard from "@/components/StatCard";
import TransactionTable from "@/components/TransactionTable";
import ExpenseByCategoryChart from "@/components/dashboard/ExpenseByCategoryChart";
import IncomeExpenseChart from "@/components/dashboard/IncomeExpenseChart";
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
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";
import { generateRegTechAlerts } from "@/lib/regtech";
import { useFinanceData } from "@/lib/useFinanceData";
import type { TransactionCategory } from "@/types/finance";

const monthLabels = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const quickActions = [
  {
    title: "Ödeme talimatı oluştur",
    href: "/payments",
    description: "Yeni talimat akışı",
    icon: CreditCard,
  },
  {
    title: "Riskleri incele",
    href: "/regtech",
    description: "Öncelikli uyarılar",
    icon: ShieldCheck,
  },
  {
    title: "Bütçe planına git",
    href: "/budget",
    description: "Limit ve tahminler",
    icon: Gauge,
  },
];

export default function DashboardPage() {
  const { accounts, transactions, budgetsWithSpending, user } = useFinanceData();
  const referenceDate = useMemo(() => new Date(), []);
  const totalBalance = calculateTotalBalance(accounts);
  const monthlyIncome = calculateMonthlyIncome(transactions, referenceDate);
  const monthlyExpense = calculateMonthlyExpense(transactions, referenceDate);
  const netCashFlow = calculateNetCashFlow(transactions, referenceDate);
  const forecastResults = useMemo(
    () => forecastAllCategories(transactions, budgetsWithSpending, { referenceDate }),
    [budgetsWithSpending, referenceDate, transactions]
  );
  const riskyForecasts = getRiskyForecastCategories(forecastResults, 3);
  const regtechAlerts = useMemo(
    () =>
      generateRegTechAlerts({
        transactions,
        budgets: budgetsWithSpending,
        userId: user.id,
        referenceDate,
      }),
    [budgetsWithSpending, referenceDate, transactions, user.id]
  );
  const priorityAlerts = regtechAlerts.slice(0, 3);
  const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));
  const recentTransactions = getRecentTransactions(transactions, 8);
  const healthScore = Math.max(62, Math.min(94, Math.round(78 + (netCashFlow > 0 ? 8 : -6) - riskyForecasts.length * 2)));

  const categoryTotals = getCategoryExpenseTotals(transactions, referenceDate);
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
      gelir: calculateMonthlyIncome(transactions, monthDate),
      gider: calculateMonthlyExpense(transactions, monthDate),
    };
  });

  return (
    <AppShell
      title="Genel Bakış"
      description="Hesap bakiyeleri, nakit akışı, risk uyarıları ve bütçe görünümü tek ekranda izlenir."
    >
      <section className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)] 2xl:grid-cols-[minmax(0,1.35fr)_minmax(520px,0.65fr)]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Finansal sağlık skoru</p>
              <h3 className="mt-2 text-4xl font-semibold text-white">{healthScore}/100</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300 xl:max-w-4xl">
                Nakit akışı, bütçe kullanımı ve öncelikli riskler birlikte değerlendirildiğinde aylık finans görünümü izlenebilir durumda.
              </p>
            </div>
            <div className="relative h-36 w-36 shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/10 p-3">
              <div className="grid h-full w-full place-items-center rounded-full bg-slate-950/80">
                <div className="text-center">
                  <BadgeCheck className="mx-auto h-6 w-6 text-cyan-300" />
                  <p className="mt-2 text-sm font-semibold text-cyan-200">Dengeli</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Nakit akışı</p>
              <p className={`mt-2 text-2xl font-semibold ${netCashFlow >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatCurrencyTRY(netCashFlow)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-cyan-300" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Gelir</p>
              <p className="mt-1 font-semibold text-emerald-300">{formatCurrencyTRY(monthlyIncome)}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <p className="text-slate-400">Gider</p>
              <p className="mt-1 font-semibold text-rose-300">{formatCurrencyTRY(monthlyExpense)}</p>
            </div>
          </div>
        </article>
      </section>

      <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Bakiye" value={formatCurrencyTRY(totalBalance)} description="Tüm bağlı hesapların toplam görünümü" />
        <StatCard title="Aylık Gelir" value={formatCurrencyTRY(monthlyIncome)} tone="positive" description="Bu ay hesaba geçen tutar" />
        <StatCard title="Aylık Gider" value={formatCurrencyTRY(monthlyExpense)} tone="negative" description="Bu ay çıkan toplam tutar" />
        <StatCard
          title="Net Nakit Akışı"
          value={formatCurrencyTRY(netCashFlow)}
          tone={netCashFlow >= 0 ? "positive" : "negative"}
          description="Gelir ve gider farkı"
        />
      </div>

      <section className="grid w-full gap-4 lg:grid-cols-3 2xl:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{action.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{action.description}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid w-full gap-4 lg:grid-cols-3">
        {accounts.map((account) => (
          <article key={account.id} className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{getAccountTypeLabel(account.type)}</p>
                <h3 className="mt-1 text-base font-semibold text-white">{account.bankName}</h3>
                <p className="mt-1 text-sm text-slate-400">{account.accountName}</p>
              </div>
              <WalletCards className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-4 text-2xl font-semibold text-cyan-200">{formatCurrencyTRY(account.balance)}</p>
            <p className="mt-1 text-sm text-slate-400">Para birimi: {account.currency}</p>
          </article>
        ))}
      </section>

      <section className="grid w-full gap-5 xl:grid-cols-2">
        <ChartCard title="Kategori Bazlı Harcama" description="Bu ay giderlerinin kategori kırılımı.">
          <ExpenseByCategoryChart data={categoryExpenseData} />
        </ChartCard>

        <ChartCard title="Aylık Gelir-Gider" description="Son 6 ay için gelir ve gider değişimi.">
          <IncomeExpenseChart data={monthlyTrendData} />
        </ChartCard>
      </section>

      <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Son İşlemler</h3>
            <p className="mt-1 text-sm text-slate-400">En güncel finans hareketleri</p>
          </div>
          <Link href="/transactions" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
            Tüm işlemler
          </Link>
        </div>
        <TransactionTable transactions={recentTransactions} accounts={accounts} />
      </section>

      <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">Akıllı Uyarılar</h3>
            <p className="mt-1 text-sm text-slate-400">Öncelikli riskler ve bütçe öngörüleri</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {priorityAlerts.length + riskyForecasts.length} aktif sinyal
          </span>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-200">Öncelikli Risk Uyarıları</h4>
            {priorityAlerts.length > 0 ? (
              priorityAlerts.map((alert) => (
                <RiskAlertCard
                  key={alert.id}
                  alert={alert}
                  transaction={alert.transactionId ? transactionById.get(alert.transactionId) : undefined}
                />
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
                Bu ay için öncelikli risk uyarısı bulunmuyor.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-200">Gelecek Ay Bütçe Riski</h4>
            {riskyForecasts.length > 0 ? (
              riskyForecasts.map((forecast) => <ForecastCard key={forecast.category} forecast={forecast} />)
            ) : (
              <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
                Gelecek ay için bütçe aşım riski görünmüyor.
              </p>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
