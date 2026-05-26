"use client";

import AppShell from "@/components/AppShell";
import RoboQuestionnaire from "@/components/RoboQuestionnaire";
import RoboGoalProjection from "@/components/robo-advisor/RoboGoalProjection";
import { useFinanceData } from "@/lib/useFinanceData";
import type { RoboQuestion } from "@/types/finance";

const roboQuestions: RoboQuestion[] = [
  {
    id: "investment-horizon",
    question: "Yatırım vadeniz nedir?",
    options: [
      { value: "short", label: "0-1 yıl", score: 1 },
      { value: "mid", label: "1-3 yıl", score: 2 },
      { value: "long", label: "3 yıl ve üzeri", score: 3 },
    ],
  },
  {
    id: "risk-preference",
    question: "Risk tercihiniz nedir?",
    options: [
      { value: "low", label: "Düşük risk, istikrarlı getiri", score: 1 },
      { value: "medium", label: "Orta risk, dengeli getiri", score: 2 },
      { value: "high", label: "Yüksek risk, yüksek getiri potansiyeli", score: 3 },
    ],
  },
  {
    id: "savings-rate",
    question: "Aylık gelirinizin ne kadarını birikime ayırabilirsiniz?",
    options: [
      { value: "low", label: "%10'dan az", score: 1 },
      { value: "medium", label: "%10-%25 arası", score: 2 },
      { value: "high", label: "%25 ve üzeri", score: 3 },
    ],
  },
  {
    id: "market-fall-reaction",
    question: "Piyasa düşerse ne yaparsınız?",
    options: [
      { value: "sell", label: "Hızla satış yaparım", score: 1 },
      { value: "hold", label: "Beklerim, pozisyonu korurum", score: 2 },
      { value: "buy", label: "Fırsat görür, alım yaparım", score: 3 },
    ],
  },
  {
    id: "liquidity-need",
    question: "Acil nakit ihtiyacınız var mı?",
    options: [
      { value: "yes", label: "Evet, kısa vadede ihtiyacım olabilir", score: 1 },
      { value: "maybe", label: "Belirsiz, kısmen olabilir", score: 2 },
      { value: "no", label: "Hayır, acil nakit ihtiyacım yok", score: 3 },
    ],
  },
];

export default function RoboAdvisorPage() {
  const { lastRoboResult } = useFinanceData();

  return (
    <AppShell
      title="Yatırım Profili"
      description="Risk profili analizi ve önerilen dağılım görünümüyle finansal tercihlerinizi değerlendirin."
    >
      <RoboQuestionnaire questions={roboQuestions} />
      {lastRoboResult && (
        <RoboGoalProjection profile={lastRoboResult.profile} />
      )}
    </AppShell>
  );
}
