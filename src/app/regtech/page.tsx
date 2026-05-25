import AppShell from "@/components/AppShell";
import { mockRegTechAlerts } from "@/data/mockData";

export default function RegtechPage() {
  return (
    <AppShell
      title="RegTech"
      description="Regulasyon ve uyum odakli uyari modulu iskeleti. Bu sprintte yalnizca mock alarm gorunumu bulunur."
    >
      <div className="grid gap-3">
        {mockRegTechAlerts.map((alert) => (
          <article key={alert.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-base font-semibold text-white">Uyari Seviyesi: {alert.level}</h3>
            <p className="mt-2 text-sm text-slate-300">{alert.reason}</p>
            <p className="mt-2 text-xs text-slate-400">Islem ID: {alert.transactionId}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
