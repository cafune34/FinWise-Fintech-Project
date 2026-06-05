"use client";

import { useMemo } from "react";
import { Brain, FileText, Fingerprint, LifeBuoy, ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import StatCard from "@/components/StatCard";
import ReportDownloadButton from "@/components/report/ReportDownloadButton";
import { buildFinancialReportData, formatCurrencyTRY, formatPercent } from "@/lib/reportGenerator";
import { useFinanceData } from "@/lib/useFinanceData";
import { riskProfileLabels } from "@/lib/labels";

export default function FinancialReportPage() {
  const snapshot = useFinanceData();
  const reportData = useMemo(() => buildFinancialReportData(snapshot), [snapshot]);
  const netCashFlowTone = reportData.finance.netCashFlow >= 0 ? "positive" : "negative";

  return (
    <AppShell
      title="FinWise Report"
      description="Finansal snapshot verilerinizi tek tıkla PDF analiz raporuna dönüştürür."
    >
      <section className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Toplam varlık"
          value={formatCurrencyTRY(reportData.finance.totalTryAssets)}
          description={`${reportData.user.accountCount} aktif hesap`}
        />
        <StatCard
          title="Net nakit akışı"
          value={formatCurrencyTRY(reportData.finance.netCashFlow)}
          tone={netCashFlowTone}
          description="Referans ay görünümü"
        />
        <StatCard
          title="Harcama DNA profili"
          value={reportData.spendingDna.primaryProfile.label}
          description={riskProfileLabels[reportData.spendingDna.riskLevel]}
        />
        <StatCard
          title="Acil durum fonu"
          value={reportData.emergencyFund.statusLabel}
          tone={reportData.emergencyFund.completionPercentage >= 67 ? "positive" : "neutral"}
          description={formatPercent(reportData.emergencyFund.completionPercentage)}
        />
        <StatCard
          title="Davranışsal içgörü"
          value={String(reportData.behavioralInsights.length)}
          tone={reportData.behavioralInsights.some((insight) => insight.riskLevel === "yuksek") ? "negative" : "neutral"}
          description="PDF rapor kapsamı"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <FileText className="h-5 w-5" />
                <p className="text-xs uppercase tracking-[0.16em]">Akademik fintech raporu</p>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">Tek tık finansal analiz çıktısı</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Gelir-gider, portföy, riskli işlemler, davranışsal finans, Harcama DNA&apos;sı, satın alma gücü ve acil
                durum fonu özetleri aynı PDF içinde birleştirilir.
              </p>
            </div>
            <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-medium text-cyan-100">
              Dosya adı: finwise-finansal-analiz-raporu-{reportData.fileDate}.pdf
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
              <Brain className="h-4 w-4 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-white">Davranışsal Finans</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {reportData.behavioralInsights.length} içgörü ve öneri.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
              <Fingerprint className="h-4 w-4 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-white">Harcama DNA&apos;sı</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {reportData.spendingDna.primaryProfile.label} profili.
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
              <LifeBuoy className="h-4 w-4 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-white">Acil Durum Fonu</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{reportData.emergencyFund.statusLabel} durum etiketi.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              <p className="mt-3 text-sm font-semibold text-white">Uyarı ve sonuç</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Yatırım tavsiyesi değildir notu.</p>
            </div>
          </div>
        </article>

        <aside className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-5 shadow-xl shadow-cyan-950/10">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Ana çıktı</p>
          <h3 className="mt-2 text-lg font-semibold text-white">PDF Raporu İndir</h3>
          <p className="mt-2 text-sm leading-6 text-cyan-50/80">
            Rapor, tarayıcı içinde oluşturulur ve API anahtarı gerektiren bir AI çağrısı yapmaz.
          </p>
          <ReportDownloadButton snapshot={snapshot} className="mt-5" />
        </aside>
      </section>

    </AppShell>
  );
}
