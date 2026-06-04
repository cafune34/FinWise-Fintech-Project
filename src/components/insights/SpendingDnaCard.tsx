"use client";

import { Activity, AlertTriangle, CheckCircle2, Fingerprint, Gauge, Lightbulb, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import type { SpendingDnaResult, SpendingDnaRiskLevel } from "@/lib/spendingDna";

type SpendingDnaCardProps = {
  result: SpendingDnaResult;
};

const riskLabels: Record<SpendingDnaRiskLevel, string> = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

const riskStyles: Record<SpendingDnaRiskLevel, { border: string; bg: string; text: string; icon: typeof CheckCircle2 }> =
  {
    dusuk: {
      border: "border-emerald-400/30",
      bg: "bg-emerald-400/10",
      text: "text-emerald-300",
      icon: CheckCircle2,
    },
    orta: {
      border: "border-amber-400/30",
      bg: "bg-amber-400/10",
      text: "text-amber-300",
      icon: AlertTriangle,
    },
    yuksek: {
      border: "border-rose-400/30",
      bg: "bg-rose-400/10",
      text: "text-rose-300",
      icon: Gauge,
    },
  };

export default function SpendingDnaCard({ result }: SpendingDnaCardProps) {
  const RiskIcon = riskStyles[result.riskLevel].icon;

  return (
    <section className="w-full space-y-5">
      <article className="rounded-xl border border-cyan-300/20 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-300">
              <Fingerprint className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Ana Profil</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">{result.primaryProfile.label}</h3>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-300">{result.summary}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                riskStyles[result.riskLevel].border,
                riskStyles[result.riskLevel].bg,
                riskStyles[result.riskLevel].text
              )}
            >
              <RiskIcon className="h-3.5 w-3.5" />
              Risk: {riskLabels[result.riskLevel]}
            </span>
            {result.secondaryProfile ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-300">
                <Activity className="h-3.5 w-3.5 text-cyan-300" />
                İkincil: {result.secondaryProfile.label}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-semibold text-white">{result.primaryProfile.score}</span>
              <span className="pb-1 text-sm text-slate-400">/100</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-slate-900">
              <div
                className="h-2 rounded-full bg-cyan-300 transition-all"
                style={{ width: `${result.primaryProfile.score}%` }}
              />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{result.primaryProfile.reason}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Profil Skorları</p>
            <div className="mt-4 space-y-3">
              {result.allProfiles.map((profile) => (
                <div key={profile.id}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-200">{profile.label}</span>
                    <span className="text-slate-400">{profile.score}/100</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-900">
                    <div className="h-1.5 rounded-full bg-cyan-300/80" style={{ width: `${profile.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-5 xl:grid-cols-3">
        <InfoList title="Kanıtlar" icon={ShieldCheck} items={result.evidence} tone="cyan" />
        <InfoList title="Güçlü Yönler" icon={CheckCircle2} items={result.strengths} tone="emerald" />
        <InfoList title="Geliştirilecek Alanlar" icon={AlertTriangle} items={result.weaknesses} tone="amber" />
      </div>

      <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-cyan-300" />
          <h3 className="text-base font-semibold text-white">Kısa Öneriler</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {result.recommendations.map((recommendation, index) => (
            <div key={recommendation} className="rounded-lg border border-cyan-300/10 bg-cyan-950/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">Öneri {index + 1}</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">{recommendation}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-xl border border-white/10 bg-[#0b1220]/80 p-5 shadow-xl shadow-black/10">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-cyan-300" />
          <h3 className="text-base font-semibold text-white">Finansal DNA Metrikleri</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric title="Toplam Gelir" value={formatCurrencyTRY(result.metrics.totalIncome)} tone="positive" />
          <Metric title="Toplam Gider" value={formatCurrencyTRY(result.metrics.totalExpense)} tone="negative" />
          <Metric
            title="Net Nakit Akışı"
            value={formatCurrencyTRY(result.metrics.netCashFlow)}
            tone={result.metrics.netCashFlow >= 0 ? "positive" : "negative"}
          />
          <Metric title="Tasarruf Oranı" value={formatPercent(result.metrics.savingsRate)} />
          <Metric title="Yatırım/Transfer Payı" value={formatPercent(result.metrics.investmentOutflowRatio)} />
          <Metric title="Zorunlu Gider Payı" value={formatPercent(result.metrics.essentialExpenseRatio)} />
          <Metric title="İsteğe Bağlı Pay" value={formatPercent(result.metrics.discretionaryExpenseRatio)} />
          <Metric title="Bütçe Kullanımı" value={formatPercent(result.metrics.budgetUsageAverage)} />
          <Metric title="Bekleyen Ödeme" value={formatCurrencyTRY(result.metrics.pendingPaymentAmount)} />
          <Metric title="Yüksek Tutar Sinyali" value={String(result.metrics.highValueTransactionCount)} />
          <Metric title="Aktif Bakiye" value={formatCurrencyTRY(result.metrics.totalActiveBalance)} />
          <Metric title="Baskın Kategori" value={result.metrics.dominantCategoryLabel} />
        </div>
      </article>
    </section>
  );
}

function InfoList({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: typeof ShieldCheck;
  items: string[];
  tone: "cyan" | "emerald" | "amber";
}) {
  const toneClass = {
    cyan: "text-cyan-300 border-cyan-300/15 bg-cyan-950/20",
    emerald: "text-emerald-300 border-emerald-300/15 bg-emerald-950/20",
    amber: "text-amber-300 border-amber-300/15 bg-amber-950/20",
  }[tone];

  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center gap-2">
        <Icon className={clsx("h-5 w-5", toneClass.split(" ")[0])} />
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className={clsx("rounded-lg border p-3", toneClass)}>
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function Metric({ title, value, tone = "neutral" }: { title: string; value: string; tone?: "neutral" | "positive" | "negative" }) {
  const toneClass = {
    neutral: "text-white",
    positive: "text-emerald-300",
    negative: "text-rose-300",
  }[tone];

  return (
    <div className="min-h-[92px] rounded-lg border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <p className={clsx("mt-2 break-words text-lg font-semibold", toneClass)}>{value}</p>
    </div>
  );
}
