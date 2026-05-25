import { getRiskProfileDescription } from "@/lib/roboAdvisor";
import type { PortfolioAllocation, RiskProfile } from "@/types/finance";

type RoboResultCardProps = {
  score: number;
  profile: RiskProfile;
  allocation: PortfolioAllocation[];
};

export default function RoboResultCard({ score, profile, allocation }: RoboResultCardProps) {
  return (
    <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
      <h3 className="text-base font-semibold text-emerald-200">Risk Profili Sonucu</h3>
      <p className="mt-2 text-sm text-slate-200">
        Skorunuz: <span className="font-semibold text-white">{score}</span> / 15
      </p>
      <p className="mt-1 text-sm text-slate-200">
        Profiliniz: <span className="font-semibold text-white">{getRiskProfileDescription(profile)}</span>
      </p>

      <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
        <p className="text-xs uppercase tracking-wide text-slate-400">Portföy Dağılımı Özeti</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-200">
          {allocation.map((item) => (
            <li key={item.asset} className="flex items-center justify-between gap-3">
              <span>{item.asset}</span>
              <span className="font-medium text-cyan-300">%{item.percentage}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

