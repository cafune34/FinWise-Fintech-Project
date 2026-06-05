"use client";

import React, { useState } from "react";
import AppShell from "@/components/AppShell";
import ScenarioForm from "@/components/scenario/ScenarioForm";
import ScenarioResult from "@/components/scenario/ScenarioResult";
import type { ScenarioInput, ScenarioSimulationResult } from "@/lib/scenarioSimulator";
import { simulateScenario } from "@/lib/scenarioSimulator";
import { useFinanceData } from "@/lib/useFinanceData";
import { WandSparkles, HelpCircle, ArrowRight } from "lucide-react";

export default function ScenarioSimulatorPage() {
  const { hydrated, ...snapshot } = useFinanceData();
  const [result, setResult] = useState<ScenarioSimulationResult | null>(null);

  const handleSimulate = (scenario: ScenarioInput) => {
    // Reconstruct the actual snapshot object safely (stripping client/context properties)
    const baseSnapshot = {
      version: snapshot.version,
      user: snapshot.user,
      accounts: snapshot.accounts,
      transactions: snapshot.transactions,
      budgets: snapshot.budgets,
      paymentOrders: snapshot.paymentOrders,
      roboResults: snapshot.roboResults,
      updatedAt: snapshot.updatedAt,
    };
    
    const simResult = simulateScenario(baseSnapshot, scenario);
    setResult(simResult);
  };

  return (
    <AppShell
      title="What-if Simulator"
      description="Gelecekteki harcama, yeni abonelik, kira artışı veya borç taksitlerini gerçek hesaplarınızı bozmadan simüle edin."
    >
      <div className="w-full">
        {/* Warning Banner */}
        <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-200 block mb-0.5">Simülasyon Modu Aktif</span>
            Burada yapılan hesaplamalar ve form girdileri <b>kesinlikle gerçek verilerinizi değiştirmez</b>, veri tabanına veya <code>localStorage</code> üzerine kaydedilmez. Tüm analizler anlık ve geçicidir.
          </div>
        </div>

        {!hydrated ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <p className="text-sm text-slate-400">Veriler yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
            {/* Form Column */}
            <div>
              <ScenarioForm onSimulate={handleSimulate} />
            </div>

            {/* Result Column */}
            <div className="h-full">
              {result ? (
                <ScenarioResult result={result} />
              ) : (
                <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-white/10 bg-[#080e1a]/40 p-12 min-h-[480px]">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-cyan-300/15 border border-cyan-300/20 text-cyan-300 mb-5">
                    <WandSparkles className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">
                    Finansal Motor Başlatılmaya Hazır
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6">
                    Sol taraftaki hazır örnek senaryolardan birine tıklayarak veya parametreleri kendiniz doldurup &ldquo;Simüle Et&rdquo; butonuna basarak etkileri hemen gözlemleyin.
                  </p>
                  <div className="flex flex-col gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 justify-center">
                      ✓ Skor Etkisi Analizi <ArrowRight className="h-3 w-3" /> 0-100 Simülasyon Skoru
                    </span>
                    <span className="flex items-center gap-1.5 justify-center">
                      ✓ Bütçe Aşım Simülasyonu <ArrowRight className="h-3 w-3" /> Kategori Limitleri
                    </span>
                    <span className="flex items-center gap-1.5 justify-center">
                      ✓ Acil Durum Fonu Koruma Oranı <ArrowRight className="h-3 w-3" /> 3 Aylık Tampon
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
