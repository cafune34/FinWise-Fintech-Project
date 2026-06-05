"use client";

import AppShell from "@/components/AppShell";
import CarbonFootprintPanel from "@/components/insights/CarbonFootprintPanel";
import { useFinanceData } from "@/lib/useFinanceData";
import { analyzeCarbonFootprint } from "@/lib/carbonFootprint";
import { useState, useEffect } from "react";

export default function ESGCarbonPage() {
  const {
    accounts,
    transactions,
    budgetsWithSpending,
    paymentOrders,
    user,
    roboResults,
    updatedAt,
    version,
  } = useFinanceData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  // Build snapshot object to pass to the logic layer
  const snapshot = {
    version,
    accounts,
    transactions,
    budgets: budgetsWithSpending,
    paymentOrders,
    user,
    roboResults,
    updatedAt,
  };

  const carbonResult = analyzeCarbonFootprint(snapshot);

  return (
    <AppShell
      title="ESG Karbon Analizi"
      description="Harcamalarınızın demo ESG karbon etkisini kategori bazında analiz eder."
    >
      <div className="mx-auto max-w-7xl">
        <CarbonFootprintPanel result={carbonResult} />
      </div>
    </AppShell>
  );
}
