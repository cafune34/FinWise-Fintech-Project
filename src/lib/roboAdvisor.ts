import type { PortfolioAllocation, RiskProfile, RoboAnswer } from "@/types/finance";

const RISK_PROFILE_DESCRIPTIONS: Record<RiskProfile, string> = {
  dusuk: "Düşük Risk",
  orta: "Orta Risk",
  yuksek: "Yüksek Risk",
};

const PORTFOLIO_ALLOCATIONS: Record<RiskProfile, PortfolioAllocation[]> = {
  dusuk: [
    { asset: "Mevduat", percentage: 70 },
    { asset: "Altın", percentage: 20 },
    { asset: "Fon/Hisse", percentage: 10 },
    { asset: "Kripto/Dijital Varlık", percentage: 0 },
  ],
  orta: [
    { asset: "Mevduat", percentage: 40 },
    { asset: "Altın", percentage: 30 },
    { asset: "Fon/Hisse", percentage: 20 },
    { asset: "Kripto/Dijital Varlık", percentage: 10 },
  ],
  yuksek: [
    { asset: "Mevduat", percentage: 20 },
    { asset: "Altın", percentage: 20 },
    { asset: "Fon/Hisse", percentage: 40 },
    { asset: "Kripto/Dijital Varlık", percentage: 20 },
  ],
};

export function calculateRiskScore(answers: RoboAnswer[]): number {
  if (answers.length === 0) {
    return 0;
  }

  return answers.reduce((total, answer) => total + answer.score, 0);
}

export function getRiskProfile(score: number): RiskProfile {
  if (score <= 8) {
    return "dusuk";
  }

  if (score <= 11) {
    return "orta";
  }

  return "yuksek";
}

export function getPortfolioAllocation(profile: RiskProfile): PortfolioAllocation[] {
  return PORTFOLIO_ALLOCATIONS[profile];
}

export function getRiskProfileDescription(profile: RiskProfile): string {
  return RISK_PROFILE_DESCRIPTIONS[profile];
}

