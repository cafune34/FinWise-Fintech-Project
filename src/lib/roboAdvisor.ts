import type { PortfolioAllocation, RiskProfile, RoboAnswer } from "@/types/finance";

const RISK_PROFILE_DESCRIPTIONS: Record<RiskProfile, string> = {
  dusuk: "Düşük Risk",
  orta: "Orta Risk",
  yuksek: "Yüksek Risk",
};

export const RISK_PROFILE_DETAILS: Record<RiskProfile, string> = {
  dusuk: "Sermaye koruması ve istikrarlı getiri önceliklidir. Fiyat dalgalanmalarından kaçınarak vadesiz/vadeli mevduat, altın ve düşük riskli fonlar gibi güvenli liman enstrümanlar portföyünüzün ağırlığını oluşturur.",
  orta: "Dengeli büyüme ve getiri hedeflenir. Risk ve getiri arasında rasyonel bir denge kurularak portföye mevduatın yanı sıra fon, hisse senedi ve sınırlı miktarda dijital varlık dahil edilir.",
  yuksek: "Yüksek getiri potansiyeli önceliklidir. Fiyat dalgalanmalarına karşı yüksek tolerans gösterilerek büyüme odaklı yerli/yabancı hisse senetleri, fonlar ve kripto varlıklara ağırlık verilir.",
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

