"use client";

import { useState } from "react";
import { CheckCircle2, Clock3, FileCheck2 } from "lucide-react";
import PaymentResultCard from "@/components/PaymentResultCard";
import { mockAccounts } from "@/data/mockData";
import { formatCurrencyTRY } from "@/lib/format";
import {
  simulatePaymentOrder,
  validatePaymentOrder,
  type PaymentOrderInput,
  type PaymentSimulationResult,
} from "@/lib/payments";
import type { PaymentType } from "@/types/finance";

type FormState = {
  paymentType: PaymentType;
  sourceAccountId: string;
  payeeName: string;
  amount: string;
  description: string;
};

const initialFormState: FormState = {
  paymentType: "fatura",
  sourceAccountId: "",
  payeeName: "",
  amount: "",
  description: "",
};

export default function PaymentSimulationForm() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [result, setResult] = useState<PaymentSimulationResult | null>(null);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: PaymentOrderInput = {
      paymentType: form.paymentType,
      sourceAccountId: form.sourceAccountId,
      payeeName: form.payeeName,
      amount: Number(form.amount),
      description: form.description,
    };

    const validation = validatePaymentOrder(payload, mockAccounts);

    if (!validation.isValid || !validation.sourceAccount) {
      setErrors(validation.errors);
      setWarnings(validation.warnings);
      setResult(null);
      return;
    }

    const simulationResult = simulatePaymentOrder(payload, validation.sourceAccount);
    setErrors([]);
    setWarnings(validation.warnings);
    setResult(simulationResult);
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
              {mockAccounts.map((account) => (
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

        <button
          type="submit"
          className="mt-4 inline-flex items-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Talimat oluştur
        </button>
      </form>

      <aside className="space-y-4">
        {result ? (
          <PaymentResultCard result={result} warnings={warnings} />
        ) : (
          <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-cyan-300" />
              <h3 className="text-base font-semibold text-white">Talimat özeti</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Talimat oluşturulduğunda referans numarası, talimat durumu ve ödeme detayları bu panelde görünür.
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
                <p className="text-slate-400">Talimat durumu</p>
                <p className="mt-1 font-semibold text-cyan-200">Hazırlanıyor</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-slate-950/45 p-4">
                <p className="text-slate-400">Referans numarası</p>
                <p className="mt-1 font-semibold text-white">Talimat sonrası oluşur</p>
              </div>
            </div>
          </article>
        )}

        <article className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
          <div className="flex items-center gap-3">
            <Clock3 className="h-5 w-5 text-emerald-300" />
            <h3 className="text-sm font-semibold text-white">Durum akışı</h3>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {["İşleme Alındı", "Beklemede", "Tamamlandı"].map((status) => (
              <div key={status} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                <span className="text-slate-200">{status}</span>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </div>
  );
}

