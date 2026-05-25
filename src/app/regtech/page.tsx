import AppShell from "@/components/AppShell";
import RiskAlertCard from "@/components/RiskAlertCard";
import StatCard from "@/components/StatCard";
import { mockBudgets, mockTransactions, mockUser } from "@/data/mockData";
import { generateRegTechAlerts, getAlertSeverityCounts } from "@/lib/regtech";

export default function RegtechPage() {
  const alerts = generateRegTechAlerts({
    transactions: mockTransactions,
    budgets: mockBudgets,
    userId: mockUser.id,
  });
  const counts = getAlertSeverityCounts(alerts);
  const transactionById = new Map(mockTransactions.map((transaction) => [transaction.id, transaction]));

  return (
    <AppShell
      title="RegTech"
      description="Kural tabanli uyari motoru ile supheli islem/risk senaryolari egitim amacli olarak simule edilir."
    >
      <article className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm text-amber-100">
        <p>
          {
            "Bu mod\u00fcl ger\u00e7ek AML/uyum sistemi de\u011fildir. RegTech yakla\u015f\u0131m\u0131n\u0131 g\u00f6stermek i\u00e7in e\u011fitim ama\u00e7l\u0131 kural tabanl\u0131 sim\u00fclasyon yap\u0131lm\u0131\u015ft\u0131r."
          }
        </p>
      </article>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Toplam Uyari" value={String(counts.total)} />
        <StatCard title="Yuksek" value={String(counts.high)} tone={counts.high > 0 ? "negative" : "neutral"} />
        <StatCard title="Orta" value={String(counts.medium)} tone={counts.medium > 0 ? "neutral" : "positive"} />
        <StatCard title="Dusuk" value={String(counts.low)} tone="positive" />
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-white">Uyari Listesi</h3>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <RiskAlertCard
                key={alert.id}
                alert={alert}
                transaction={alert.transactionId ? transactionById.get(alert.transactionId) : undefined}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-700 p-3 text-sm text-slate-400">
            Bu donem icin RegTech uyarisi uretilmedi.
          </p>
        )}
      </section>
    </AppShell>
  );
}
