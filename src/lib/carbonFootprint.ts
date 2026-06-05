import type { FinanceSnapshot } from "@/lib/storage";
import type { TransactionCategory } from "@/types/finance";
import { categoryLabels } from "@/lib/labels";

export type CarbonImpactLevel = "dusuk" | "orta" | "yuksek";

export type CarbonCategoryBreakdown = {
  category: string;
  label: string;
  amount: number;
  coefficientKgPer1000Try: number;
  estimatedKgCo2: number;
  percentage: number;
  impactLevel: CarbonImpactLevel;
};

export type CarbonFootprintResult = {
  totalExpenseAnalyzed: number;
  totalEstimatedKgCo2: number;
  highestImpactCategory?: CarbonCategoryBreakdown;
  categoryBreakdown: CarbonCategoryBreakdown[];
  impactLevel: CarbonImpactLevel;
  summary: string;
  recommendations: string[];
  methodologyNote: string;
  disclaimer: string;
  dataSourceLabel: string;
};

// Demo karbon katsayıları: kg CO2 / 1000 TL
const CARBON_COEFFICIENTS: Record<TransactionCategory, number> = {
  market: 12,
  ulasim: 45,
  fatura: 8,
  eglence: 10,
  kira: 5,
  saglik: 7,
  egitim: 4,
  yatirim: 2,
  transfer: 1,
  diger: 10,
  maas: 0, // Gelir kategorisi sıfır kabul edilir
};

export function getCarbonCoefficientForCategory(category: TransactionCategory): number {
  return CARBON_COEFFICIENTS[category] ?? 10;
}

export function getCarbonImpactLevel(estimatedKgCo2: number): CarbonImpactLevel {
  if (estimatedKgCo2 <= 50) return "dusuk";
  if (estimatedKgCo2 <= 150) return "orta";
  return "yuksek";
}

export function getCarbonCategoryLabel(category: TransactionCategory): string {
  return categoryLabels[category] ?? category;
}

