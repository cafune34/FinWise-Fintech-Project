"use client";

import { useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import EmergencyFundCard from "@/components/insights/EmergencyFundCard";
import { analyzeEmergencyFund } from "@/lib/emergencyFund";
import { useFinanceData } from "@/lib/useFinanceData";

export default function EmergencyFundPage() {
  const snapshot = useFinanceData();
  const result = useMemo(() => analyzeEmergencyFund(snapshot), [snapshot]);

  return (
    <AppShell
      title="Acil Durum Fonu"
      description="Temel giderlerinize göre 3 aylık güvenlik fonu hedefinizi analiz eder."
    >
      <EmergencyFundCard result={result} />

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-5 text-amber-100/90">{result.disclaimer}</p>
        </div>
      </section>
    </AppShell>
  );
}
