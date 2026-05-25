import AppShell from "@/components/AppShell";
import { mockPaymentOrders } from "@/data/mockData";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";

export default function PaymentsPage() {
  return (
    <AppShell
      title="Odeme Simulasyonu"
      description="Gercek odeme altyapisi yerine, egitim amacli planli odeme simulasyon kayitlari gosterilir."
    >
      <div className="grid gap-3">
        {mockPaymentOrders.map((order) => (
          <article key={order.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-base font-semibold text-white">{order.payee}</h3>
            <p className="mt-1 text-sm text-slate-400">Vade: {formatDateTR(order.dueDate)}</p>
            <p className="mt-2 text-lg font-semibold text-cyan-300">{formatCurrencyTRY(order.amount)}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Durum: {order.status}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
