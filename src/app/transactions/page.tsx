import AppShell from "@/components/AppShell";
import { mockTransactions } from "@/data/mockData";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";

export default function TransactionsPage() {
  const preview = mockTransactions.slice(0, 12);

  return (
    <AppShell
      title="Islemler"
      description="Islem hareketleri simulasyon verisinden beslenir. Sprint 1 kapsaminda sadece temel listeleme sunulur."
    >
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <p className="mb-3 text-sm text-slate-400">Toplam {mockTransactions.length} mock islem kaydi bulunuyor.</p>
        <ul className="space-y-2">
          {preview.map((txn) => (
            <li key={txn.id} className="flex items-center justify-between rounded-lg bg-slate-800/70 px-3 py-2 text-sm">
              <div>
                <p className="text-white">{txn.title}</p>
                <p className="text-slate-400">{formatDateTR(txn.occurredAt)} - {txn.category}</p>
              </div>
              <p className={txn.direction === "in" ? "font-medium text-emerald-300" : "font-medium text-rose-300"}>
                {txn.direction === "in" ? "+" : "-"}{formatCurrencyTRY(txn.amount)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
