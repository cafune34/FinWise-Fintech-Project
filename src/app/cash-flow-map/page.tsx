"use client";

import AppShell from "@/components/AppShell";
import CashFlowSankey from "@/components/visualizations/CashFlowSankey";
import { buildCashFlowSankey } from "@/lib/cashFlowSankey";
import { useFinanceData } from "@/lib/useFinanceData";
import { useMemo } from "react";

export default function CashFlowMapPage() {
  const snapshot = useFinanceData();

  const cashFlowData = useMemo(() => {
    return buildCashFlowSankey(snapshot);
  }, [snapshot]);

  return (
    <AppShell
      title="Para Akış Haritası"
      description="Gelirinizin gider, yatırım ve kalan nakit alanlarına nasıl dağıldığını gösterir."
    >
      {!snapshot.hydrated ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <div className="animate-fade-in-slide mx-auto max-w-7xl">
          <CashFlowSankey data={cashFlowData} />
          
          <div className="mt-8 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-200/80 text-center">
              Bu görselleştirme gerçek verilerinizi değiştirmez; eğitim amaçlı finansal analizdir.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
