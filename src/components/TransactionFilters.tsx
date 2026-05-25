"use client";

import { useMemo, useState } from "react";
import type { BankAccount, Transaction, TransactionCategory } from "@/types/finance";
import TransactionTable from "@/components/TransactionTable";

type TransactionFiltersProps = {
  transactions: Transaction[];
  accounts: BankAccount[];
};

const categoryOptions: { value: "tum" | TransactionCategory; label: string }[] = [
  { value: "tum", label: "Tum kategoriler" },
  { value: "market", label: "Market" },
  { value: "ulasim", label: "Ulasim" },
  { value: "fatura", label: "Fatura" },
  { value: "egitim", label: "Egitim" },
  { value: "eglence", label: "Eglence" },
  { value: "saglik", label: "Saglik" },
  { value: "kira", label: "Kira" },
  { value: "maas", label: "Maas" },
  { value: "transfer", label: "Transfer" },
  { value: "yatirim", label: "Yatirim" },
  { value: "diger", label: "Diger" },
];

export default function TransactionFilters({ transactions, accounts }: TransactionFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<"tum" | TransactionCategory>("tum");
  const [selectedType, setSelectedType] = useState<"tum" | "gelir" | "gider">("tum");
  const [selectedAccount, setSelectedAccount] = useState<"tum" | string>("tum");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const categoryMatch = selectedCategory === "tum" || txn.category === selectedCategory;
      const typeMatch =
        selectedType === "tum" ||
        (selectedType === "gelir" && txn.direction === "in") ||
        (selectedType === "gider" && txn.direction === "out");
      const accountMatch = selectedAccount === "tum" || txn.accountId === selectedAccount;

      return categoryMatch && typeMatch && accountMatch;
    });
  }, [selectedAccount, selectedCategory, selectedType, transactions]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-3">
        <label className="text-sm text-slate-300">
          Kategori
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
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
          Islem Tipi
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as "tum" | "gelir" | "gider")}
          >
            <option value="tum">Tum tipler</option>
            <option value="gelir">Gelir</option>
            <option value="gider">Gider</option>
          </select>
        </label>

        <label className="text-sm text-slate-300">
          Banka Hesabi
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
            value={selectedAccount}
            onChange={(event) => setSelectedAccount(event.target.value)}
          >
            <option value="tum">Tum hesaplar</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} ({account.type})
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-slate-400">Filtre sonucu: {filteredTransactions.length} islem</p>

      <TransactionTable
        transactions={filteredTransactions}
        accounts={accounts}
        emptyMessage="Secili filtrelerle eslesen islem bulunamadi."
      />
    </div>
  );
}
