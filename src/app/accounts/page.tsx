import AppShell from "@/components/AppShell";
import { mockAccounts, mockTransactions } from "@/data/mockData";
import { filterTransactionsByAccount, getRecentTransactions } from "@/lib/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";

function maskIban(iban: string): string {
  const prefix = iban.slice(0, 4);
  const suffix = iban.slice(-4);

  return `${prefix} **** **** **** **** ${suffix}`;
}

export default function AccountsPage() {
  return (
    <AppShell
      title="Hesaplar"
      description="3 mock banka hesabi detayli gorunumde listelenir. Gercek banka API baglantisi bulunmamaktadir."
    >
      <p className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
        Not: Bu sayfada gosterilen tum hesaplar ve hareketler egitim amacli simulasyon verisidir.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        {mockAccounts.map((account) => {
          const recentForAccount = getRecentTransactions(
            filterTransactionsByAccount(mockTransactions, account.id),
            4
          );

          return (
            <article key={account.id} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{account.bankName}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{account.type === "vadesiz" ? "Vadesiz Hesap" : "Birikim Hesabi"}</h3>

              <div className="mt-3 space-y-1 text-sm text-slate-300">
                <p>IBAN: {maskIban(account.iban)}</p>
                <p>Bakiye: <span className="font-medium text-cyan-300">{formatCurrencyTRY(account.balance)}</span></p>
                <p>Para Birimi: {account.currency}</p>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-200">Son Islemler</p>
                <ul className="space-y-2">
                  {recentForAccount.map((txn) => (
                    <li key={txn.id} className="rounded-lg bg-slate-800/70 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-slate-200">{txn.title}</span>
                        <span className={txn.direction === "in" ? "font-medium text-emerald-300" : "font-medium text-rose-300"}>
                          {txn.direction === "in" ? "+" : "-"}{formatCurrencyTRY(txn.amount)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTR(txn.occurredAt)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
