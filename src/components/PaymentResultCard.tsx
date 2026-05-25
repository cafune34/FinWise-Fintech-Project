import { formatCurrencyTRY } from "@/lib/format";
import type { PaymentSimulationResult } from "@/lib/payments";

type PaymentResultCardProps = {
  result: PaymentSimulationResult;
  warnings: string[];
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

export default function PaymentResultCard({ result, warnings }: PaymentResultCardProps) {
  const statusLabelMap: Record<typeof result.status, string> = {
    isleme_alindi: "İşleme Alındı",
    beklemede: "Beklemede",
    tamamlandi: "Tamamlandı",
  };

  return (
    <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
      <h3 className="text-base font-semibold text-emerald-200">Talimat oluşturuldu</h3>
      <p className="mt-2 text-sm font-medium text-white">{result.message}</p>

      <div className="mt-3 grid gap-2 text-sm text-slate-200 md:grid-cols-2">
        <p>
          Referans numarası: <span className="font-medium text-cyan-300">{result.referenceNumber}</span>
        </p>
        <p>Durum: {statusLabelMap[result.status]}</p>
        <p>Ödeme Türü: {result.paymentTypeLabel}</p>
        <p>Tutar: {formatCurrencyTRY(result.amount)}</p>
        <p>Kaynak Hesap: {result.sourceAccountName}</p>
        <p>Alıcı/Kurum: {result.payeeName}</p>
        <p>Talimat zamanı: {formatDateTimeTR(result.createdAt)}</p>
      </div>

      {result.description ? (
        <p className="mt-3 rounded-md border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          Açıklama: {result.description}
        </p>
      ) : null}

      {warnings.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}
    </article>
  );
}

