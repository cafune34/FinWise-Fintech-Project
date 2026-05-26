"use client";

import { useMemo, useState } from "react";
import { CreditCard, Edit2, Trash2, X } from "lucide-react";
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
  status?: BankAccount["status"];
};

const initialForm: AccountFormState = {
  bankName: "",
  accountName: "",
  type: "vadesiz",
  iban: "",
  balance: "",
  currency: "TRY",
  status: "aktif",
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
  const { accounts, transactions, addAccount, updateAccount, deleteAccount } = useFinanceData();
  const [form, setForm] = useState<AccountFormState>(initialForm);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Edit State
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [editForm, setEditForm] = useState<AccountFormState>(initialForm);
  const [editErrors, setEditErrors] = useState<string[]>([]);

  // Delete State
  const [deletingAccount, setDeletingAccount] = useState<BankAccount | null>(null);

  const totalBalance = useMemo(() => {
    return accounts
      .filter((account) => account.status !== "pasif")
      .reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);

  function updateField<K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateEditField<K extends keyof AccountFormState>(field: K, value: AccountFormState[K]) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(values: AccountFormState) {
    const nextErrors: string[] = [];
    const balance = Number(values.balance);

    if (!values.bankName.trim()) {
      nextErrors.push("Banka adı boş olamaz.");
    }

    if (!values.accountName.trim()) {
      nextErrors.push("Hesap adı boş olamaz.");
    }

    if (!Number.isFinite(balance)) {
      nextErrors.push("Bakiye sayı olmalıdır.");
    }

    return nextErrors;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);

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

  function handleEditClick(account: BankAccount) {
    setEditingAccount(account);
    setEditForm({
      bankName: account.bankName,
      accountName: account.accountName ?? "",
      type: account.type,
      iban: account.iban,
      balance: String(account.balance),
      currency: account.currency,
      status: account.status ?? "aktif",
    });
    setEditErrors([]);
  }

  function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAccount) return;

    const nextErrors = validateForm(editForm);

    if (nextErrors.length > 0) {
      setEditErrors(nextErrors);
      return;
    }

    updateAccount(editingAccount.id, {
      bankName: editForm.bankName,
      accountName: editForm.accountName,
      type: editForm.type,
      iban: editForm.iban || "Kısa hesap no belirtilmedi",
      balance: Number(editForm.balance),
      currency: editForm.currency,
      status: editForm.status || "aktif",
    });

    setEditingAccount(null);
  }

  function handleDeleteClick(account: BankAccount) {
    setDeletingAccount(account);
  }

  const hasTransactions = useMemo(() => {
    if (!deletingAccount) return false;
    return transactions.some((txn) => txn.accountId === deletingAccount.id);
  }, [deletingAccount, transactions]);

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
          <p className="mt-2 text-sm text-slate-400">
            {accounts.filter((a) => a.status !== "pasif").length} aktif hesap
          </p>
        </article>
      </section>

      <div className="grid w-full gap-5 lg:grid-cols-3">
        {accounts.map((account) => {
          const recentForAccount = getRecentTransactions(
            filterTransactionsByAccount(transactions, account.id),
            4
          );

          return (
            <article key={account.id} className="relative rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">{getAccountTypeLabel(account.type)}</p>
                    {account.status === "pasif" && (
                      <span className="rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                        Pasif
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-white">{account.bankName}</h3>
                  <p className="mt-1 text-sm text-slate-400">{account.accountName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditClick(account)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-cyan-300 transition"
                    title="Düzenle"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(account)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-rose-300/50 hover:bg-rose-500/10 hover:text-rose-200"
                    title="Sil"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
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
                          <span className={txn.type === "gelir" ? "font-medium text-emerald-300" : "font-medium text-rose-300"}>
                            {txn.type === "gelir" ? "+" : "-"}{formatCurrencyTRY(txn.amount)}
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

      {/* Edit Account Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleEditSubmit}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0e1726] p-6 shadow-2xl relative"
          >
            <button
              type="button"
              onClick={() => setEditingAccount(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              title="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-4">Hesap Düzenle</h3>

            <div className="space-y-4">
              <label className="block text-sm text-slate-200">
                Banka adı
                <input
                  value={editForm.bankName}
                  onChange={(event) => updateEditField("bankName", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Hesap adı
                <input
                  value={editForm.accountName}
                  onChange={(event) => updateEditField("accountName", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-slate-200">
                  Hesap tipi
                  <select
                    value={editForm.type}
                    onChange={(event) => updateEditField("type", event.target.value as BankAccount["type"])}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="vadesiz">Vadesiz</option>
                    <option value="birikim">Birikim</option>
                  </select>
                </label>

                <label className="block text-sm text-slate-200">
                  Durum
                  <select
                    value={editForm.status}
                    onChange={(event) => updateEditField("status", event.target.value as BankAccount["status"])}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="pasif">Pasif</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm text-slate-200">
                IBAN veya kısa hesap no
                <input
                  value={editForm.iban}
                  onChange={(event) => updateEditField("iban", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm text-slate-200">
                  Bakiye
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.balance}
                    onChange={(event) => updateEditField("balance", event.target.value)}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  />
                </label>

                <label className="block text-sm text-slate-200">
                  Para birimi
                  <select
                    value={editForm.currency}
                    onChange={(event) => updateEditField("currency", event.target.value as BankAccount["currency"])}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="TRY">TRY</option>
                  </select>
                </label>
              </div>
            </div>

            {editErrors.length > 0 ? (
              <div className="mt-4 rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {editErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete / Deactivate Warning Modal */}
      {deletingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0e1726] p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setDeletingAccount(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              title="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            {hasTransactions ? (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">Hesap Pasifleştirilebilir</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  Bu hesaba bağlı işlemler var. İşlem geçmişinizin bozulmaması için hesabı doğrudan silmek yerine <strong>pasifleştirebilirsiniz</strong>.
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateAccount(deletingAccount.id, { status: "pasif" });
                      setDeletingAccount(null);
                    }}
                    className="w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition"
                  >
                    Pasifleştir (Önerilen)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteAccount(deletingAccount.id);
                      setDeletingAccount(null);
                    }}
                    className="w-full rounded-lg border border-rose-500/30 bg-rose-500/10 py-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 transition"
                  >
                    Yine de Tüm Geçmişle Birlikte Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingAccount(null)}
                    className="w-full rounded-lg border border-white/10 bg-slate-800 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    İptal
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">Hesabı Sil</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  <strong>{deletingAccount.bankName}</strong> hesabını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeletingAccount(null)}
                    className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteAccount(deletingAccount.id);
                      setDeletingAccount(null);
                    }}
                    className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition"
                  >
                    Hesabı Sil
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
