import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import { severityLabels } from "@/lib/labels";
import type { RegTechAlert, RegTechSeverity, Transaction } from "@/types/finance";
import { ShieldAlert, AlertTriangle, Info } from "lucide-react";
import type { ComponentType } from "react";

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

const severityStyles: Record<RegTechSeverity, { border: string; text: string; bg: string; icon: ComponentType<{ className?: string }> }> = {
  high: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    text: "text-rose-300",
    icon: ShieldAlert,
  },
  medium: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-300",
    icon: AlertTriangle,
  },
  low: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    text: "text-cyan-300",
    icon: Info,
  },
};

export default function RiskAlertCard({ alert, transaction }: RiskAlertCardProps) {
  const severity = resolveSeverity(alert);
  const styles = severityStyles[severity];
  const Icon = styles.icon;

  return (
    <article className={`rounded-xl border ${styles.border} ${styles.bg} p-5 shadow-lg transition-all hover:scale-[1.01] hover:bg-slate-950/50`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-lg p-1.5 border border-white/5 bg-slate-900 ${styles.text}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{alert.title ?? "Risk Uyarısı"}</h3>
            <p className="mt-1.5 text-xs text-slate-400">Referans Kodu: <span className="font-mono text-cyan-300">{alert.id.split("-").pop()?.toUpperCase()}</span></p>
          </div>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${styles.border} ${styles.bg} ${styles.text}`}>
          {severityLabels[severity]}
        </span>
      </div>

      <div className="mt-4 space-y-3.5 text-xs">
        {/* Sebep */}
        <div>
          <span className="block font-medium text-slate-400 uppercase tracking-wider text-[10px]">Sebep</span>
          <p className="mt-1 text-slate-200 leading-relaxed">{alert.reason}</p>
        </div>

        {/* Olası Etki */}
        {alert.impact && (
          <div>
            <span className="block font-medium text-slate-400 uppercase tracking-wider text-[10px]">Olası Etki</span>
            <p className="mt-1 text-slate-300 leading-relaxed">{alert.impact}</p>
          </div>
        )}

        {/* Önerilen Aksiyon */}
        {alert.recommendedAction && (
          <div className="rounded-lg border border-cyan-500/10 bg-cyan-950/20 p-2.5">
            <span className="block font-semibold text-cyan-300 uppercase tracking-wider text-[10px]">Önerilen Aksiyon</span>
            <p className="mt-1 text-slate-200 leading-relaxed font-medium">{alert.recommendedAction}</p>
          </div>
        )}

        {/* İlgili İşlem Bilgisi */}
        {transaction && (
          <div className="mt-2 rounded-lg border border-white/5 bg-slate-950/60 p-3">
            <span className="block font-medium text-slate-400 uppercase tracking-wider text-[10px] mb-1.5">İlgili İşlem Detayı</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">İşlem Başlığı:</span>
                <span className="font-medium text-white">{transaction.title}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Tutar:</span>
                <span className="font-bold text-cyan-200">{formatCurrencyTRY(transaction.amount)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Kategori:</span>
                <span className="font-medium text-white capitalize">{transaction.category}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Tarih:</span>
                <span className="font-medium text-white">{formatDateTR(transaction.occurredAt)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
