"use client";

import { ShieldCheck } from "lucide-react";
import AppShell from "@/components/AppShell";
import PurchasingPowerPanel from "@/components/insights/PurchasingPowerPanel";

export default function PurchasingPowerPage() {
  return (
    <AppShell
      title="TL Satın Alma Gücü"
      description="Toplam varlığınızı TL, USD, EUR ve demo değer koruma bakışıyla analiz eder."
    >
      <PurchasingPowerPanel />

      <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p className="text-xs leading-5 text-amber-100/90">
            Bu panel yatırım tavsiyesi değildir; eğitim amaçlı finansal analiz prototipidir.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
