import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { severityLabels } from "@/lib/labels";
import type { RegTechAlert, RegTechSeverity, Transaction } from "@/types/finance";

type RiskAlertCardProps = {
  alert: RegTechAlert;
  transaction?: Transaction;
};

function resolveSeverity(alert: RegTechAlert): RegTechSeverity {
  if (alert.severity) {
    return alert.severity;
  }

  if (alert.level === "yuksek") {
    return "high";
  }

  if (alert.level === "orta") {
    return "medium";
  }

  return "low";
}

const severityStyles: Record<RegTechSeverity, string> = {
  high: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  low: "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
};

export default function RiskAlertCard({ alert, transaction }: RiskAlertCardProps) {
  const severity = resolveSeverity(alert);

  return (
    <article className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{alert.title ?? "Risk Uyarısı"}</h3>
          <p className="mt-1 text-sm text-slate-300">{alert.reason}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${severityStyles[severity]}`}>
          {severityLabels[severity]}
        </span>
      </div>

      {transaction ? (
        <div className="mt-3 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
          <p>İşlem: {transaction.title}</p>
          <p>Tutar: {formatCurrencyTRY(transaction.amount)}</p>
          <p>Tarih: {formatDateTR(transaction.occurredAt)}</p>
        </div>
      ) : null}
    </article>
  );
}
