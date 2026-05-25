"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import RiskAlertCard from "@/components/RiskAlertCard";
import StatCard from "@/components/StatCard";
import { generateRegTechAlerts, getAlertSeverityCounts } from "@/lib/regtech";
import { useFinanceData } from "@/lib/useFinanceData";

export default function RegtechPage() {
  const { transactions, budgetsWithSpending, user } = useFinanceData();
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
  const transactionById = new Map(transactions.map((transaction) => [transaction.id, transaction]));

  return (
    <AppShell
      title="Risk İzleme"
      description="Harcama davranışı, bütçe kullanımı ve işlem yoğunluğu üzerinden öncelikli risk sinyallerini takip edin."
    >
      <section className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Uyarı" value={String(counts.total)} />
        <StatCard title="Yüksek" value={String(counts.high)} tone={counts.high > 0 ? "negative" : "neutral"} />
        <StatCard title="Orta" value={String(counts.medium)} tone={counts.medium > 0 ? "neutral" : "positive"} />
        <StatCard title="Düşük" value={String(counts.low)} tone="positive" />
      </section>

      <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">Uyarı Listesi</h3>
            <p className="mt-1 text-sm text-slate-400">Öncelik seviyesi ve ilgili işlem bilgisiyle listelenir.</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            Risk İzleme
          </span>
        </div>
        {alerts.length > 0 ? (
          <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
            {alerts.map((alert) => (
              <RiskAlertCard
                key={alert.id}
                alert={alert}
                transaction={alert.transactionId ? transactionById.get(alert.transactionId) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
            Bu dönem için risk uyarısı bulunmuyor.
          </p>
        )}
      </section>
    </AppShell>
  );
}
