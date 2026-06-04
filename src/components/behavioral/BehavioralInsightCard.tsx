import { clsx } from "clsx";
import { AlertTriangle, Brain, CheckCircle2, Gauge, Lightbulb } from "lucide-react";
import {
  getBehavioralBiasLabel,
  getBehavioralRiskLabel,
  type BehavioralInsight,
  type BehavioralRiskLevel,
} from "@/lib/behavioralFinance";

type BehavioralInsightCardProps = {
  insight: BehavioralInsight;
};

const riskStyles: Record<BehavioralRiskLevel, { border: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  dusuk: {
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    text: "text-cyan-300",
    icon: CheckCircle2,
  },
  orta: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    text: "text-amber-300",
    icon: AlertTriangle,
  },
  yuksek: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    text: "text-rose-300",
    icon: Gauge,
  },
};

export default function BehavioralInsightCard({ insight }: BehavioralInsightCardProps) {
  const styles = riskStyles[insight.riskLevel];
  const RiskIcon = styles.icon;

  return (
    <article
      className={clsx(
        "rounded-xl border p-5 shadow-lg shadow-black/10 transition hover:bg-slate-950/50",
        styles.border,
        styles.bg
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={clsx("mt-0.5 rounded-lg border border-white/5 bg-slate-900 p-1.5", styles.text)}>
            <Brain className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {getBehavioralBiasLabel(insight.type)}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-white">{insight.title}</h3>
          </div>
        </div>

        <span
          className={clsx(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            styles.border,
            styles.bg,
            styles.text
          )}
        >
          <RiskIcon className="h-3 w-3" />
          {getBehavioralRiskLabel(insight.riskLevel)}
        </span>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-300">{insight.description}</p>

      <div className="mt-4 space-y-3 text-xs">
        {insight.metric && (
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/50 px-3 py-2">
            <span className="text-slate-400">{insight.metric.label}</span>
            <span className="font-semibold text-white">{insight.metric.value}</span>
          </div>
        )}

        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Kanit</span>
          <p className="mt-1 leading-relaxed text-slate-200">{insight.evidence}</p>
        </div>

        <div className="rounded-lg border border-cyan-500/10 bg-cyan-950/20 p-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
            <Lightbulb className="h-3 w-3" />
            Oneri
          </span>
          <p className="mt-1 leading-relaxed text-slate-200">{insight.recommendation}</p>
        </div>

        {insight.affectedCategories && insight.affectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {insight.affectedCategories.slice(0, 5).map((category) => (
              <span
                key={category}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-300"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
