"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useFinanceData } from "@/lib/useFinanceData";
import { buildSpendingHeatmap } from "@/lib/spendingHeatmap";
import { SpendingHeatmap } from "@/components/visualizations/SpendingHeatmap";

export default function SpendingHeatmapPage() {
  const snapshot = useFinanceData();

  const heatmapResult = useMemo(() => {
    return buildSpendingHeatmap(snapshot, 90);
  }, [snapshot]);

  if (!snapshot.hydrated) {
    return (
      <AppShell
        title="Harcama Isı Haritası"
        description="Günlük harcama yoğunluğunuzu GitHub tarzı takvim görünümüyle analiz eder."
      >
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Harcama Isı Haritası"
      description="Günlük harcama yoğunluğunuzu GitHub tarzı takvim görünümüyle analiz eder."
    >
      <SpendingHeatmap result={heatmapResult} />
    </AppShell>
  );
}
