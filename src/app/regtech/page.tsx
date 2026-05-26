"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import RiskAlertCard from "@/components/RiskAlertCard";
import StatCard from "@/components/StatCard";
import { generateRegTechAlerts, getAlertSeverityCounts } from "@/lib/regtech";
import { useFinanceData } from "@/lib/useFinanceData";
import { Award } from "lucide-react";

export default function RegtechPage() {
  const { transactions, budgetsWithSpending, user } = useFinanceData();
  const [showAll, setShowAll] = useState(false);
  const alerts = useMemo(
    () =>
      generateRegTechAlerts({
        transactions,
        budgets: budgetsWithSpending,
        userId: user.id,
      }),
    [budgetsWithSpending, transactions, user.id]
  );
  
  const counts = getAlertSeverityCounts(alerts);
  const priorityActionCount = useMemo(() => {
    return alerts.filter(alert => {
      const severity = alert.severity ?? (alert.level === "yuksek" ? "high" : alert.level === "orta" ? "medium" : "low");
      return severity === "high" || severity === "medium";
    }).length;
  }, [alerts]);

  const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));

  const displayedAlerts = useMemo(() => {
    if (showAll) return alerts;
    return alerts.slice(0, 9);
  }, [alerts, showAll]);

  return (
    <AppShell
      title="Risk İzleme"
      description="Harcama davranışı, bütçe kullanımı ve işlem yoğunluğu üzerinden öncelikli risk sinyallerini takip edin."
    >
      <section className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Toplam Uyarı" value={String(counts.total)} description="Aktif tüm uyarıların sayısı" />
        <StatCard title="Yüksek Risk" value={String(counts.high)} tone={counts.high > 0 ? "negative" : "neutral"} description="Hemen incelenmesi gerekenler" />
        <StatCard title="Orta Risk" value={String(counts.medium)} tone={counts.medium > 0 ? "neutral" : "positive"} description="Yakın takip gerektirenler" />
        <StatCard title="Düşük Risk" value={String(counts.low)} tone="positive" description="Bilgilendirme amaçlı uyarılar" />
        <article className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-5 shadow-xl shadow-black/10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Öncelikli Aksiyon</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{priorityActionCount}</h3>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Yüksek ve orta öncelikli çözülmesi gereken aksiyon sayısı.</p>
        </article>
      </section>

      <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">Risk Listesi</h3>
            <p className="mt-1 text-sm text-slate-400">Aktif finansal riskler önem seviyesi ve çözüm aksiyonlarıyla gösterilir.</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Aktif İzleme
          </span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedAlerts.map((alert) => (
                <RiskAlertCard
                  key={alert.id}
                  alert={alert}
                  transaction={alert.transactionId ? transactionById.get(alert.transactionId) : undefined}
                />
              ))}
            </div>
            {alerts.length > 9 && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60 px-5 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
                >
                  {showAll ? "Daha az göster" : `Tüm riskleri göster (${alerts.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-white/10">
            <Award className="h-10 w-10 text-emerald-300 mb-2" />
            <p className="text-sm font-semibold text-white">Güvenli Görünüm</p>
            <p className="mt-1 text-xs text-slate-400">Bu dönem için herhangi bir risk uyarısı bulunmuyor.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
