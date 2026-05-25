"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileCheck2, Trash2 } from "lucide-react";
import { formatCurrencyTRY } from "@/lib/format";
import { getPaymentTypeLabel } from "@/lib/payments";
import { paymentStatusLabels } from "@/lib/labels";
import { useFinanceData } from "@/lib/useFinanceData";
import type { PaymentOrder, PaymentType } from "@/types/finance";

type FormState = {
  paymentType: PaymentType;
  sourceAccountId: string;
  payeeName: string;
  amount: string;
  dueDate: string;
  description: string;
};

const initialFormState: FormState = {
  paymentType: "fatura",
  sourceAccountId: "",
  payeeName: "",
  amount: "",
  dueDate: new Date().toISOString().slice(0, 10),
  description: "",
};

function formatDateTimeTR(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function PaymentSimulationForm() {
  const {
    accounts,
    paymentOrders,
    createPaymentOrder,
    updatePaymentOrderStatus,
    deletePaymentOrder,
  } = useFinanceData();
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [latestOrderId, setLatestOrderId] = useState<string | null>(null);
  const latestOrder = useMemo(
    () => paymentOrders.find((order) => order.id === latestOrderId) ?? paymentOrders[0] ?? null,
    [latestOrderId, paymentOrders]
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm() {
    const nextErrors: string[] = [];
    const nextWarnings: string[] = [];
    const amount = Number(form.amount);
    const sourceAccount = accounts.find((account) => account.id === form.sourceAccountId);

    if (!form.sourceAccountId || !sourceAccount) {
      nextErrors.push("Kaynak hesap seçilmelidir.");
    }

    if (!form.payeeName.trim()) {
      nextErrors.push("Alıcı adı / kurum adı zorunludur.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.push("Tutar 0'dan büyük olmalıdır.");
    }

    if (!form.dueDate) {
      nextErrors.push("Talimat tarihi seçilmelidir.");
    }

    if (sourceAccount && amount > sourceAccount.balance) {
      nextWarnings.push("Girilen tutar kaynak hesap bakiyesinden büyüktür. Talimat beklemede olarak kaydedildi.");
    }

    return { nextErrors, nextWarnings, sourceAccount, amount };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { nextErrors, nextWarnings, sourceAccount, amount } = validateForm();

    if (nextErrors.length > 0 || !sourceAccount) {
      setErrors(nextErrors);
      setWarnings(nextWarnings);
      return;
    }

    const order = createPaymentOrder({
      paymentType: form.paymentType,
      sourceAccountId: sourceAccount.id,
      payee: form.payeeName,
      amount,
      dueDate: form.dueDate,
      description: form.description,
      status: amount > sourceAccount.balance ? "beklemede" : "isleme_alindi",
    });

    setLatestOrderId(order.id);
    setErrors([]);
    setWarnings(nextWarnings);
    setForm(initialFormState);
  }

  return (
    <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.75fr)]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
        <h3 className="text-base font-semibold text-white">Ödeme talimatı oluştur</h3>
        <p className="mt-2 text-sm text-slate-300">
          Kaynak hesabı, alıcıyı ve tutarı seçerek takip edilebilir bir ödeme talimatı hazırlayın.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-200">
            Ödeme Türü
            <select
              value={form.paymentType}
              onChange={(event) => updateField("paymentType", event.target.value as PaymentType)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="fatura">Fatura Ödeme</option>
              <option value="transfer">Para Transferi</option>
              <option value="abonelik">Abonelik Ödemesi</option>
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Kaynak Hesap
            <select
              value={form.sourceAccountId}
              onChange={(event) => updateField("sourceAccountId", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
            >
              <option value="">Hesap seçiniz</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.bankName} - {formatCurrencyTRY(account.balance)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-200">
            Alıcı Adı / Kurum Adı
            <input
              type="text"
              value={form.payeeName}
              onChange={(event) => updateField("payeeName", event.target.value)}
              aria-label="Alıcı adı veya kurum adı"
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <label className="text-sm text-slate-200">
            Tutar (TRY)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              aria-label="Tutar"
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>

          <label className="text-sm text-slate-200">
            Talimat Tarihi
            <input
              type="date"
              value={form.dueDate}
              onChange={(event) => updateField("dueDate", event.target.value)}
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm text-slate-200">
          Açıklama (Opsiyonel)
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={3}
            aria-label="Talimat açıklaması"
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </label>

        {errors.length > 0 ? (
          <div className="mt-4 rounded-md border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        {warnings.length > 0 ? (
          <div className="mt-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-4 inline-flex items-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Talimat oluştur
        </button>
      </form>

      <aside className="space-y-4">
        {latestOrder ? (
          <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-xl shadow-black/10">
            <h3 className="text-base font-semibold text-emerald-200">Son talimat özeti</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-200 2xl:grid-cols-2">
              <p>
                Referans numarası: <span className="font-medium text-cyan-300">{latestOrder.referenceNumber}</span>
              </p>
              <p>Durum: {paymentStatusLabels[latestOrder.status]}</p>
              <p>Ödeme Türü: {getPaymentTypeLabel(latestOrder.paymentType ?? "fatura")}</p>
              <p>Tutar: {formatCurrencyTRY(latestOrder.amount)}</p>
              <p>Alıcı/Kurum: {latestOrder.payee}</p>
              <p>Talimat zamanı: {formatDateTimeTR(latestOrder.createdAt ?? latestOrder.dueDate)}</p>
            </div>
          </article>
        ) : (
          <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-cyan-300" />
              <h3 className="text-base font-semibold text-white">Talimat özeti</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Talimat oluşturulduğunda referans numarası, talimat durumu ve ödeme detayları bu panelde görünür.
            </p>
          </article>
        )}

        <article className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-emerald-300" />
            <h3 className="text-sm font-semibold text-white">Durum akışı</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {["Beklemede", "İşleme Alındı", "Tamamlandı", "Reddedildi"].map((status) => (
              <div key={status} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                <span className="text-slate-200">{status}</span>
              </div>
            ))}
          </div>
        </article>
      </aside>

      <section className="xl:col-span-2 rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white">Talimat geçmişi</h3>
            <p className="mt-1 text-sm text-slate-400">Oluşturulan ödeme talimatları durum bilgisiyle listelenir.</p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {paymentOrders.length} talimat
          </span>
        </div>

        {paymentOrders.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {paymentOrders.map((order: PaymentOrder) => (
              <article key={order.id} className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white">{order.payee}</h4>
                    <p className="mt-1 text-sm text-slate-400">{getPaymentTypeLabel(order.paymentType ?? "fatura")}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePaymentOrder(order.id)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-300 transition hover:border-rose-300/50 hover:bg-rose-500/10 hover:text-rose-200"
                    aria-label={`${order.payee} talimatını sil`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-3 text-lg font-semibold text-cyan-200">{formatCurrencyTRY(order.amount)}</p>
                <p className="mt-1 text-sm text-slate-400">Talimat tarihi: {order.dueDate}</p>
                <label className="mt-3 block text-sm text-slate-200">
                  Durum
                  <select
                    value={order.status}
                    onChange={(event) => updatePaymentOrderStatus(order.id, event.target.value as PaymentOrder["status"])}
                    className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100"
                  >
                    <option value="beklemede">Beklemede</option>
                    <option value="isleme_alindi">İşleme Alındı</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="reddedildi">Reddedildi</option>
                  </select>
                </label>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 p-3 text-sm text-slate-400">
            Kayıtlı ödeme talimatı bulunmuyor.
          </p>
        )}
      </section>
    </div>
  );
}
