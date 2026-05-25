import AppShell from "@/components/AppShell";
import BudgetProgress from "@/components/BudgetProgress";
import ForecastCard from "@/components/ForecastCard";
import StatCard from "@/components/StatCard";
import { mockBudgets, mockTransactions } from "@/data/mockData";
import { forecastAllCategories, getRiskyForecastCategories } from "@/lib/forecasting";
import { isBudgetExceeded } from "@/lib/finance";

export default function BudgetPage() {
  const exceededBudgets = mockBudgets.filter((budget) => isBudgetExceeded(budget));
  const forecasts = forecastAllCategories(mockTransactions, mockBudgets);
  const riskyForecasts = getRiskyForecastCategories(forecasts);

  return (
    <AppShell
      title="Bütçe Planı"
      description="Kategori limitlerini, kullanım oranlarını ve gelecek ay bütçe sinyallerini izleyin."
    >
      <div className="grid w-full gap-4 md:grid-cols-3">
        <StatCard title="Aktif kategori" value={String(mockBudgets.length)} description="Takip edilen bütçe alanı" />
        <StatCard
          title="Limit aşımı"
          value={String(exceededBudgets.length)}
          tone={exceededBudgets.length > 0 ? "negative" : "positive"}
          description="Yakın takip gerektiren kategori"
        />
        <StatCard title="Risk sinyali" value={String(riskyForecasts.length)} description="Gelecek ay için öne çıkan alan" />
      </div>

      <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Gelecek Ay Riskli Kategoriler</h3>
            <p className="mt-1 text-sm text-slate-400">Kullanım geçmişi ve kategori eğilimine göre öne çıkan bütçe alanları.</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {riskyForecasts.length} kategori
          </span>
        </div>

        {riskyForecasts.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {riskyForecasts.map((forecast) => (
              <ForecastCard key={forecast.category} forecast={forecast} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
            Gelecek ay için bütçe aşımı beklenen kategori bulunmuyor.
          </p>
        )}
      </section>

      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {mockBudgets.map((budget) => (
          <BudgetProgress key={budget.id} budget={budget} />
        ))}
      </div>
    </AppShell>
  );
}
