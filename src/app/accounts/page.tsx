import AppShell from "@/components/AppShell";
import { mockAccounts } from "@/data/mockData";
import { formatCurrencyTRY } from "@/lib/format";

export default function AccountsPage() {
  return (
    <AppShell title="Hesaplar" description="Mock banka hesaplarinin temel listesi. Gercek banka baglantisi bulunmamaktadir.">
      <div className="grid gap-3">
        {mockAccounts.map((account) => (
          <article key={account.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h3 className="text-base font-semibold text-white">{account.bankName}</h3>
            <p className="mt-1 text-sm text-slate-400">{account.iban}</p>
            <p className="mt-3 text-lg font-semibold text-cyan-300">{formatCurrencyTRY(account.balance)}</p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
