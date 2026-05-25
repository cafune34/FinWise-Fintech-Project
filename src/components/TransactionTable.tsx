import type { BankAccount, Transaction, TransactionCategory } from "@/types/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";

const categoryLabels: Record<TransactionCategory, string> = {
  market: "Market",
  ulasim: "Ulasim",
  fatura: "Fatura",
  egitim: "Egitim",
  eglence: "Eglence",
  saglik: "Saglik",
  kira: "Kira",
  maas: "Maas",
  transfer: "Transfer",
  yatirim: "Yatirim",
  diger: "Diger",
};

type TransactionTableProps = {
  transactions: Transaction[];
  accounts?: BankAccount[];
  emptyMessage?: string;
  maxRows?: number;
  highRiskTransactionIds?: string[];
};

export default function TransactionTable({
  transactions,
  accounts,
  emptyMessage = "Gosterilecek islem bulunamadi.",
  maxRows,
  highRiskTransactionIds = [],
}: TransactionTableProps) {
  const accountNameById = new Map(
    (accounts ?? []).map((account) => [account.id, `${account.bankName} (${account.type})`])
  );
  const highRiskSet = new Set(highRiskTransactionIds);

  const rows = maxRows ? transactions.slice(0, maxRows) : transactions;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-4 text-sm text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80 text-left text-slate-400">
          <tr>
            <th className="px-3 py-2 font-medium">Tarih</th>
            <th className="px-3 py-2 font-medium">Aciklama</th>
            <th className="px-3 py-2 font-medium">Kategori</th>
            <th className="px-3 py-2 font-medium">Hesap</th>
            <th className="px-3 py-2 font-medium">Tip</th>
            <th className="px-3 py-2 text-right font-medium">Tutar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900/50 text-slate-200">
          {rows.map((txn) => {
            const amountText = `${txn.direction === "in" ? "+" : "-"}${formatCurrencyTRY(txn.amount)}`;
            const amountClass = txn.direction === "in" ? "text-emerald-300" : "text-rose-300";
            const accountLabel = accountNameById.get(txn.accountId) ?? txn.accountId;

            return (
              <tr key={txn.id}>
                <td className="whitespace-nowrap px-3 py-2">{formatDateTR(txn.occurredAt)}</td>
                <td className="px-3 py-2 text-white">
                  <div className="flex items-center gap-2">
                    <span>{txn.title}</span>
                    {highRiskSet.has(txn.id) ? (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-200">
                        Riskli
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2">{categoryLabels[txn.category]}</td>
                <td className="whitespace-nowrap px-3 py-2 text-slate-300">{accountLabel}</td>
                <td className="whitespace-nowrap px-3 py-2">{txn.direction === "in" ? "Gelir" : "Gider"}</td>
                <td className={`whitespace-nowrap px-3 py-2 text-right font-medium ${amountClass}`}>{amountText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
