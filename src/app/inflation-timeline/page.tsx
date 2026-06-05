"use client";

import AppShell from "@/components/AppShell";
import InflationTimeline from "@/components/insights/InflationTimeline";
import { useFinanceData } from "@/lib/useFinanceData";
import { buildInflationTimeline } from "@/lib/inflationTimeline";
import { useState, useEffect } from "react";

export default function InflationTimelinePage() {
  const { accounts, transactions, budgetsWithSpending, paymentOrders, user, roboResults, updatedAt, version } = useFinanceData();
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

  const timelineData = buildInflationTimeline(snapshot);

  return (
    <AppShell
      title="Enflasyon Zaman Tüneli"
      description="TL'nin yıllara göre demo satın alma gücü değişimini analiz eder."
    >
      <div className="mx-auto max-w-7xl">
        <InflationTimeline data={timelineData} />
      </div>
    </AppShell>
  );
}
