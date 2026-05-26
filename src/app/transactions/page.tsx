"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import TransactionFilters from "@/components/TransactionFilters";
import StatCard from "@/components/StatCard";
import { formatCurrencyTRY } from "@/lib/format";
import { categoryLabels, getAccountTypeLabel } from "@/lib/labels";
import { generateRegTechAlerts, getHighRiskTransactions } from "@/lib/regtech";
import { useFinanceData } from "@/lib/useFinanceData";
import type { TransactionCategory, TransactionType } from "@/types/finance";

type TransactionFormState = {
  occurredAt: string;
  title: string;
  category: TransactionCategory | "";
  accountId: string;
  type: TransactionType;
  amount: string;
};

const categoryOptions: TransactionCategory[] = [
  "market",
  "ulasim",
  "fatura",
  "egitim",
  "eglence",
  "saglik",
  "kira",
  "maas",
  "transfer",
  "yatirim",
  "diger",
];

const initialForm: TransactionFormState = {
  occurredAt: new Date().toISOString().slice(0, 10),
  title: "",
  category: "",
  accountId: "",
  type: "gider",
  amount: "",
};

export default function TransactionsPage() {
  const {
    accounts,
    transactions,
    budgetsWithSpending,
    user,
    addTransaction,
    deleteTransaction,
  } = useFinanceData();
  const [form, setForm] = useState<TransactionFormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [transactions]
  );
  const alerts = useMemo(
    () =>
      generateRegTechAlerts({
        transactions,
        budgets: budgetsWithSpending,
        userId: user.id,
      }),
    [budgetsWithSpending, transactions, user.id]
  );
  const highRiskTransactionIds = useMemo(() => getHighRiskTransactions(alerts), [alerts]);
  const income = transactions.filter((txn) => txn.type === "gelir").reduce((sum, txn) => sum + txn.amount, 0);
  const expense = transactions.filter((txn) => txn.type === "gider").reduce((sum, txn) => sum + txn.amount, 0);

  function updateField<K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "type" && value === "transfer" ? { category: "transfer" as TransactionCategory } : {}),
    }));
  }

  function validateForm() {
    const nextErrors: string[] = [];
    const amount = Number(form.amount);

    if (!form.title.trim()) {
      nextErrors.push("Açıklama boş olamaz.");
    }

    if (!form.accountId) {
      nextErrors.push("Hesap seçilmelidir.");
    }

    if (!form.category) {
      nextErrors.push("Kategori seçilmelidir.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.push("Tutar 0'dan büyük olmalıdır.");
    }

    if (!form.occurredAt) {
      nextErrors.push("Tarih seçilmelidir.");
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (nextErrors.length > 0 || !form.category) {
      setErrors(nextErrors);
      return;
    }

    addTransaction({
      accountId: form.accountId,
      title: form.title,
      amount: Number(form.amount),
      category: form.category,
      type: form.type,
      occurredAt: form.occurredAt,
    });
    setForm(initialForm);
    setErrors([]);
  }

  return (
    <AppShell
      title="İşlemler"
      description="Gelir, gider ve transfer hareketlerini kategori, hesap ve işlem tipine göre inceleyin."
    >
      <div className="grid w-full gap-4 md:grid-cols-3">
        <StatCard title="Toplam İşlem" value={String(transactions.length)} description="Listelenen finans hareketi" />
        <StatCard title="Gelir Toplamı" value={formatCurrencyTRY(income)} tone="positive" description="Tüm gelir kayıtları" />
        <StatCard title="Gider Toplamı" value={formatCurrencyTRY(expense)} tone="negative" description="Tüm gider kayıtları" />
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Yeni işlem ekle</h3>
            <p className="mt-1 text-sm text-slate-400">Kayıt oluşturulduğunda tablo ve hesap bakiyesi anında güncellenir.</p>
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            İşlem ekle
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm text-slate-200">
            Tarih
            <input
              type="date"
              value={form.occurredAt}
              onChange={(event) => updateField("occurredAt", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>

          <label className="text-sm text-slate-200">
            Açıklama
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>

          <label className="text-sm text-slate-200">
            Hesap
            <select
              value={form.accountId}
              onChange={(event) => updateField("accountId", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="">Hesap seçiniz</option>
              {accounts.filter((a) => a.status !== "pasif").map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {account.accountName ?? getAccountTypeLabel(account.type)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Tip
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value as TransactionType)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="gelir">Gelir</option>
              <option value="gider">Gider</option>
              <option value="transfer">Transfer</option>
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Kategori
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value as TransactionCategory)}
              disabled={form.type === "transfer"}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 disabled:opacity-70"
            >
              <option value="">Kategori seçiniz</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Tutar
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
            />
          </label>
        </div>

        {errors.length > 0 ? (
          <div className="mt-4 rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
      </form>

      <TransactionFilters
        transactions={sortedTransactions}
        accounts={accounts}
        highRiskTransactionIds={highRiskTransactionIds}
        onDeleteTransaction={deleteTransaction}
      />
    </AppShell>
  );
}