export function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatKgCo2(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)} kg CO2`;
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

function safeDate(value?: string | Date): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function getReferenceDate(snapshot: FinanceSnapshot): Date {
  const latestTransactionDate = snapshot.transactions
    .map((transaction) => safeDate(transaction.occurredAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return latestTransactionDate ?? safeDate(snapshot.updatedAt) ?? new Date();
}

export function analyzeCarbonFootprint(snapshot: FinanceSnapshot): CarbonFootprintResult {
  // Gider işlemlerini filtrele (direction === "out")
  const outflows = snapshot.transactions.filter(
    (transaction) => transaction.direction === "out" && transaction.category !== "maas"
  );

  // Son 30 günlük işlemleri analiz et
  const refDate = getReferenceDate(snapshot);
  const thirtyDaysAgo = new Date(refDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  let targetTransactions = outflows.filter((t) => {
    const d = new Date(t.occurredAt);
    return d >= thirtyDaysAgo && d <= refDate;
  });

  // Son 30 günde işlem yoksa tüm gider işlemlerini fallback olarak kullan
  if (targetTransactions.length === 0) {
    targetTransactions = outflows;
  }

  // Kategoriler
  const categories: TransactionCategory[] = [
    "market",
    "ulasim",
    "fatura",
    "eglence",
    "kira",
    "saglik",
    "egitim",
    "yatirim",
    "transfer",
    "diger",
  ];

  // Kategori toplam harcamaları
  const totals: Record<TransactionCategory, number> = {
    market: 0,
    ulasim: 0,
    fatura: 0,
    eglence: 0,
    kira: 0,
    saglik: 0,
    egitim: 0,
    yatirim: 0,
    transfer: 0,
    diger: 0,
    maas: 0,
  };

  let totalExpenseAnalyzed = 0;
  targetTransactions.forEach((t) => {
    const cat = t.category;
    if (categories.includes(cat)) {
      totals[cat] += t.amount;
      totalExpenseAnalyzed += t.amount;
    } else if (cat !== "maas") {
      totals["diger"] = (totals["diger"] || 0) + t.amount;
      totalExpenseAnalyzed += t.amount;
    }
  });

  // Kategori bazlı CO2 hesaplama
  let totalEstimatedKgCo2 = 0;
  const rawBreakdowns = categories.map((cat) => {
    const amount = totals[cat] || 0;
    const coeff = getCarbonCoefficientForCategory(cat);
    const estimatedKgCo2 = (amount / 1000) * coeff;
    totalEstimatedKgCo2 += estimatedKgCo2;

    return {
      category: cat,
      label: getCarbonCategoryLabel(cat),
      amount,
      coefficientKgPer1000Try: coeff,
      estimatedKgCo2,
    };
  });

  // Yüzdeleri ve etki seviyelerini ekle
  const categoryBreakdown: CarbonCategoryBreakdown[] = rawBreakdowns.map((item) => {
    const percentage = totalEstimatedKgCo2 > 0 ? (item.estimatedKgCo2 / totalEstimatedKgCo2) * 100 : 0;
    const impactLevel = getCarbonImpactLevel(item.estimatedKgCo2);

    return {
      ...item,
      percentage,
      impactLevel,
    };
  });

  // Sadece harcama yapılan kategorileri filtrele (veya hepsi 0 ise hepsini tut)
  let filteredBreakdown = categoryBreakdown.filter((item) => item.amount > 0);
  if (filteredBreakdown.length === 0) {
    filteredBreakdown = categoryBreakdown;
  }

  // En yüksek karbon etkisi yapan kategori
  const highest = [...filteredBreakdown].sort((a, b) => b.estimatedKgCo2 - a.estimatedKgCo2)[0];
  const highestImpactCategory = highest && highest.estimatedKgCo2 > 0 ? highest : undefined;

  // Genel etki seviyesi
  const impactLevel = getCarbonImpactLevel(totalEstimatedKgCo2);

  // Öneri mantığı
  const recommendations: string[] = [];
  const sortedByCarbon = [...filteredBreakdown]
    .filter((item) => item.estimatedKgCo2 > 0)
    .sort((a, b) => b.estimatedKgCo2 - a.estimatedKgCo2);

  if (sortedByCarbon.length > 0) {
    sortedByCarbon.slice(0, 2).forEach((item) => {
      if (item.category === "ulasim") {
        recommendations.push("Ulaşım harcamalarında toplu taşıma/planlı rota tercihi karbon etkisini azaltabilir.");
      } else if (item.category === "market") {
        recommendations.push("Market harcamalarında israfı azaltmak ve planlı alışveriş yapmak ESG etkisini iyileştirebilir.");
      } else if (item.category === "fatura") {
        recommendations.push("Enerji ve fatura harcamalarında tüketim takibi karbon etkisini düşürmeye yardımcı olabilir.");
      } else if (item.category === "eglence") {
        recommendations.push("Eğlence ve sosyal aktivitelerde çevre dostu ve yerel etkinlikleri tercih etmeniz karbon ayak izinizi azaltacaktır.");
      } else {
        recommendations.push(`${item.label} harcamalarında tüketim sıklığını azaltmak karbon salınımınızı düşürmeye yardımcı olabilir.`);
      }
    });
  }

  // En az 3 öneri garantile
  if (recommendations.length < 3) {
    recommendations.push("Genel harcama alışkanlıklarınızda yerel ve sürdürülebilir markaları tercih etmek çevresel etkiyi azaltır.");
  }
  if (recommendations.length < 3) {
    recommendations.push("Gereksiz abonelik ve tüketim kalemlerini sınırlandırarak hem bütçenizi hem de karbon ayak izinizi koruyabilirsiniz.");
  }
  recommendations.push(
    "Bu analiz demo katsayılara dayanır; gerçek ESG raporu yerine eğitim amaçlı gösterge olarak değerlendirilmelidir."
  );

  const impactLevelLabel = impactLevel === "dusuk" ? "Düşük" : impactLevel === "orta" ? "Orta" : "Yüksek";
  const summary = `Seçili dönemde yaptığınız ${formatCurrencyTRY(
    totalExpenseAnalyzed
  )} tutarındaki harcamanın tahmini karbon ayak izi etkisi ${formatKgCo2(
    totalEstimatedKgCo2
  )} olarak hesaplanmıştır. Genel etki seviyeniz "${impactLevelLabel}" düzeyindedir.`;

  const methodologyNote =
    "Kategori bazlı demo katsayılar kullanılmıştır; gerçek karbon ayak izi ölçümü değildir. Hesaplamalar harcama tutarının 1000'e bölünmesi ve kategori katsayısıyla çarpılmasıyla elde edilmiştir. Düşük etki <= 50kg, Orta etki <= 150kg ve Yüksek etki > 150kg olarak kabul edilmiştir.";

  const disclaimer =
    "Bu panelde sunulan karbon salınım verileri ve öneriler akademik/demo amaçlı tahmini göstergelerdir. Resmi bir karbon muhasebesi, denetim raporu veya yatırım tavsiyesi niteliği taşımaz.";

  const dataSourceLabel = "FinWise Demo Akademik ESG Göstergeleri";

  return {
    totalExpenseAnalyzed,
    totalEstimatedKgCo2,
    highestImpactCategory,
    categoryBreakdown: filteredBreakdown,
    impactLevel,
    summary,
    recommendations,
    methodologyNote,
    disclaimer,
    dataSourceLabel,
  };
}

export function summarizeCarbonFootprintForCopilot(result: CarbonFootprintResult) {
  return {
    available: true,
    totalEstimatedKgCo2: Number(result.totalEstimatedKgCo2.toFixed(1)),
    highestImpactCategory: result.highestImpactCategory?.label ?? "Yok",
    impactLevel: result.impactLevel === "dusuk" ? "düşük" : result.impactLevel === "orta" ? "orta" : "yüksek",
    summary: result.summary,
    route: "/esg-carbon" as const,
  };
}
