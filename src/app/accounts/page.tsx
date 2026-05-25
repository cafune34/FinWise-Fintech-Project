"use client";

import { useMemo, useState } from "react";
import { CreditCard, WalletCards } from "lucide-react";
import AppShell from "@/components/AppShell";
import { filterTransactionsByAccount, getRecentTransactions } from "@/lib/finance";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { getAccountTypeLabel } from "@/lib/labels";
import { useFinanceData } from "@/lib/useFinanceData";
import type { BankAccount } from "@/types/finance";

type AccountFormState = {
  bankName: string;
  accountName: string;
  type: BankAccount["type"];
  iban: string;
  balance: string;
  currency: BankAccount["currency"];
};

const initialForm: AccountFormState = {
  bankName: "",
  accountName: "",
  type: "vadesiz",
  iban: "",
  balance: "",
  currency: "TRY",
};

function maskIban(iban: string): string {
  if (iban.length <= 8) {
    return iban;
  }

  const prefix = iban.slice(0, 4);
  const suffix = iban.slice(-4);

  return `${prefix} **** **** **** **** ${suffix}`;
}

export default function AccountsPage() {
  const { accounts, transactions, addAccount } = useFinanceData();
  const [form, setForm] = useState<AccountFormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]);

  function updateField<K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    const nextErrors: string[] = [];
    const balance = Number(form.balance);

    if (!form.bankName.trim()) {
      nextErrors.push("Banka adı boş olamaz.");
    }

    if (!form.accountName.trim()) {
      nextErrors.push("Hesap adı boş olamaz.");
    }

    if (!Number.isFinite(balance)) {
      nextErrors.push("Bakiye sayı olmalıdır.");
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm();

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    addAccount({
      bankName: form.bankName,
      accountName: form.accountName,
      type: form.type,
      iban: form.iban || "Kısa hesap no belirtilmedi",
      balance: Number(form.balance),
      currency: form.currency,
    });
    setForm(initialForm);
    setErrors([]);
  }

  return (
    <AppShell
      title="Hesaplar"
      description="Banka hesapları, bakiye dağılımı ve son hareketler kurumsal bir görünümle izlenir."
    >
      <section className="grid w-full gap-4 md:grid-cols-[minmax(0,1fr)_minmax(260px,0.35fr)]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Yeni hesap ekle</h3>
              <p className="mt-1 text-sm text-slate-400">Eklenen hesap portföy özetine ve işlem formuna yansır.</p>
            </div>
            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Hesap ekle
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-sm text-slate-200">
              Banka adı
              <input
                value={form.bankName}
                onChange={(event) => updateField("bankName", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="text-sm text-slate-200">
              Hesap adı
              <input
                value={form.accountName}
                onChange={(event) => updateField("accountName", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="text-sm text-slate-200">
              Hesap tipi
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value as BankAccount["type"])}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="vadesiz">Vadesiz</option>
                <option value="birikim">Birikim</option>
              </select>
            </label>
            <label className="text-sm text-slate-200">
              IBAN veya kısa hesap no
              <input
                value={form.iban}
                onChange={(event) => updateField("iban", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="text-sm text-slate-200">
              Başlangıç bakiyesi
              <input
                type="number"
                step="0.01"
                value={form.balance}
                onChange={(event) => updateField("balance", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              />
            </label>
            <label className="text-sm text-slate-200">
              Para birimi
              <select
                value={form.currency}
                onChange={(event) => updateField("currency", event.target.value as BankAccount["currency"])}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
              >
                <option value="TRY">TRY</option>
              </select>
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

        <article className="rounded-xl border border-white/10 bg-[#0b1220]/80 p-5 shadow-xl shadow-black/10">
          <p className="text-sm text-slate-400">Toplam portföy</p>
          <p className="mt-2 text-3xl font-semibold text-cyan-200">{formatCurrencyTRY(totalBalance)}</p>
          <p className="mt-2 text-sm text-slate-400">{accounts.length} aktif hesap</p>
        </article>
      </section>

      <div className="grid w-full gap-5 lg:grid-cols-3">
        {accounts.map((account) => {
          const recentForAccount = getRecentTransactions(
            filterTransactionsByAccount(transactions, account.id),
            4
          );

          return (
            <article key={account.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">{getAccountTypeLabel(account.type)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{account.bankName}</h3>
                  <p className="mt-1 text-sm text-slate-400">{account.accountName}</p>
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
                {recentForAccount.length > 0 ? (
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
                ) : (
                  <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
                    Bu hesap için işlem bulunmuyor.
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
