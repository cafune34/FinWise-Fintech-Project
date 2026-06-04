"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  LifeBuoy,
  Lightbulb,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { clsx } from "clsx";
import {
  formatCurrencyTRY,
  formatPercent,
  type EmergencyFundResult,
  type EmergencyFundStatus,
} from "@/lib/emergencyFund";

type EmergencyFundCardProps = {
  result: EmergencyFundResult;
};

const statusStyles: Record<EmergencyFundStatus, { label: string; className: string; icon: typeof AlertTriangle }> = {
  kritik: {
    label: "Kritik",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    icon: AlertTriangle,
  },
  gelistirilmeli: {
    label: "Geliştirilmeli",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    icon: Gauge,
  },
  iyi: {
    label: "İyi",
    className: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
    icon: ShieldCheck,
  },
  guclu: {
    label: "Güçlü",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    icon: CheckCircle2,
  },
};

export default function EmergencyFundCard({ result }: EmergencyFundCardProps) {
  const progressWidth = Math.min(result.completionPercentage, 100);
  const StatusIcon = statusStyles[result.status].icon;

  return (
    <section className="w-full space-y-5">
      <article className="rounded-xl border border-cyan-300/20 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                Güvenlik Fonu Durumu
              </p>
              <h3 className="mt-2 text-3xl font-semibold text-white">{result.statusLabel}</h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{result.summary}</p>
            </div>
          </div>

          <span
            className={clsx(
              "inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              statusStyles[result.status].className
            )}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusStyles[result.status].label}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Aylık Temel Gider" value={formatCurrencyTRY(result.monthlyEssentialExpense)} />
          <MetricCard title="3 Aylık Hedef" value={formatCurrencyTRY(result.targetAmount)} />
          <MetricCard title="Mevcut Varlık" value={formatCurrencyTRY(result.currentAvailableAssets)} />
          <MetricCard
            title={result.missingAmount > 0 ? "Eksik Tutar" : "Fazla Tutar"}
            value={formatCurrencyTRY(result.missingAmount > 0 ? result.missingAmount : result.surplusAmount)}
            tone={result.missingAmount > 0 ? "negative" : "positive"}
          />
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-xl border border-white/10 bg-[#0b1220]/80 p-5 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Tamamlanma</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-semibold text-white">{formatPercent(result.completionPercentage)}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{result.targetMonths} aylık hedefe göre ilerleme</p>
            </div>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10">
              <ShieldCheck className="h-8 w-8 text-cyan-300" />
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-slate-950/80">
            <div className="h-2 rounded-full bg-cyan-300 transition-all" style={{ width: `${progressWidth}%` }} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <SmallMetric title="Nakit Akışı Notu" value={formatCurrencyTRY(result.metrics.netCashFlow)} />
            <SmallMetric title="Bekleyen Ödeme Etkisi" value={formatCurrencyTRY(result.metrics.pendingPaymentAmount)} />
            <SmallMetric title="Temel Gider Payı" value={formatPercent(result.metrics.essentialExpenseRatio)} />
            <SmallMetric title="Aktif Hesap Bakiyesi" value={formatCurrencyTRY(result.metrics.activeAccountBalance)} />
          </div>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-cyan-300" />
            <h3 className="text-base font-semibold text-white">Kategori Kırılımı</h3>
          </div>

          <div className="mt-4 space-y-3">
            {result.categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-200">{item.label}</span>
                  <span className="text-slate-400">{formatCurrencyTRY(item.amount)}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-slate-900">
                  <div
                    className="h-1.5 rounded-full bg-cyan-300/80"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">{formatPercent(item.percentage)}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyan-300" />
          <h3 className="text-base font-semibold text-white">Kısa Öneriler</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {result.recommendations.slice(0, 3).map((recommendation, index) => (
            <div key={recommendation} className="rounded-lg border border-cyan-300/10 bg-cyan-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Öneri {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{recommendation}</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function MetricCard({
  title,
  value,
  tone = "neutral",
}: {
  title: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}) {
  const toneClass = {
    neutral: "text-white",
    positive: "text-emerald-300",
    negative: "text-rose-300",
  }[tone];

  return (
    <div className="min-h-[118px] rounded-lg border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">{title}</p>
      <p className={clsx("mt-4 break-words text-2xl font-semibold", toneClass)}>{value}</p>
    </div>
  );
}

function SmallMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
