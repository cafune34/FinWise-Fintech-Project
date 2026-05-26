"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, FileCheck2, Trash2, Eye, X, Calendar } from "lucide-react";
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

function formatDateOnlyTR(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const latestOrder = useMemo(
    () => paymentOrders.find((order) => order.id === latestOrderId) ?? null,
    [latestOrderId, paymentOrders]
  );

  const selectedOrder = useMemo(
    () => paymentOrders.find((order) => order.id === selectedOrderId) ?? null,
    [selectedOrderId, paymentOrders]
  );

  // Status Summary Stats
  const statusStats = useMemo(() => {
    const counts = {
      beklemede: 0,
      isleme_alindi: 0,
      tamamlandi: 0,
      reddedildi: 0,
      total: paymentOrders.length,
    };
    paymentOrders.forEach((order) => {
      const status = order.status;
      if (status === "beklemede" || status === "isleme_alindi" || status === "tamamlandi" || status === "reddedildi") {
        counts[status] += 1;
      }
    });
    return counts;
  }, [paymentOrders]);

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

  const getStatusBadgeStyle = (status: PaymentOrder["status"]) => {
    switch (status) {
      case "beklemede":
        return "border-amber-500/30 bg-amber-500/10 text-amber-300";
      case "isleme_alindi":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";
      case "tamamlandi":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
      case "reddedildi":
        return "border-rose-500/30 bg-rose-500/10 text-rose-300";
      default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    }
  };

  const getAccountName = (accountId?: string) => {
    if (!accountId) return "-";
    const account = accounts.find((a) => a.id === accountId);
    return account ? `${account.bankName} (${account.accountName ?? "Vadesiz"})` : "Bilinmeyen Hesap";
  };

  return (
    <div className="space-y-6">
      <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] 2xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,0.85fr)]">
        {/* Form panel */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
          <h3 className="text-base font-semibold text-white">Talimat Oluştur</h3>
          <p className="mt-2 text-sm text-slate-300">
            Kaynak hesabı, alıcıyı ve tutarı seçerek takip edilebilir bir ödeme talimatı hazırlayın.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-200">
              Ödeme Türü
              <select
                value={form.paymentType}
                onChange={(event) => updateField("paymentType", event.target.value as PaymentType)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
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
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
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
                placeholder="Örn: Elektrik Dağıtım A.Ş. veya Ahmet Yılmaz"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-300 focus:outline-none"
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
                placeholder="0.00"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-300 focus:outline-none"
              />
            </label>

            <label className="text-sm text-slate-200">
              Talimat Tarihi
              <input
                type="date"
                value={form.dueDate}
                onChange={(event) => updateField("dueDate", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
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
              placeholder="Ödeme açıklaması girin..."
              className="mt-1 w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-300 focus:outline-none"
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
            className="mt-5 inline-flex items-center rounded-lg bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 shadow-md shadow-cyan-300/10"
          >
            Talimat oluştur
          </button>
        </form>

        {/* Side panel (Result / Info) */}
        <aside className="space-y-4">
          {latestOrder ? (
            <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                <h3 className="text-base font-semibold text-emerald-200">Talimat oluşturuldu</h3>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-200">
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Referans numarası:</span>
                  <span className="font-semibold text-cyan-300">{latestOrder.referenceNo ?? latestOrder.referenceNumber}</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Talimat durumu:</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(latestOrder.status)}`}>
                    {paymentStatusLabels[latestOrder.status]}
                  </span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Ödeme Türü:</span>
                  <span className="font-medium text-white">{getPaymentTypeLabel(latestOrder.paymentType ?? "fatura")}</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Tutar:</span>
                  <span className="font-semibold text-white">{formatCurrencyTRY(latestOrder.amount)}</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Kaynak Hesap:</span>
                  <span className="font-medium text-slate-200 text-right">{getAccountName(latestOrder.sourceAccountId)}</span>
                </p>
                <p className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400">Alıcı/Kurum:</span>
                  <span className="font-semibold text-white">{latestOrder.payee}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">Oluşturulma Tarihi:</span>
                  <span className="font-medium text-slate-300">
                    {formatDateTimeTR(latestOrder.createdAt ?? latestOrder.dueDate)}
                  </span>
                </p>
              </div>
            </article>
          ) : (
            <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-3">
                <FileCheck2 className="h-5 w-5 text-cyan-300" />
                <h3 className="text-base font-semibold text-white">Talimat Özeti</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Talimat oluşturulduğunda referans numarası, talimat durumu ve ödeme detayları bu panelde görünür.
              </p>
            </article>
          )}

          <article className="rounded-xl border border-white/10 bg-slate-950/45 p-5">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-emerald-300" />
              <h3 className="text-sm font-semibold text-white">Talimat Akışı Detayı</h3>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">Beklemede</p>
                  <p className="text-slate-400 text-[10px]">Hesap bakiyesinin yetersiz olması durumunda atanır.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">İşleme Alındı</p>
                  <p className="text-slate-400 text-[10px]">Talimat başarıyla planlandı ve işlem sırasına eklendi.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">Tamamlandı</p>
                  <p className="text-slate-400 text-[10px]">Ödeme gerçekleştirildi ve alıcı hesaba transfer edildi.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-rose-400" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-200">Reddedildi</p>
                  <p className="text-slate-400 text-[10px]">Talimat güvenlik veya limit aşımı nedeniyle iptal edildi.</p>
                </div>
              </div>
            </div>
          </article>
        </aside>
      </div>

      {/* Status Summary & Talimat Geçmişi */}
      <section className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white">Talimat Geçmişi</h3>
            <p className="mt-1 text-sm text-slate-400">Oluşturulan ödeme talimatları durum bilgisiyle listelenir.</p>
          </div>
          
          {/* Status counts row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-medium text-slate-300">
              Toplam: {statusStats.total}
            </span>
            <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 font-medium text-cyan-300">
              İşleme Alındı: {statusStats.isleme_alindi}
            </span>
            <span className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 font-medium text-amber-300">
              Beklemede: {statusStats.beklemede}
            </span>
            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 font-medium text-emerald-300">
              Tamamlandı: {statusStats.tamamlandi}
            </span>
            <span className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 font-medium text-rose-300">
              Reddedildi: {statusStats.reddedildi}
            </span>
          </div>
        </div>

        {paymentOrders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paymentOrders.map((order: PaymentOrder) => (
              <article
                key={order.id}
                className="relative flex flex-col justify-between rounded-xl border border-white/10 bg-slate-950/40 p-4 transition duration-200 hover:border-cyan-300/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-white truncate max-w-[160px] md:max-w-[200px]">{order.payee}</h4>
                      <p className="mt-1 text-xs text-slate-400">{getPaymentTypeLabel(order.paymentType ?? "fatura")}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedOrderId(order.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-cyan-300 transition"
                        title="Talimat Detayı"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePaymentOrder(order.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-rose-300/50 hover:bg-rose-500/10 hover:text-rose-200"
                        title="Talimatı Sil"
                        aria-label={`${order.payee} talimatını sil`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-xl font-bold text-cyan-200">{formatCurrencyTRY(order.amount)}</p>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-slate-400 border-t border-white/5 pt-3">
                    <p className="flex justify-between">
                      <span>Referans No:</span>
                      <span className="font-mono text-cyan-300">{order.referenceNo ?? order.referenceNumber}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Kaynak Hesap:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{getAccountName(order.sourceAccountId)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Oluşturulma:</span>
                      <span className="text-slate-300">{formatDateOnlyTR(order.createdAt ?? order.dueDate)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                    Talimat Durumu
                  </label>
                  <select
                    value={order.status}
                    onChange={(event) => updatePaymentOrderStatus(order.id, event.target.value as PaymentOrder["status"])}
                    className={`w-full rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-semibold focus:outline-none ${getStatusBadgeStyle(order.status)}`}
                  >
                    <option value="beklemede">Beklemede</option>
                    <option value="isleme_alindi">İşleme Alındı</option>
                    <option value="tamamlandi">Tamamlandı</option>
                    <option value="reddedildi">Reddedildi</option>
                  </select>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">
            Kayıtlı ödeme talimatı bulunmuyor.
          </p>
        )}
      </section>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <article className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0e1726] p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSelectedOrderId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              title="Kapat"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-2">Ödeme Talimatı Detayı</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">ID: {selectedOrder.id}</p>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Alıcı / Kurum:</span>
                <span className="font-semibold text-white">{selectedOrder.payee}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Ödeme Türü:</span>
                <span className="font-medium text-white">{getPaymentTypeLabel(selectedOrder.paymentType ?? "fatura")}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Tutar:</span>
                <span className="font-bold text-cyan-200 text-lg">{formatCurrencyTRY(selectedOrder.amount)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Referans Numarası:</span>
                <span className="font-mono text-cyan-300 font-semibold">{selectedOrder.referenceNo ?? selectedOrder.referenceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Kaynak Hesap:</span>
                <span className="font-medium text-white">{getAccountName(selectedOrder.sourceAccountId)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Hedef Ödeme Tarihi:</span>
                <span className="font-medium text-white flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-cyan-300" />
                  {formatDateOnlyTR(selectedOrder.dueDate)}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2.5">
                <span className="text-slate-400">Oluşturulma Tarihi:</span>
                <span className="font-medium text-slate-300">
                  {formatDateTimeTR(selectedOrder.createdAt ?? selectedOrder.dueDate)}
                </span>
              </div>
              
              <div className="border-b border-white/5 pb-2.5">
                <span className="text-slate-400 block mb-1">Açıklama:</span>
                <p className="bg-slate-950/40 rounded-lg p-2.5 text-xs text-slate-300 leading-5">
                  {selectedOrder.description ?? "Açıklama belirtilmemiş."}
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Talimat Durumu
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(event) => updatePaymentOrderStatus(selectedOrder.id, event.target.value as PaymentOrder["status"])}
                  className={`w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm font-semibold focus:outline-none ${getStatusBadgeStyle(selectedOrder.status)}`}
                >
                  <option value="beklemede">Beklemede</option>
                  <option value="isleme_alindi">İşleme Alındı</option>
                  <option value="tamamlandi">Tamamlandı</option>
                  <option value="reddedildi">Reddedildi</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  deletePaymentOrder(selectedOrder.id);
                  setSelectedOrderId(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/20 transition"
              >
                <Trash2 className="h-4 w-4" />
                Talimatı Sil
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
              >
                Kapat
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
