"use client";

import AppShell from "@/components/AppShell";
import PurchasingPowerPanel from "@/components/insights/PurchasingPowerPanel";

export default function PurchasingPowerPage() {
  return (
    <AppShell
      title="TL Satın Alma Gücü"
      description="Toplam varlığınızı TL, USD, EUR ve demo değer koruma bakışıyla analiz eder."
    >
      <PurchasingPowerPanel />

    </AppShell>
  );
}
