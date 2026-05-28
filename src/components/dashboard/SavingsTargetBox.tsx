import { Target } from "lucide-react";
import { formatCurrencyTRY } from "@/lib/format";

type SavingsGoal = {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
};

// Mock hedefler - LocalStorage'i karmaşıklaştırmamak için şimdilik static
const MOCK_GOALS: SavingsGoal[] = [
  { id: "g1", name: "Acil Durum Fonu", currentAmount: 15000, targetAmount: 50000 },
  { id: "g2", name: "Tatil Bütçesi", currentAmount: 8500, targetAmount: 20000 },
  { id: "g3", name: "Eğitim Bütçesi", currentAmount: 3200, targetAmount: 15000 },
];

export default function SavingsTargetBox() {
  return (
    <article className="rounded-xl border border-white/10 bg-[#0e1726]/80 p-5 shadow-xl shadow-black/10 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-300" />
            Önerilen Finansal Hedefler
          </h3>
          <p className="mt-1 text-xs text-slate-400">Finansal planlama için önerilen hedefler</p>
        </div>
        <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-medium text-cyan-300 border border-cyan-500/20">
          Örnek Plan
        </span>
      </div>

      <div className="space-y-4">
        {MOCK_GOALS.map((goal) => {
          const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
          const remaining = goal.targetAmount - goal.currentAmount;

          return (
            <div key={goal.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">{goal.name}</span>
                <span className="text-xs text-slate-400">
                  {formatCurrencyTRY(goal.currentAmount)} / {formatCurrencyTRY(goal.targetAmount)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900 border border-white/5">
                <div
                  className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>%{Math.floor(progress)} tamamlandı</span>
                <span>{formatCurrencyTRY(remaining)} kaldı</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-white/5 pt-3 text-[10px] text-slate-500 text-center">
        Hedefler portföy sunumu için öneri olarak gösterilir.
      </div>
    </article>
  );
}
