"use client";

import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import SpendingDnaCard from "@/components/insights/SpendingDnaCard";
import { analyzeSpendingDna } from "@/lib/spendingDna";
import { useFinanceData } from "@/lib/useFinanceData";

export default function SpendingDnaPage() {
  const snapshot = useFinanceData();
  const result = useMemo(() => analyzeSpendingDna(snapshot), [snapshot]);

  return (
    <AppShell
      title="Harcama DNA’sı"
      description="Finansal davranışlarınıza göre kişilik profilinizi analiz eder."
    >
      <SpendingDnaCard result={result} />

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-5 text-amber-100/90">{result.disclaimer}</p>
        </div>
      </section>
    </AppShell>
  );
}
