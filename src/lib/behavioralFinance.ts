import { categoryLabels } from "@/lib/labels";
import { calculateTotalBalance } from "@/lib/finance";
import type { FinanceSnapshot } from "@/lib/storage";
import type { Transaction, TransactionCategory } from "@/types/finance";

export type BehavioralBiasType =
  | "present_bias"
  | "mental_accounting"
  | "anchoring_bias"
  | "loss_aversion"
  | "overconfidence";

export type BehavioralRiskLevel = "dusuk" | "orta" | "yuksek";

export type BehavioralInsight = {
  id: string;
  type: BehavioralBiasType;
  title: string;
  description: string;
  evidence: string;
  riskLevel: BehavioralRiskLevel;
  recommendation: string;
  affectedCategories?: string[];
  metric?: {
    label: string;
    value: string;
  };
};

export type BehavioralInsightSummary = {
  total: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  dominantBias: BehavioralBiasType | null;
  dominantBiasLabel: string;
  topBiases: string[];
  summary: string;
};

const DISCRETIONARY_CATEGORIES = new Set<TransactionCategory>([
  "eglence",
  "diger",
  "egitim",
  "market",
  "ulasim",
]);

const ESSENTIAL_OR_PROTECTIVE_CATEGORIES = new Set<TransactionCategory>([
  "fatura",
  "saglik",
  "kira",
  "transfer",
]);

const RISKY_MOVEMENT_CATEGORIES = new Set<TransactionCategory>(["yatirim", "transfer"]);

const REQUIRED_INSIGHT_ORDER: BehavioralBiasType[] = [
  "present_bias",
  "mental_accounting",
  "anchoring_bias",
  "loss_aversion",
  "overconfidence",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function round(value: number, digits = 1): number {
  return Number(value.toFixed(digits));
}

function safeDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY));
}

