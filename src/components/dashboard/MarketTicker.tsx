"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, Clock, Info, TrendingUp } from "lucide-react";
import {
  fetchMarketTickerData,
  formatMarketUpdatedAt,
  type MarketDataSource,
  type MarketTickerItem,
  type MarketTickerResult,
} from "@/lib/marketData";

const sourceLabels: Record<MarketDataSource, string> = {
  live: "Canlı veri",
  fallback: "Fallback veri",
  demo: "Demo veri",
  derived: "Yaklaşık canlı",
};

const sourceClasses: Record<MarketDataSource, string> = {
  live: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  fallback: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  demo: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
  derived: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
};

export default function MarketTicker() {
  const [tickerData, setTickerData] = useState<MarketTickerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchMarketTickerData()
      .then((data) => {
        if (isMounted) {
          setTickerData(data);
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
  }, []);

  if (isLoading || !tickerData) {
    return <MarketTickerSkeleton />;
  }

  const isFallback = tickerData.source === "fallback";

  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-300">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Piyasa Göstergeleri</h3>
              <p className="mt-0.5 text-xs text-slate-400">Döviz ve demo piyasa göstergeleri</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2.5 py-1 font-semibold ${sourceClasses[tickerData.source]}`}>
            {tickerData.sourceLabel}
          </span>
          {isFallback ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 font-semibold text-amber-200">
              <AlertTriangle className="h-3.5 w-3.5" />
              API yerine fallback
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="grid min-w-[760px] grid-cols-5 gap-3 lg:min-w-0">
          {tickerData.items.map((item) => (
            <TickerCard key={item.symbol} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-cyan-300" />
            Son güncelleme: {formatMarketUpdatedAt(tickerData.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-cyan-300" />
            {isFallback ? "BIST100 ve Gram Altın demo göstergedir." : "BIST100 ve Gram Altın verileri gün içi gecikmeli olabilir."}
          </span>
        </div>
        <p className="text-slate-500">Piyasa göstergeleri bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.</p>
      </div>
    </section>
  );
}

function TickerCard({ item }: { item: MarketTickerItem }) {
  const badgeSource = item.isDemo ? "demo" : item.source;
  const changeTone =
    typeof item.changePercent !== "number"
      ? "text-slate-400"
      : item.changePercent >= 0
        ? "text-emerald-300"
        : "text-rose-300";

  const isGold = item.symbol === "XAU/TRY";
  const displaySymbol = isGold ? "Gram Altın" : item.symbol;

  let badgeLabel = sourceLabels[item.source];
  if (item.isDemo) badgeLabel = "Demo gösterge";
  if (isGold) {
    if (item.source === "fallback" || typeof item.changePercent !== "number") {
      badgeLabel = "Canlı veri alınamadı";
    } else {
      badgeLabel = "Yaklaşık gram altın";
    }
  }

  return (
    <article className="min-h-[118px] rounded-lg border border-white/10 bg-slate-950/35 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`truncate text-xs font-semibold tracking-[0.12em] text-cyan-200 ${!isGold ? "uppercase" : ""}`}>
            {displaySymbol}
          </p>
          <p className="mt-1 truncate text-xs text-slate-400">{item.label}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sourceClasses[badgeSource]}`}>
          {badgeLabel}
        </span>
      </div>

      <p className="mt-4 text-xl font-semibold text-white">{item.formattedValue}</p>
      {typeof item.changePercent === "number" ? (
        <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${changeTone}`}>
          <Activity className="h-3.5 w-3.5" />
          {item.changePercent >= 0 ? "+" : ""}
          {item.changePercent.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}%
        </p>
      ) : null}
    </article>
  );
}

function MarketTickerSkeleton() {
  return (
    <section className="w-full rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-cyan-300/10" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-56 animate-pulse rounded bg-white/5" />
        </div>
      </div>
      <div className="mt-4 grid min-w-[760px] grid-cols-5 gap-3 overflow-hidden lg:min-w-0">
        {["usd", "eur", "gbp", "bist", "gold"].map((item) => (
          <div key={item} className="h-[118px] animate-pulse rounded-lg border border-white/10 bg-slate-950/35" />
        ))}
      </div>
    </section>
  );
}
