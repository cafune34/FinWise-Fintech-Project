import AppShell from "@/components/AppShell";
import BudgetProgress from "@/components/BudgetProgress";
import ForecastCard from "@/components/ForecastCard";
import { mockBudgets, mockTransactions } from "@/data/mockData";
import { forecastAllCategories, getRiskyForecastCategories } from "@/lib/forecasting";
import { isBudgetExceeded } from "@/lib/finance";

export default function BudgetPage() {
  const exceededBudgets = mockBudgets.filter((budget) => isBudgetExceeded(budget));
  const forecasts = forecastAllCategories(mockTransactions, mockBudgets);
  const riskyForecasts = getRiskyForecastCategories(forecasts);

  return (
    <AppShell
      title="Butce"
      description="Kategori bazli butce takibi ve gelecek ay riskli kategoriler egitim amacli simulasyon verisiyle gosterilir."
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

      <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h3 className="text-base font-semibold text-white">Gelecek Ay Riskli Kategoriler</h3>
        <p className="text-sm text-slate-300">
          Tahmin modeli son 3 ay ortalamasi + kategori mevsimsel katsayisi ile calisir. Gercek ML modeli degildir.
        </p>

        {riskyForecasts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {riskyForecasts.map((forecast) => (
              <ForecastCard key={forecast.category} forecast={forecast} />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-slate-700 p-3 text-sm text-slate-400">
            Gelecek ay icin butce asimi beklenen kategori bulunmuyor.
          </p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {mockBudgets.map((budget) => (
          <BudgetProgress key={budget.id} budget={budget} />
        ))}
      </div>
    </AppShell>
  );
}