function getReferenceDate(transactions: Transaction[]): Date {
  const dates = transactions
    .map((transaction) => safeDate(transaction.occurredAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ?? new Date();
}

function isOutflow(transaction: Transaction): boolean {
  return transaction.direction === "out" || transaction.type === "gider" || transaction.type === "transfer";
}

function isIncome(transaction: Transaction): boolean {
  return transaction.direction === "in" || transaction.type === "gelir" || transaction.category === "maas";
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = safeDate(dateValue);
  if (!date) return false;

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function formatRatio(value: number): string {
  return `${round(value, 1)}x`;
}

function formatPercent(value: number): string {
  return `${round(value, 1)}%`;
}

function categoryLabel(category: TransactionCategory): string {
  return categoryLabels[category] ?? category;
}

function riskFromRatio(ratio: number): BehavioralRiskLevel {
  if (ratio >= 2.3) return "yuksek";
  if (ratio >= 1.7) return "orta";
  return "dusuk";
}

function createMonitoringInsight(type: BehavioralBiasType): BehavioralInsight {
  const labels = getBehavioralBiasLabel(type);

  return {
    id: `${type}-monitoring`,
    type,
    title: `${labels} izleme sinyali`,
    description: "Bu alanda belirgin bir davranissal risk sinyali olusmadi.",
    evidence: "Mevcut veride guclu risk sinyali yok; duzenli takip onerilir.",
    riskLevel: "dusuk",
    recommendation: getMonitoringRecommendation(type),
    metric: {
      label: "Durum",
      value: "Izleme",
    },
  };
}

function getMonitoringRecommendation(type: BehavioralBiasType): string {
  const recommendations: Record<BehavioralBiasType, string> = {
    present_bias: "Istege bagli harcamalari haftalik limitlerle izlemeye devam edin.",
    mental_accounting: "Gelir geldigi gun birikim ve zorunlu odeme paylarini ayirmayi surdurun.",
    anchoring_bias: "Kategori limitlerini aylik yerine haftalik alt hedeflerle de kontrol edin.",
    loss_aversion: "Yuksek tutarli zorunlu odemeler icin ayri bir tampon fon planlayin.",
    overconfidence: "Yatirim ve transfer kararlarinda ust limit ve ikinci kontrol kuralini koruyun.",
  };

  return recommendations[type];
}

function analyzePresentBias(transactions: Transaction[], referenceDate: Date): BehavioralInsight | null {
  const discretionaryOutflows = transactions.filter(
    (transaction) => isOutflow(transaction) && DISCRETIONARY_CATEGORIES.has(transaction.category)
  );

  if (discretionaryOutflows.length === 0) return null;

  const last7Start = new Date(referenceDate.getTime() - 7 * MS_PER_DAY);
  const last30Start = new Date(referenceDate.getTime() - 30 * MS_PER_DAY);

  const last7Total = discretionaryOutflows
    .filter((transaction) => {
      const date = safeDate(transaction.occurredAt);
      return date ? date > last7Start && date <= referenceDate : false;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const baselineTransactions = discretionaryOutflows.filter((transaction) => {
    const date = safeDate(transaction.occurredAt);
    return date ? date > last30Start && date <= referenceDate : false;
  });

  const baselineTotal = baselineTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const baselineDailyAverage = baselineTotal > 0 ? baselineTotal / 30 : 0;
  const recentDailyAverage = last7Total / 7;

  if (baselineDailyAverage <= 0) return null;

  const ratio = recentDailyAverage / baselineDailyAverage;
  if (ratio < 1.3) return null;

  const affectedCategories = Array.from(
    new Set(
      discretionaryOutflows
        .filter((transaction) => {
          const date = safeDate(transaction.occurredAt);
          return date ? date > last7Start && date <= referenceDate : false;
        })
        .map((transaction) => categoryLabel(transaction.category))
    )
  );

  return {
    id: "present-bias-spending-spike",
    type: "present_bias",
    title: "Anlik harcama egilimi",
    description: "Son donemde istege bagli harcama temposu genel ortalamanin uzerine cikti.",
    evidence: `Son 7 gunluk istege bagli harcama gunluk ortalamanin ${formatRatio(ratio)} seviyesinde.`,
    riskLevel: riskFromRatio(ratio),
    recommendation: "Buyuk harcamalarda 24 saat bekleme kurali uygulayin.",
    affectedCategories,
    metric: {
      label: "Son 7 gun / ortalama",
      value: formatRatio(ratio),
    },
  };
}

function analyzeMentalAccounting(transactions: Transaction[]): BehavioralInsight | null {
  const incomes = transactions
    .filter(isIncome)
    .map((transaction) => ({ transaction, date: safeDate(transaction.occurredAt) }))
    .filter((item): item is { transaction: Transaction; date: Date } => Boolean(item.date));

  if (incomes.length === 0) return null;

  const outflows = transactions
    .filter(isOutflow)
    .map((transaction) => ({ transaction, date: safeDate(transaction.occurredAt) }))
    .filter((item): item is { transaction: Transaction; date: Date } => Boolean(item.date));

  if (outflows.length === 0) return null;

  const postIncomeWindows = incomes.map(({ date }) => ({
    start: date.getTime(),
    end: date.getTime() + 3 * MS_PER_DAY,
  }));

  const postIncomeTotal = postIncomeWindows.reduce((sum, window) => {
    const windowTotal = outflows
      .filter(({ date }) => date.getTime() > window.start && date.getTime() <= window.end)
      .reduce((total, { transaction }) => total + transaction.amount, 0);

    return sum + windowTotal;
  }, 0);

  const firstOutflow = outflows.reduce((oldest, current) => (current.date < oldest.date ? current : oldest));
  const lastOutflow = outflows.reduce((latest, current) => (current.date > latest.date ? current : latest));
  const spanDays = Math.max(1, daysBetween(firstOutflow.date, lastOutflow.date) + 1);
  const normalThreeDayAverage =
    (outflows.reduce((sum, { transaction }) => sum + transaction.amount, 0) / spanDays) * 3;
  const postIncomeAverage = postIncomeTotal / incomes.length;

  if (normalThreeDayAverage <= 0) return null;

  const ratio = postIncomeAverage / normalThreeDayAverage;
  if (ratio < 1.2) return null;

  return {
    id: "mental-accounting-post-income-spend",
    type: "mental_accounting",
    title: "Maas sonrasi harcama artisi",
    description: "Gelir girisinden hemen sonra harcama hacmi normal uc gunluk ortalamanin uzerine cikiyor.",
    evidence: `Gelir girislerinden sonraki 3 gunde harcama normal donemin ${formatRatio(ratio)} seviyesinde.`,
    riskLevel: ratio >= 2 ? "yuksek" : ratio >= 1.4 ? "orta" : "dusuk",
    recommendation: "Maas geldigi gun otomatik birikim veya butce kilidi kurali kullanin.",
    metric: {
      label: "Maas sonrasi tempo",
      value: formatRatio(ratio),
    },
  };
}

function analyzeAnchoringBias(snapshot: FinanceSnapshot, referenceDate: Date): BehavioralInsight | null {
  const monthlyCategorySpend = new Map<TransactionCategory, number>();
  const historicalCategorySpend = new Map<TransactionCategory, number>();

  snapshot.transactions.filter(isOutflow).forEach((transaction) => {
    const current = isSameMonth(transaction.occurredAt, referenceDate)
      ? monthlyCategorySpend
      : historicalCategorySpend;

    current.set(transaction.category, (current.get(transaction.category) ?? 0) + transaction.amount);
  });

  const candidates = snapshot.budgets
    .map((budget) => {
      const spent = monthlyCategorySpend.get(budget.category) ?? budget.spent ?? 0;
      const usagePercent = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
      const historicalSpend = historicalCategorySpend.get(budget.category) ?? 0;
      const historicalMonths = Math.max(1, new Set(
        snapshot.transactions
          .filter((transaction) => isOutflow(transaction) && transaction.category === budget.category)
          .map((transaction) => {
            const date = safeDate(transaction.occurredAt);
            return date ? `${date.getFullYear()}-${date.getMonth()}` : "";
          })
          .filter(Boolean)
      ).size - 1);
      const historicalAverage = historicalSpend / historicalMonths;
      const aboveHistory = historicalAverage > 0 ? spent / historicalAverage : 0;

      return {
        budget,
        spent,
        usagePercent,
        aboveHistory,
      };
    })
    .filter((item) => item.usagePercent >= 80 || item.aboveHistory >= 1.25)
    .sort((a, b) => Math.max(b.usagePercent, b.aboveHistory * 100) - Math.max(a.usagePercent, a.aboveHistory * 100));

  const candidate = candidates[0];
  if (!candidate) return null;

  const label = categoryLabel(candidate.budget.category);
  const riskLevel =
    candidate.usagePercent >= 100 || candidate.aboveHistory >= 1.8
      ? "yuksek"
      : candidate.usagePercent >= 90 || candidate.aboveHistory >= 1.4
        ? "orta"
        : "dusuk";

  return {
    id: `anchoring-${candidate.budget.category}`,
    type: "anchoring_bias",
    title: "Gecmis harcama referansi riski",
    description: `${label} kategorisinde eski ortalamaya guvenmek mevcut limit kullanimini perdeleyebilir.`,
    evidence: `${label} kategorisi limitin ${formatPercent(candidate.usagePercent)} seviyesine ulasti.`,
    riskLevel,
    recommendation: "Kategori limitini haftalik alt limite bolerek takip edin.",
    affectedCategories: [label],
    metric: {
      label: "Butce kullanimi",
      value: formatPercent(candidate.usagePercent),
    },
  };
}

function analyzeLossAversion(transactions: Transaction[]): BehavioralInsight | null {
  const outflows = transactions.filter(isOutflow);
  const totalOutflow = outflows.reduce((sum, transaction) => sum + transaction.amount, 0);
  if (totalOutflow <= 0) return null;

  const essentialOutflows = outflows.filter((transaction) => ESSENTIAL_OR_PROTECTIVE_CATEGORIES.has(transaction.category));
  const essentialTotal = essentialOutflows.reduce((sum, transaction) => sum + transaction.amount, 0);
  const largestEssential = essentialOutflows.reduce<Transaction | null>(
    (largest, transaction) => (!largest || transaction.amount > largest.amount ? transaction : largest),
    null
  );

  const essentialShare = (essentialTotal / totalOutflow) * 100;
  const largestShare = largestEssential ? (largestEssential.amount / totalOutflow) * 100 : 0;

  if (essentialShare < 55 && largestShare < 22) return null;

  const riskLevel =
    essentialShare >= 70 || largestShare >= 35
      ? "yuksek"
      : essentialShare >= 60 || largestShare >= 28
        ? "orta"
        : "dusuk";

  return {
    id: "loss-aversion-large-protective-outflows",
    type: "loss_aversion",
    title: "Zorunlu odeme baskisi",
    description: "Yuksek tutarli zorunlu veya risk azaltici odemeler nakit akisinda baski olusturuyor olabilir.",
    evidence: largestEssential
      ? `Tekil yuksek tutarli ${categoryLabel(largestEssential.category)} islemi toplam cikislarin ${formatPercent(largestShare)} payini olusturuyor.`
      : `Zorunlu kategoriler toplam cikislarin ${formatPercent(essentialShare)} payini olusturuyor.`,
    riskLevel,
    recommendation: "Yuksek tutarli zorunlu odemeler icin ayri acil durum/fatura fonu plani olusturun.",
    affectedCategories: Array.from(new Set(essentialOutflows.map((transaction) => categoryLabel(transaction.category)))),
    metric: {
      label: "Zorunlu pay",
      value: formatPercent(essentialShare),
    },
  };
}

function analyzeOverconfidence(snapshot: FinanceSnapshot): BehavioralInsight | null {
  const outflows = snapshot.transactions.filter(isOutflow);
  const totalOutflow = outflows.reduce((sum, transaction) => sum + transaction.amount, 0);
  if (totalOutflow <= 0) return null;

  const riskyMovements = outflows.filter((transaction) => RISKY_MOVEMENT_CATEGORIES.has(transaction.category));
  const riskyTotal = riskyMovements.reduce((sum, transaction) => sum + transaction.amount, 0);
  const riskyShare = (riskyTotal / totalOutflow) * 100;
  const totalBalance = calculateTotalBalance(snapshot.accounts);
  const balanceShare = totalBalance > 0 ? (riskyTotal / totalBalance) * 100 : 0;
  const referenceDate = getReferenceDate(snapshot.transactions);
  const last7Start = new Date(referenceDate.getTime() - 7 * MS_PER_DAY);
  const recentRiskyCount = riskyMovements.filter((transaction) => {
    const date = safeDate(transaction.occurredAt);
    return date ? date > last7Start && date <= referenceDate : false;
  }).length;

  if (riskyShare < 25 && balanceShare < 20 && recentRiskyCount < 3) return null;

  const riskLevel =
    riskyShare >= 45 || balanceShare >= 40 || recentRiskyCount >= 5
      ? "yuksek"
      : riskyShare >= 32 || balanceShare >= 28 || recentRiskyCount >= 3
        ? "orta"
        : "dusuk";

  return {
    id: "overconfidence-risky-movement-density",
    type: "overconfidence",
    title: "Riskli transfer/yatirim yogunlugu",
    description: "Yatirim ve transfer hareketleri toplam cikislar icinde belirgin bir paya ulasiyor.",
    evidence: `Yatirim ve transfer islemleri toplam cikislarin ${formatPercent(riskyShare)} payini olusturuyor.`,
    riskLevel,
    recommendation: "Yuksek tutarli yatirim/transfer kararlarinda ust limit ve ikinci kontrol kurali belirleyin.",
    affectedCategories: Array.from(new Set(riskyMovements.map((transaction) => categoryLabel(transaction.category)))),
    metric: {
      label: "Riskli hareket payi",
      value: formatPercent(riskyShare),
    },
  };
}

export function analyzeBehavioralFinance(snapshot: FinanceSnapshot): BehavioralInsight[] {
  const referenceDate = getReferenceDate(snapshot.transactions);
  const detectedInsights = [
    analyzePresentBias(snapshot.transactions, referenceDate),
    analyzeMentalAccounting(snapshot.transactions),
    analyzeAnchoringBias(snapshot, referenceDate),
    analyzeLossAversion(snapshot.transactions),
    analyzeOverconfidence(snapshot),
  ].filter((insight): insight is BehavioralInsight => Boolean(insight));

  const insightTypes = new Set(detectedInsights.map((insight) => insight.type));
  const completedInsights = [...detectedInsights];

  for (const type of REQUIRED_INSIGHT_ORDER) {
    if (completedInsights.length >= 3) break;
    if (!insightTypes.has(type)) {
      completedInsights.push(createMonitoringInsight(type));
      insightTypes.add(type);
    }
  }

  return completedInsights;
}

export function summarizeBehavioralInsights(insights: BehavioralInsight[]): BehavioralInsightSummary {
  const highRiskCount = insights.filter((insight) => insight.riskLevel === "yuksek").length;
  const mediumRiskCount = insights.filter((insight) => insight.riskLevel === "orta").length;
  const lowRiskCount = insights.filter((insight) => insight.riskLevel === "dusuk").length;
  const sortedByRisk = [...insights].sort((a, b) => riskWeight(b.riskLevel) - riskWeight(a.riskLevel));
  const dominantBias = sortedByRisk[0]?.type ?? null;
  const topBiases = sortedByRisk.slice(0, 3).map((insight) => getBehavioralBiasLabel(insight.type));

  return {
    total: insights.length,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    dominantBias,
    dominantBiasLabel: dominantBias ? getBehavioralBiasLabel(dominantBias) : "Belirgin degil",
    topBiases,
    summary:
      highRiskCount > 0
        ? `${highRiskCount} yuksek riskli davranissal sinyal one cikiyor.`
        : mediumRiskCount > 0
          ? `${mediumRiskCount} orta riskli davranissal sinyal takip edilmeli.`
          : "Guclu davranissal risk sinyali yok; duzenli takip onerilir.",
  };
}

function riskWeight(level: BehavioralRiskLevel): number {
  if (level === "yuksek") return 3;
  if (level === "orta") return 2;
  return 1;
}

export function getBehavioralRiskLabel(level: BehavioralRiskLevel): string {
  const labels: Record<BehavioralRiskLevel, string> = {
    dusuk: "Dusuk",
    orta: "Orta",
    yuksek: "Yuksek",
  };

  return labels[level];
}

export function getBehavioralBiasLabel(type: BehavioralBiasType): string {
  const labels: Record<BehavioralBiasType, string> = {
    present_bias: "Present Bias",
    mental_accounting: "Mental Accounting",
    anchoring_bias: "Anchoring Bias",
    loss_aversion: "Loss Aversion",
    overconfidence: "Overconfidence",
  };

  return labels[type];
}
