"use client";

import { useMemo } from "react";
import { Activity, Brain, ShieldCheck, TrendingUp } from "lucide-react";
import AppShell from "@/components/AppShell";
import BehavioralInsightCard from "@/components/behavioral/BehavioralInsightCard";
import StatCard from "@/components/StatCard";
import { analyzeBehavioralFinance, summarizeBehavioralInsights } from "@/lib/behavioralFinance";
import { useFinanceData } from "@/lib/useFinanceData";

export default function BehavioralFinancePage() {
  const snapshot = useFinanceData();
  const insights = useMemo(() => (snapshot.hydrated ? analyzeBehavioralFinance(snapshot) : []), [snapshot]);
  const summary = useMemo(() => summarizeBehavioralInsights(insights), [insights]);

  return (
    <AppShell
      title="Davranışsal Finans"
      description="Harcama alışkanlıklarınızı davranışsal finans kavramlarıyla analiz eder."
    >
      <section className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Toplam içgörü"
          value={String(summary.total)}
          description="Davranışsal finans kartı"
        />
        <StatCard
          title="Yüksek risk"
          value={String(summary.highRiskCount)}
          tone={summary.highRiskCount > 0 ? "negative" : "positive"}
          description="Öncelikli incelenecek sinyal"
        />
        <StatCard
          title="Orta risk"
          value={String(summary.mediumRiskCount)}
          tone={summary.mediumRiskCount > 0 ? "neutral" : "positive"}
          description="Yakın takip önerilen alan"
        />
        <article className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-5 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-cyan-300">Baskın davranış</p>
              <h3 className="mt-2 text-lg font-bold text-white">{summary.dominantBiasLabel}</h3>
            </div>
            <Brain className="h-5 w-5 text-cyan-300" />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">{summary.summary}</p>
        </article>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Davranışsal İçgörüler</h3>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              İşlem, bütçe, ödeme ve hesap verilerinden türetilen harcama önyargısı sinyalleri.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
              <Activity className="h-3.5 w-3.5" />
              Aktif analiz
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-300" />
              {summary.topBiases.join(" / ")}
            </span>
          </div>
        </div>

        {snapshot.hydrated ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((insight) => (
              <BehavioralInsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-400">
            Davranışsal finans analizi hazırlanıyor.
          </div>
        )}
      </section>

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-5 text-amber-100/90">
            Bu analiz finansal teşhis veya yatırım tavsiyesi değildir; eğitim amaçlı davranışsal finans yorumudur.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
