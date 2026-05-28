"use client";

import { useMemo, useState } from "react";
import type { BankAccount, Transaction, TransactionCategory, TransactionType } from "@/types/finance";
import TransactionTable from "@/components/TransactionTable";
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";

type TransactionFiltersProps = {
  transactions: Transaction[];
  accounts: BankAccount[];
  highRiskTransactionIds?: string[];
  onDeleteTransaction?: (transactionId: string) => void;
};

const categoryOptions: { value: "tum" | TransactionCategory; label: string }[] = [
  { value: "tum", label: "Tüm kategoriler" },
  { value: "market", label: categoryLabels.market },
  { value: "ulasim", label: categoryLabels.ulasim },
  { value: "fatura", label: categoryLabels.fatura },
  { value: "egitim", label: categoryLabels.egitim },
  { value: "eglence", label: categoryLabels.eglence },
  { value: "saglik", label: categoryLabels.saglik },
  { value: "kira", label: categoryLabels.kira },
  { value: "maas", label: categoryLabels.maas },
  { value: "transfer", label: categoryLabels.transfer },
  { value: "yatirim", label: categoryLabels.yatirim },
  { value: "diger", label: categoryLabels.diger },
];

export default function TransactionFilters({
  transactions,
  accounts,
  highRiskTransactionIds,
  onDeleteTransaction,
}: TransactionFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<"tum" | TransactionCategory>("tum");
  const [selectedType, setSelectedType] = useState<"tum" | TransactionType>("tum");
  const [selectedAccount, setSelectedAccount] = useState<"tum" | string>("tum");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const transactionType = txn.type ?? (txn.direction === "in" ? "gelir" : "gider");
      const categoryMatch = selectedCategory === "tum" || txn.category === selectedCategory;
      const typeMatch = selectedType === "tum" || transactionType === selectedType;
      const accountMatch = selectedAccount === "tum" || txn.accountId === selectedAccount;

      return categoryMatch && typeMatch && accountMatch;
    });
  }, [selectedAccount, selectedCategory, selectedType, transactions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-4 md:grid-cols-3">
        <label className="text-sm text-slate-300">
          Kategori
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as "tum" | TransactionCategory)}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-300">
          İşlem Tipi
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as "tum" | TransactionType)}
          >
            <option value="tum">Tüm tipler</option>
            <option value="gelir">Gelir</option>
            <option value="gider">Gider</option>
            <option value="transfer">Transfer</option>
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Banka Hesabı
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400"
            value={selectedAccount}
            onChange={(event) => setSelectedAccount(event.target.value)}
          >
            <option value="tum">Tüm hesaplar</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} - {account.accountName ?? getAccountTypeLabel(account.type)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-400">Filtre sonucu: {filteredTransactions.length} işlem</p>

      <TransactionTable
        transactions={filteredTransactions}
        accounts={accounts}
        highRiskTransactionIds={highRiskTransactionIds}
        emptyMessage="Seçili filtrelerle eşleşen işlem bulunamadı."
        onDeleteTransaction={onDeleteTransaction}
      />
    </div>
  );
}
