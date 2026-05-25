import { formatCurrencyTRY } from "@/lib/format";
import type { CategoryForecast } from "@/lib/forecasting";
import type { TransactionCategory } from "@/types/finance";

type ForecastCardProps = {
  forecast: CategoryForecast;
};

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

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const isRisky = forecast.riskStatus === "budget_risk";

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{categoryLabels[forecast.category]}</h3>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isRisky ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"
          }`}
        >
          {isRisky ? "Riskli" : "Normal"}
        </span>
      </div>

      <dl className="mt-3 grid gap-1 text-sm text-slate-300">
        <div className="flex items-center justify-between gap-2">
          <dt>Bu ay harcanan</dt>
          <dd className="text-slate-100">{formatCurrencyTRY(forecast.currentMonthExpense)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Gelecek ay tahmini</dt>
          <dd className="text-slate-100">{formatCurrencyTRY(forecast.nextMonthForecast)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Butce limiti</dt>
          <dd className="text-slate-100">
            {forecast.budgetLimit === null ? "Tanimsiz" : formatCurrencyTRY(forecast.budgetLimit)}
          </dd>
        </div>
      </dl>

      {isRisky ? (
        <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          Beklenen asim: {formatCurrencyTRY(forecast.expectedOverrun)}
        </p>
      ) : (
        <p className="mt-3 text-sm text-emerald-300">Butce limitine gore risk beklenmiyor.</p>
      )}
    </article>
  );
}