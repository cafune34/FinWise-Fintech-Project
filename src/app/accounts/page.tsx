import { CreditCard, WalletCards } from "lucide-react";
import AppShell from "@/components/AppShell";
import { mockAccounts, mockTransactions } from "@/data/mockData";
import { filterTransactionsByAccount, getRecentTransactions } from "@/lib/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { getAccountTypeLabel } from "@/lib/labels";

function maskIban(iban: string): string {
  const prefix = iban.slice(0, 4);
  const suffix = iban.slice(-4);

  return `${prefix} **** **** **** **** ${suffix}`;
}

export default function AccountsPage() {
  return (
    <AppShell
      title="Hesaplar"
      description="Banka hesapları, bakiye dağılımı ve son hareketler kurumsal bir görünümle izlenir."
    >
      <div className="grid w-full gap-5 lg:grid-cols-3">
        {mockAccounts.map((account) => {
          const recentForAccount = getRecentTransactions(
            filterTransactionsByAccount(mockTransactions, account.id),
            4
          );

          return (
            <article key={account.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">{getAccountTypeLabel(account.type)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{account.bankName}</h3>
                </div>
                <WalletCards className="h-6 w-6 text-cyan-300" />
              </div>

              <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm text-slate-400">Kullanılabilir bakiye</p>
                <p className="mt-2 text-2xl font-semibold text-cyan-200">{formatCurrencyTRY(account.balance)}</p>
                <p className="mt-3 text-sm text-slate-400">IBAN: {maskIban(account.iban)}</p>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <p className="text-sm font-medium text-slate-200">Son İşlemler</p>
                </div>
                <ul className="space-y-2">
                  {recentForAccount.map((txn) => (
                    <li key={txn.id} className="rounded-lg border border-white/10 bg-slate-950/45 px-3 py-2 text-sm">
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
