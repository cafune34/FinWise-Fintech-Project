import { Trash2 } from "lucide-react";
import type { BankAccount, Transaction } from "@/types/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";

type TransactionTableProps = {
  transactions: Transaction[];
  accounts?: BankAccount[];
  emptyMessage?: string;
  maxRows?: number;
  highRiskTransactionIds?: string[];
  onDeleteTransaction?: (transactionId: string) => void;
};

function getTransactionTypeLabel(transaction: Transaction): string {
  if (transaction.type === "transfer") {
    return "Transfer";
  }

  return transaction.direction === "in" ? "Gelir" : "Gider";
}

export default function TransactionTable({
  transactions,
  accounts,
  emptyMessage = "Gösterilecek işlem bulunamadı.",
  maxRows,
  highRiskTransactionIds = [],
  onDeleteTransaction,
}: TransactionTableProps) {
  const accountNameById = new Map(
    (accounts ?? []).map((account) => [
      account.id,
      `${account.bankName}${account.accountName ? ` - ${account.accountName}` : ""} (${getAccountTypeLabel(account.type)})`,
    ])
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
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
      <table className="min-w-full divide-y divide-white/10 text-sm">
        <thead className="bg-white/[0.04] text-left text-slate-400">
          <tr className="whitespace-nowrap">
            <th className="px-4 py-3 font-medium">Tarih</th>
            <th className="px-4 py-3 font-medium min-w-[150px]">Açıklama</th>
            <th className="px-4 py-3 font-medium">Kategori</th>
            <th className="px-4 py-3 font-medium min-w-[180px]">Hesap</th>
            <th className="px-4 py-3 font-medium">Tip</th>
            <th className="px-4 py-3 text-right font-medium">Tutar</th>
            {onDeleteTransaction ? <th className="px-4 py-3 text-right font-medium">Aksiyon</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-slate-200">
          {rows.map((txn) => {
            const amountText = `${txn.direction === "in" ? "+" : "-"}${formatCurrencyTRY(txn.amount)}`;
            const amountClass = txn.direction === "in" ? "text-emerald-300" : "text-rose-300";
            const accountLabel = accountNameById.get(txn.accountId) ?? txn.accountId;

            return (
              <tr key={txn.id}>
                <td className="whitespace-nowrap px-4 py-3">{formatDateTR(txn.occurredAt)}</td>
                <td className="px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <span>{txn.title}</span>
                    {highRiskSet.has(txn.id) ? (
                      <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-200">
                        Riskli
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{categoryLabels[txn.category]}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-300">{accountLabel}</td>
                <td className="whitespace-nowrap px-4 py-3">{getTransactionTypeLabel(txn)}</td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-medium ${amountClass}`}>{amountText}</td>
                {onDeleteTransaction ? (
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteTransaction(txn.id)}
                      className="inline-grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-rose-300/50 hover:bg-rose-500/10 hover:text-rose-200"
                      aria-label={`${txn.title} işlemini sil`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
