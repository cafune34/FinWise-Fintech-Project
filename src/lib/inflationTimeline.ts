import { MOCK_INFLATION_DATA, INFLATION_DISCLAIMER } from "@/data/inflationMock";
import { formatCurrencyTRY, formatPercent } from "@/lib/format";
import type { FinanceSnapshot } from "@/lib/storage";

export type InflationTimelinePoint = {
  year: number;
  purchasingPowerIndex: number;
  estimatedInflationRate: number;
  usdTryReference: number;
  equivalentValue: number;
  valueLossFromBase: number;
  formattedEquivalentValue: string;
  note: string;
};

export type InflationTimelineResult = {
  baseAmount: number;
  baseYear: number;
  currentYear: number;
  points: InflationTimelinePoint[];
  strongestLossYear?: number;
  totalPurchasingPowerLossPercent: number;
  summary: string;
  interpretation: string;
  recommendations: string[];
  dataSourceLabel: string;
  disclaimer: string;
};

export function calculateTotalTryAssets(snapshot: FinanceSnapshot): number {
  return snapshot.accounts
    .filter((account) => account.status !== "pasif")
    .reduce((sum, account) => sum + account.balance, 0);
}

export function buildInflationTimeline(snapshot: FinanceSnapshot): InflationTimelineResult {
  const baseAmount = calculateTotalTryAssets(snapshot);
  
  if (MOCK_INFLATION_DATA.length === 0) {
    return {
      baseAmount,
      baseYear: new Date().getFullYear(),
      currentYear: new Date().getFullYear(),
      points: [],
      totalPurchasingPowerLossPercent: 0,
      summary: "Veri bulunamadı.",
      interpretation: "Veri eksikliği sebebiyle analiz yapılamadı.",
      recommendations: [],
      dataSourceLabel: "Bilinmiyor",
      disclaimer: INFLATION_DISCLAIMER,
    };
  }

  const sortedData = [...MOCK_INFLATION_DATA].sort((a, b) => a.year - b.year);
  const baseData = sortedData[0];
  const currentData = sortedData[sortedData.length - 1];

  const points: InflationTimelinePoint[] = sortedData.map((data) => {
    // Equivalent value calculation:
    // If today (2026) the index is 30, and in 2022 the index was 100,
    // it means 100 TL in 2022 could buy what 100 TL buys today, but inversely,
    // to have the same purchasing power as today's baseAmount in 2022, 
    // it would have required: baseAmount * (data.purchasingPowerIndex / currentData.purchasingPowerIndex)
    // Wait, let's keep it simple as requested: "Bugünkü 175.210 TL'nin geçmiş yıllardaki alım gücü karşılığı".
    // 2026 index = 30. 2022 index = 100.
    // Equivalent Value in 2022 = baseAmount * (100 / 30).
    const equivalentValue = baseAmount * (data.purchasingPowerIndex / currentData.purchasingPowerIndex);
    const valueLossFromBase = 100 - data.purchasingPowerIndex;

    return {
      year: data.year,
      purchasingPowerIndex: data.purchasingPowerIndex,
      estimatedInflationRate: data.estimatedInflationRate,
      usdTryReference: data.usdTryReference,
      equivalentValue,
      valueLossFromBase,
      formattedEquivalentValue: formatCurrencyTRY(equivalentValue),
      note: data.note,
    };
  });

  // Calculate the year with the strongest year-over-year loss (max index drop)
  let strongestLossYear: number | undefined;
  let maxDrop = 0;
  for (let i = 1; i < sortedData.length; i++) {
    const drop = sortedData[i - 1].purchasingPowerIndex - sortedData[i].purchasingPowerIndex;
    if (drop > maxDrop) {
      maxDrop = drop;
      strongestLossYear = sortedData[i].year;
    }
  }

  const totalPurchasingPowerLossPercent = 100 - currentData.purchasingPowerIndex;

  const summary = `Demo endekse göre TL satın alma gücü ${baseData.year}=100 kabul edildiğinde ${currentData.year}'da ${currentData.purchasingPowerIndex} seviyesine gerilemiş görünür.`;
  const interpretation = `Bugünkü ${formatCurrencyTRY(baseAmount)} varlığınızın ${baseData.year} yılındaki alım gücü karşılığı ${formatCurrencyTRY(points[0].equivalentValue)} seviyesindeydi. Bu süreçte TL bazlı varlıklar demo endekse göre ${formatPercent(totalPurchasingPowerLossPercent)} değer kaybına uğradı.`;

  const recommendations = [
    "Bütçe limitlerini enflasyon dönemlerinde daha sık gözden geçirin.",
    "Zorunlu giderleri ayrı takip edin.",
    "Satın alma gücü düşüşünü aylık nakit akışıyla birlikte değerlendirin.",
  ];

  return {
    baseAmount,
    baseYear: baseData.year,
    currentYear: currentData.year,
    points,
    strongestLossYear,
    totalPurchasingPowerLossPercent,
    summary,
    interpretation,
    recommendations,
    dataSourceLabel: "Demo Veri",
    disclaimer: INFLATION_DISCLAIMER,
  };
}

export function summarizeInflationTimelineForCopilot(snapshot: FinanceSnapshot) {
  const result = buildInflationTimeline(snapshot);
  return {
    available: true,
    currentPurchasingPowerIndex: result.points.length > 0 ? result.points[result.points.length - 1].purchasingPowerIndex : 100,
    totalLossPercent: result.totalPurchasingPowerLossPercent,
    summary: result.summary,
    route: "/inflation-timeline" as const,
  };
}
