"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  Gauge,
  Landmark,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { clsx } from "clsx";
import {
  calculatePurchasingPower,
  formatCurrencyEUR,
  formatCurrencyTRY,
  formatCurrencyUSD,
  formatNumber,
  getFallbackPurchasingPower,
  type PurchasingPowerDataSource,
  type PurchasingPowerLevel,
  type PurchasingPowerResult,
} from "@/lib/purchasingPower";
import { useFinanceData } from "@/lib/useFinanceData";

const sourceClasses: Record<PurchasingPowerDataSource, string> = {
  live: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  fallback: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  demo: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  derived: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
};

const levelLabels: Record<PurchasingPowerLevel, string> = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

const levelClasses: Record<PurchasingPowerLevel, string> = {
  dusuk: "text-rose-300",
  orta: "text-amber-300",
  yuksek: "text-emerald-300",
};

export default function PurchasingPowerPanel() {
  const snapshot = useFinanceData();
  const [result, setResult] = useState<PurchasingPowerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!snapshot.hydrated) {
      return () => {
        isMounted = false;
      };
    }

    calculatePurchasingPower(snapshot)
      .then((data) => {
        if (isMounted) {
          setResult(data);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setResult(
            getFallbackPurchasingPower(
              snapshot,
              error instanceof Error ? error.message : "Satın alma gücü analizi hazırlanamadı"
            )
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [snapshot]);

  if (isLoading || !result) {
    return <PurchasingPowerSkeleton />;
  }

  const isFallback = result.source === "fallback";

  return (
    <section className="w-full space-y-5">
      <div className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">TL Satın Alma Gücü</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Portföyünüzün döviz ve piyasa değer koruma görünümü.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={clsx("rounded-full border px-2.5 py-1 font-semibold", sourceClasses[result.source])}>
              {result.sourceLabel}
            </span>
            {isFallback ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-semibold text-amber-200">
                <AlertTriangle className="h-3.5 w-3.5" />
                API yerine fallback
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Toplam TL Varlık"
            value={formatCurrencyTRY(result.totalTryAssets)}
            description="Aktif TRY hesap bakiyeleri"
            icon={WalletCards}
          />
          <MetricCard
            title="USD Karşılığı"
            value={formatCurrencyUSD(result.usdValue)}
            description={`Kur: ${formatCurrencyTRY(result.usdTryRate)}`}
            icon={TrendingUp}
          />
          <MetricCard
            title="EUR Karşılığı"
            value={formatCurrencyEUR(result.eurValue)}
            description={`Kur: ${formatCurrencyTRY(result.eurTryRate)}`}
            icon={Activity}
          />
          <MetricCard
            title="Gram Altın Karşılığı"
            value={typeof result.gramGoldValue === "number" ? `${formatNumber(result.gramGoldValue)} gr` : "Veri yok"}
            description={
              typeof result.gramGoldTryRate === "number"
                ? `Kur: ${formatCurrencyTRY(result.gramGoldTryRate)}`
                : "Gram altın hesaplanamadı"
            }
            icon={Landmark}
            badge={result.gramGoldIsDemo ? "Demo gösterge" : undefined}
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-xl border border-white/10 bg-[#0b1220]/80 p-5 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Değer Koruma Skoru</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-white">{result.protectionScore}</span>
                <span className="pb-1 text-sm text-slate-400">/100</span>
              </div>
              <p className={clsx("mt-2 text-sm font-semibold", levelClasses[result.protectionLevel])}>
                Koruma seviyesi: {levelLabels[result.protectionLevel]}
              </p>
            </div>
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/10">
              <Gauge className="h-8 w-8 text-cyan-300" />
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-slate-950/80">
            <div
              className="h-2 rounded-full bg-cyan-300 transition-all"
              style={{ width: `${result.protectionScore}%` }}
            />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <SmallMetric title="Nakit Akışı" value={formatCurrencyTRY(result.metrics.netCashFlow)} />
            <SmallMetric title="Varlık Tamponu" value={`${formatNumber(result.metrics.assetExpenseRatio)}x`} />
            <SmallMetric title="Zorunlu Gider Payı" value={`${formatNumber(result.metrics.mandatoryRatio * 100)}%`} />
          </div>

          <p className="mt-6 text-sm leading-6 text-slate-300">{result.protectionComment}</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-cyan-300" />
            <h3 className="text-base font-semibold text-white">Kur Bazlı Yorum ve Enflasyon Notu</h3>
          </div>

          <div className="mt-4 space-y-4">
            <InfoBlock title="Kur Bazlı Yorum" body={result.protectionComment} />
            <InfoBlock title="Enflasyon Notu" body={result.inflationNote} />
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Kısa Öneriler</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              {result.recommendations.map((recommendation) => (
                <li key={recommendation} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-5 text-amber-100/90 md:flex-row md:items-center md:justify-between">
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-300" />
          {result.disclaimer} Eğitim amaçlı finansal analiz prototipidir.
        </span>
        <span className="inline-flex items-center gap-1.5 text-amber-100/75">
          <Clock className="h-3.5 w-3.5" />
          Son güncelleme: {formatUpdatedAt(result.updatedAt)}
        </span>
      </div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  badge,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof WalletCards;
  badge?: string;
}) {
  return (
    <article className="min-h-[142px] rounded-lg border border-white/10 bg-slate-950/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-200">{title}</p>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-cyan-300" />
      </div>
      <p className="mt-5 break-words text-2xl font-semibold text-white">{value}</p>
      {badge ? (
        <span className="mt-3 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
          {badge}
        </span>
      ) : null}
    </article>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function SmallMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PurchasingPowerSkeleton() {
  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-lg bg-cyan-300/10" />
        <div className="space-y-2">
          <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-72 max-w-full animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["try", "usd", "eur", "gold"].map((item) => (
          <div key={item} className="h-[142px] animate-pulse rounded-lg border border-white/10 bg-slate-950/35" />
        ))}
      </div>
    </section>
  );
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
