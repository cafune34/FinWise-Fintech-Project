import { categoryLabels } from "@/lib/labels";
import type { FinanceSnapshot } from "@/lib/storage";
import type { Transaction } from "@/types/finance";

export type SpendingHeatmapIntensity = "none" | "low" | "medium" | "high" | "extreme";

export type SpendingHeatmapDay = {
  date: string;
  dayLabel: string;
  amount: number;
  transactionCount: number;
  intensity: SpendingHeatmapIntensity;
  categories: string[];
  topCategory?: string;
  formattedAmount: string;
};

export type SpendingHeatmapResult = {
  days: SpendingHeatmapDay[];
  totalSpent: number;
  averageDailySpend: number;
  activeSpendingDays: number;
  zeroSpendDays: number;
  highestSpendDay?: SpendingHeatmapDay;
  currentPeriodLabel: string;
  intensityLegend: {
    label: string;
    intensity: SpendingHeatmapIntensity;
    minAmount: number;
    maxAmount?: number;
  }[];
  summary: string;
  insights: string[];
  recommendations: string[];
  disclaimer: string;
};

function formatCurrencyTRY(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} TL`;
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

function generateDateRange(referenceDate: Date, days: number): Date[] {
  const dates: Date[] = [];
  const end = new Date(referenceDate);
  end.setHours(12, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTopCategory(transactions: Transaction[]): string | undefined {
  if (transactions.length === 0) return undefined;

  const sums: Record<string, number> = {};
  for (const tx of transactions) {
    sums[tx.category] = (sums[tx.category] || 0) + tx.amount;
  }

  const sorted = Object.entries(sums).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? (categoryLabels[sorted[0][0] as keyof typeof categoryLabels] ?? sorted[0][0]) : undefined;
}

function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

export function buildSpendingHeatmap(snapshot: FinanceSnapshot, daysToAnalyze: number = 90): SpendingHeatmapResult {
  const referenceDate = getReferenceDate(snapshot);
  const dateRange = generateDateRange(referenceDate, daysToAnalyze);
  const startDateStr = toISODateString(dateRange[0]);
  const endDateStr = toISODateString(dateRange[dateRange.length - 1]);

  // Sadece belirtilen tarih aralığında ve gider/out olan işlemler
  const relevantTransactions = snapshot.transactions.filter((tx) => {
    if (tx.direction !== "out" && tx.type !== "gider" && tx.type !== "transfer") return false;
    const d = safeDate(tx.occurredAt);
    if (!d) return false;
    const dStr = toISODateString(d);
    return dStr >= startDateStr && dStr <= endDateStr;
  });

  // Günlere göre grupla
  const groupedByDay: Record<string, Transaction[]> = {};
  for (const tx of relevantTransactions) {
    const d = safeDate(tx.occurredAt);
    if (d) {
      const dStr = toISODateString(d);
      if (!groupedByDay[dStr]) groupedByDay[dStr] = [];
      groupedByDay[dStr].push(tx);
    }
  }

  // Aktif harcama tutarlarını topla ve eşikleri belirle
  const dailyAmounts: number[] = [];
  for (const dateStr of Object.keys(groupedByDay)) {
    const sum = groupedByDay[dateStr].reduce((acc, tx) => acc + tx.amount, 0);
    if (sum > 0) dailyAmounts.push(sum);
  }

  dailyAmounts.sort((a, b) => a - b);
  
  const p33 = getPercentile(dailyAmounts, 33);
  const p66 = getPercentile(dailyAmounts, 66);
  const p90 = getPercentile(dailyAmounts, 90);

  function getIntensity(amount: number): SpendingHeatmapIntensity {
    if (amount <= 0) return "none";
    if (amount <= p33) return "low";
    if (amount <= p66) return "medium";
    if (amount <= p90) return "high";
    return "extreme";
  }

  let totalSpent = 0;
  let activeSpendingDays = 0;

  const days: SpendingHeatmapDay[] = dateRange.map((date) => {
    const dStr = toISODateString(date);
    const dayTransactions = groupedByDay[dStr] || [];
    const amount = dayTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    
    if (amount > 0) {
      totalSpent += amount;
      activeSpendingDays += 1;
    }

    const categories = Array.from(new Set(dayTransactions.map((tx) => categoryLabels[tx.category] ?? tx.category)));
    const topCategory = getTopCategory(dayTransactions);

    const dayObj: SpendingHeatmapDay = {
      date: dStr,
      dayLabel: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" }).format(date),
      amount,
      transactionCount: dayTransactions.length,
      intensity: getIntensity(amount),
      categories,
      topCategory,
      formattedAmount: formatCurrencyTRY(amount),
    };

    return dayObj;
  });

  const validDays = days.filter(d => d.amount > 0);
  const highestSpendDay = validDays.length > 0 
    ? validDays.reduce((max, d) => d.amount > max.amount ? d : max, validDays[0]) 
    : undefined;

  const zeroSpendDays = daysToAnalyze - activeSpendingDays;
  const averageDailySpend = daysToAnalyze > 0 ? totalSpent / daysToAnalyze : 0;

  const intensityLegend = [
    { label: "Yok", intensity: "none" as SpendingHeatmapIntensity, minAmount: 0, maxAmount: 0 },
    { label: "Düşük", intensity: "low" as SpendingHeatmapIntensity, minAmount: 0.01, maxAmount: p33 },
    { label: "Orta", intensity: "medium" as SpendingHeatmapIntensity, minAmount: p33 + 0.01, maxAmount: p66 },
    { label: "Yüksek", intensity: "high" as SpendingHeatmapIntensity, minAmount: p66 + 0.01, maxAmount: p90 },
    { label: "Aşırı", intensity: "extreme" as SpendingHeatmapIntensity, minAmount: p90 + 0.01 },
  ];

  const currentPeriodLabel = `${new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(dateRange[0])} - ${new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(dateRange[dateRange.length - 1])}`;

  const insights: string[] = [
    `İncelenen ${daysToAnalyze} günün ${activeSpendingDays} gününde harcama yapılmış, ${zeroSpendDays} gününde ise harcama yapılmamıştır.`,
    `Günlük ortalama harcama tutarınız ${formatCurrencyTRY(averageDailySpend)} seviyesindedir.`,
  ];

  if (highestSpendDay && highestSpendDay.amount > 0) {
    insights.push(`En yüksek harcama ${highestSpendDay.dayLabel} tarihinde ${highestSpendDay.formattedAmount} ile gerçekleşmiştir.`);
  }

  const recommendations: string[] = [
    "Harcama yapılmayan gün sayısını (sıfır harcama günleri) artırarak birikim hızınızı yükseltebilirsiniz.",
    "Aşırı harcama (koyu renkli) yaptığınız günlerin genellikle hangi kategoriye (örn. fatura, kira, eğlence) ait olduğunu inceleyip bütçe limitlerinizi gözden geçirin.",
    "Günlük ortalamanızı düşürmek için yüksek harcama günlerini haftalara daha dengeli yaymaya çalışın."
  ];

  return {
    days,
    totalSpent,
    averageDailySpend,
    activeSpendingDays,
    zeroSpendDays,
    highestSpendDay: highestSpendDay && highestSpendDay.amount > 0 ? highestSpendDay : undefined,
    currentPeriodLabel,
    intensityLegend,
    summary: `Son ${daysToAnalyze} günde ${activeSpendingDays} gün aktif harcama ile toplam ${formatCurrencyTRY(totalSpent)} harcandı.`,
    insights,
    recommendations,
    disclaimer: "Bu görselleştirme gerçek verilerinizi değiştirmez; eğitim amaçlı finansal analizdir ve yatırım tavsiyesi değildir.",
  };
}
