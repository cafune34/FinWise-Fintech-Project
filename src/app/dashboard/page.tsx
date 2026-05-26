"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BadgeCheck, CreditCard, Gauge, ShieldCheck, TrendingUp, WalletCards, Sparkles } from "lucide-react";
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
  const { accounts, transactions, budgetsWithSpending, user, paymentOrders, lastRoboResult } = useFinanceData();
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
  const pendingPaymentsCount = useMemo(() => {
    return (paymentOrders || []).filter((order) => order.status === "beklemede").length;
  }, [paymentOrders]);

  const highRiskAlertsCount = useMemo(() => {
    return regtechAlerts.filter((alert) => {
      const severity = alert.severity ?? (alert.level === "yuksek" ? "high" : alert.level === "orta" ? "medium" : "low");
      return severity === "high";
    }).length;
  }, [regtechAlerts]);

  const exceededBudgetsCount = useMemo(() => {
    return budgetsWithSpending.filter((b) => b.spent > b.limit).length;
  }, [budgetsWithSpending]);

  const nakitAkisiPuan = netCashFlow > 0 ? 30 : 10;
  const bütcePuan = exceededBudgetsCount === 0 ? 25 : exceededBudgetsCount === 1 ? 18 : exceededBudgetsCount === 2 ? 12 : 5;
  const regtechRiskScore = Math.max(0, 15 - (highRiskAlertsCount * 5));
  const profileRiskScore = lastRoboResult?.profile === "dusuk" ? 5 : lastRoboResult?.profile === "orta" ? 3 : lastRoboResult?.profile === "yuksek" ? 0 : 5;
  const riskPuan = regtechRiskScore + profileRiskScore;
  const odemePuan = pendingPaymentsCount === 0 ? 15 : pendingPaymentsCount <= 2 ? 10 : 5;
  const yatirimPuan = lastRoboResult ? 10 : 5;

  const healthScore = nakitAkisiPuan + bütcePuan + riskPuan + odemePuan + yatirimPuan;

  const suggestions = useMemo(() => {
    const list: string[] = [];
    if (netCashFlow < 0) {
      list.push("Net nakit akışını pozitife geçirmek için harcamalarınızı optimize edin.");
    }
    if (exceededBudgetsCount > 0) {
      list.push("Bütçe aşımlarını durdurmak için aktif limitlerinizi ve harcama hızınızı kontrol edin.");
    }
    if (highRiskAlertsCount > 0) {
      list.push("Yüksek öncelikli risk uyarılarını Risk İzleme panelinden inceleyin.");
    }
    if (pendingPaymentsCount > 0) {
      list.push("Bekleyen ödeme talimatlarını onaylayarak ödeme düzeni puanınızı artırın.");
    }
    if (!lastRoboResult) {
      list.push("Yatırım Profili anketini çözerek portföy dağılımınızı belirleyin (+5 puan).");
    }
    return list.slice(0, 3);
  }, [netCashFlow, exceededBudgetsCount, highRiskAlertsCount, pendingPaymentsCount, lastRoboResult]);

  const actionItems = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      desc: string;
      priority: "Yüksek" | "Orta" | "Düşük";
      module: "Bütçe" | "Risk" | "Ödeme" | "Yatırım" | "Nakit Akışı";
      href: string;
    }> = [];

    if (netCashFlow < 0) {
      list.push({
        id: "action-cashflow",
        title: "Nakit Akışı İyileştirme",
        desc: "Net nakit akışınız negatif seyrediyor. Sabit giderler ve kategori limitleri gözden geçirilmeli.",
        priority: "Yüksek",
        module: "Nakit Akışı",
        href: "/dashboard",
      });
    }

    if (exceededBudgetsCount > 0) {
      list.push({
        id: "action-budget",
        title: "Bütçe Disiplini Kontrolü",
        desc: "Kategori bütçe aşımı tespit edildi. Aşım yapan alanlar için harcama planı düzenlenmeli.",
        priority: "Yüksek",
        module: "Bütçe",
        href: "/budget",
      });
    }

    if (highRiskAlertsCount > 0) {
      list.push({
        id: "action-risk",
        title: "Yüksek Öncelikli Risk Kontrolü",
        desc: "Uyum motoru tarafından kritik risk tespit edildi. Riskli işlemleri acilen denetleyin.",
        priority: "Yüksek",
        module: "Risk",
        href: "/regtech",
      });
    }

    if (pendingPaymentsCount > 0) {
      list.push({
        id: "action-payment",
        title: "Ödeme Talimatları Onayı",
        desc: "Onay bekleyen ödeme talimatlarınız mevcut. İşlemleri tamamlamak için inceleyin.",
        priority: "Orta",
        module: "Ödeme",
        href: "/payments",
      });
    }

    if (lastRoboResult?.profile === "yuksek" || lastRoboResult?.profile === "orta") {
      list.push({
        id: "action-robo",
        title: "Yatırım Uyumu Değerlendirmesi",
        desc: "Yatırım profiliniz riskli grupta. Nakit ihtiyaçlarınız ve varlık dağılımınızı optimize edin.",
        priority: "Orta",
        module: "Yatırım",
        href: "/robo-advisor",
      });
    }

    return list;
  }, [netCashFlow, exceededBudgetsCount, highRiskAlertsCount, pendingPaymentsCount, lastRoboResult]);

  const lastProfileText = useMemo(() => {
    if (!lastRoboResult) return "Belirlenmedi";
    const profileLabel = lastRoboResult.profile === "yuksek" ? "Yüksek Risk" : lastRoboResult.profile === "orta" ? "Orta Risk" : "Düşük Risk";
    return `${profileLabel} (${lastRoboResult.score}/15)`;
  }, [lastRoboResult]);

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
      <section className="grid w-full items-start gap-5 lg:grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Finansal sağlık skoru</p>
                <h3 className="mt-2 text-4xl font-semibold text-white">{healthScore}/100</h3>
                <p className="mt-2 text-xs leading-5 text-slate-300 xl:max-w-4xl">
                  Nakit akışı, bütçe kullanımı ve öncelikli riskler birlikte değerlendirildiğinde aylık finans görünümü izlenebilir durumda.
                </p>
              </div>
              <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-full border border-cyan-300/30 bg-cyan-300/10 p-2">
                <div className="grid h-full w-full place-items-center rounded-full bg-slate-950/80">
                  <div className="text-center">
                    <BadgeCheck className="mx-auto h-5 w-5 text-cyan-300" />
                    <p className="mt-1 text-xs font-semibold text-cyan-200">
                      {healthScore >= 80 ? "Güçlü" : healthScore >= 60 ? "Dengeli" : "Zayıf"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skor Kırılımı */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">Skor Kırılımı</p>
              <div className="flex flex-wrap gap-2 text-[10px]">
                <div className="flex-1 min-w-[90px] rounded-lg bg-slate-900/60 p-2 border border-white/5">
                  <span className="text-slate-400 block mb-0.5">Nakit Akışı</span>
                  <span className="font-bold text-white">{nakitAkisiPuan}/30</span>
                </div>
                <div className="flex-1 min-w-[90px] rounded-lg bg-slate-900/60 p-2 border border-white/5">
                  <span className="text-slate-400 block mb-0.5">Bütçe Disiplini</span>
                  <span className="font-bold text-white">{bütcePuan}/25</span>
                </div>
                <div className="flex-1 min-w-[90px] rounded-lg bg-slate-900/60 p-2 border border-white/5">
                  <span className="text-slate-400 block mb-0.5">Risk Seviyesi</span>
                  <span className="font-bold text-white">{riskPuan}/20</span>
                </div>
                <div className="flex-1 min-w-[90px] rounded-lg bg-slate-900/60 p-2 border border-white/5">
                  <span className="text-slate-400 block mb-0.5">Ödeme Düzeni</span>
                  <span className="font-bold text-white">{odemePuan}/15</span>
                </div>
                <div className="flex-1 min-w-[90px] rounded-lg bg-slate-900/60 p-2 border border-white/5">
                  <span className="text-slate-400 block mb-0.5">Yatırım Uyumu</span>
                  <span className="font-bold text-white">{yatirimPuan}/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skoru artırmak için */}
          {suggestions.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Skoru Artırmak İçin Öneriler</p>
              <ul className="list-disc pl-4 text-[11px] text-cyan-200/90 space-y-1">
                {suggestions.map((s, idx) => (
                  <li key={idx} className="leading-relaxed">{s}</li>
                ))}
              </ul>
            </div>
          )}
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

        <article className="rounded-2xl border border-white/10 bg-[#0e1726]/80 p-6 shadow-2xl shadow-black/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Operasyon Özeti</p>
              <Gauge className="h-5 w-5 text-cyan-300" />
            </div>
            <p className="mt-2 text-xs text-slate-400">LocalStorage aktif sistem durumları özeti</p>
          </div>

          <div className="mt-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Bekleyen Ödeme Talimatı</span>
              <span className={`rounded-full border px-2 py-0.5 font-bold ${pendingPaymentsCount > 0 ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-slate-500/20 bg-slate-900 text-slate-400"}`}>
                {pendingPaymentsCount} Adet
              </span>
            </div>
            
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Yüksek Riskli Uyarı</span>
              <span className={`rounded-full border px-2 py-0.5 font-bold ${highRiskAlertsCount > 0 ? "border-rose-500/30 bg-rose-500/10 text-rose-300" : "border-slate-500/20 bg-slate-900 text-slate-400"}`}>
                {highRiskAlertsCount} Adet
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400">Son Yatırım Profili</span>
              <span className="font-semibold text-white truncate max-w-[155px]" title={lastProfileText}>
                {lastProfileText}
              </span>
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

      {/* Finansal Aksiyon Merkezi */}
      <section className="w-full rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-300" />
            Finansal Aksiyon Merkezi
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Aktif bütçe, nakit akışı, risk ve yatırım verilerinizden derlenen karar destek kararları
          </p>
        </div>

        {actionItems.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actionItems.map((action) => (
              <article
                key={action.id}
                className="relative flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/40 p-4 transition duration-200 hover:border-cyan-300/30"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                      {action.module}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        action.priority === "Yüksek"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {action.priority} Öncelik
                    </span>
                  </div>
                  <h4 className="font-semibold text-white text-sm">{action.title}</h4>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{action.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
                  <Link
                    href={action.href}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition"
                  >
                    İncele
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-white/10 p-5 text-center">
            <p className="text-sm text-slate-400">Finansal görünüm dengeli. Kritik aksiyon bulunmuyor.</p>
          </div>
        )}
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
