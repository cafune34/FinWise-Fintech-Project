import { categoryLabels } from "@/lib/labels";
import type { FinanceSnapshot } from "@/lib/storage";
import type { Transaction, TransactionCategory } from "@/types/finance";

export type SpendingDnaProfileId =
  | "balanced_planner"
  | "security_focused"
  | "impulse_spender"
  | "aggressive_investor"
  | "subscription_dependent"
  | "risky_cash_flow";

export type SpendingDnaRiskLevel = "dusuk" | "orta" | "yuksek";

export type SpendingDnaProfileScore = {
  id: SpendingDnaProfileId;
  label: string;
  score: number;
  reason: string;
};

export type SpendingDnaMetrics = {
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  savingsRate: number;
  investmentOutflowRatio: number;
  essentialExpenseRatio: number;
  discretionaryExpenseRatio: number;
  budgetUsageAverage: number;
  pendingPaymentAmount: number;
  highValueTransactionCount: number;
  totalActiveBalance: number;
  assetExpenseRatio: number;
  dominantCategoryRatio: number;
  dominantCategoryLabel: string;
  recentExpensePaceRatio: number;
  paymentOrderCount: number;
  subscriptionLikeSignalCount: number;
  transactionCount: number;
};

export type SpendingDnaResult = {
  primaryProfile: SpendingDnaProfileScore;
  secondaryProfile?: SpendingDnaProfileScore;
  allProfiles: SpendingDnaProfileScore[];
  riskLevel: SpendingDnaRiskLevel;
  summary: string;
  evidence: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  metrics: SpendingDnaMetrics;
  disclaimer: string;
};

export type SpendingDnaCopilotSummary = {
  primaryProfile: string;
  riskLevel: SpendingDnaRiskLevel;
  summary: string;
  recommendations: string[];
  route: "/spending-dna";
};

const DISCLAIMER =
  "Bu analiz finansal teşhis veya yatırım tavsiyesi değildir; eğitim amaçlı finansal kişilik yorumudur.";
const MIN_DATA_TRANSACTION_COUNT = 3;
const RECENT_DAYS = 7;
const BASELINE_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HIGH_VALUE_MIN_AMOUNT = 20000;
const STRONG_SAVINGS_RATE = 0.18;
const HEALTHY_SAVINGS_RATE = 0.08;
const HIGH_BUDGET_USAGE = 0.9;
const MODERATE_BUDGET_USAGE = 0.75;
const HIGH_INVESTMENT_RATIO = 0.35;
const HIGH_DISCRETIONARY_RATIO = 0.35;
const HIGH_ESSENTIAL_RATIO = 0.65;
const STRONG_ASSET_EXPENSE_RATIO = 3;
const SUBSCRIPTION_SIGNAL_MIN_AMOUNT = 250;
const SUBSCRIPTION_SIGNAL_MAX_AMOUNT = 2500;

const ESSENTIAL_CATEGORIES = new Set<TransactionCategory>(["kira", "fatura", "saglik", "ulasim", "market"]);
const DISCRETIONARY_CATEGORIES = new Set<TransactionCategory>(["eglence", "diger", "egitim"]);
const INVESTMENT_CATEGORIES = new Set<TransactionCategory>(["yatirim", "transfer"]);
const SUBSCRIPTION_LIKE_CATEGORIES = new Set<TransactionCategory>(["fatura", "egitim", "eglence"]);

const PROFILE_LABELS: Record<SpendingDnaProfileId, string> = {
  balanced_planner: "Dengeli Planlayıcı",
  security_focused: "Güvenlik Odaklı",
  impulse_spender: "Anlık Harcayıcı",
  aggressive_investor: "Agresif Yatırımcı",
  subscription_dependent: "Abonelik Bağımlısı",
  risky_cash_flow: "Riskli Nakit Akışı",
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

function safeDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = safeDate(dateValue);
  if (!date) return false;

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function getReferenceDate(transactions: Transaction[]): Date {
  const dates = transactions
    .map((transaction) => safeDate(transaction.occurredAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ?? new Date();
}

function isIncome(transaction: Transaction): boolean {
  return transaction.direction === "in" || transaction.type === "gelir" || transaction.category === "maas";
}

function isOutflow(transaction: Transaction): boolean {
  return transaction.direction === "out" || transaction.type === "gider" || transaction.type === "transfer";
}

function formatPercent(value: number): string {
  return `${round(value * 100, 1)}%`;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateRecentExpensePaceRatio(transactions: Transaction[], referenceDate: Date): number {
  const outflows = transactions.filter(isOutflow);
  const recentStart = new Date(referenceDate.getTime() - RECENT_DAYS * MS_PER_DAY);
  const baselineStart = new Date(referenceDate.getTime() - BASELINE_DAYS * MS_PER_DAY);

  const recentTotal = outflows
    .filter((transaction) => {
      const date = safeDate(transaction.occurredAt);
      return date ? date > recentStart && date <= referenceDate : false;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const baselineTotal = outflows
    .filter((transaction) => {
      const date = safeDate(transaction.occurredAt);
      return date ? date > baselineStart && date <= referenceDate : false;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const recentDailyAverage = recentTotal / RECENT_DAYS;
  const baselineDailyAverage = baselineTotal / BASELINE_DAYS;

  return round(safeRatio(recentDailyAverage, baselineDailyAverage), 2);
}

function calculateBudgetUsageAverage(snapshot: FinanceSnapshot, referenceDate: Date): number {
  const usages = snapshot.budgets
    .filter((budget) => budget.limit > 0)
    .map((budget) => {
      const monthlySpent = snapshot.transactions
        .filter(isOutflow)
        .filter((transaction) => transaction.category === budget.category)
        .filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate))
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const spent = monthlySpent > 0 ? monthlySpent : budget.spent;
      return safeRatio(spent, budget.limit);
    });

  if (usages.length === 0) return 0;

  return round(usages.reduce((sum, usage) => sum + usage, 0) / usages.length, 3);
}

export function getSpendingDnaProfileLabel(profileId: SpendingDnaProfileId): string {
  return PROFILE_LABELS[profileId];
}

export function calculateSpendingDnaMetrics(snapshot: FinanceSnapshot): SpendingDnaMetrics {
  const referenceDate = getReferenceDate(snapshot.transactions);
  const monthlyTransactions = snapshot.transactions.filter((transaction) =>
    isSameMonth(transaction.occurredAt, referenceDate)
  );
  const monthlyIncomeTransactions = monthlyTransactions.filter(isIncome);
  const monthlyOutflows = monthlyTransactions.filter(isOutflow);
  const totalIncome = round(monthlyIncomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0));
  const totalExpense = round(monthlyOutflows.reduce((sum, transaction) => sum + transaction.amount, 0));
  const netCashFlow = round(totalIncome - totalExpense);
  const categoryTotals = monthlyOutflows.reduce<Partial<Record<TransactionCategory, number>>>((totals, transaction) => {
    totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
    return totals;
  }, {});
  const dominantCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] as
    | [TransactionCategory, number]
    | undefined;
  const investmentOutflow = monthlyOutflows
    .filter((transaction) => INVESTMENT_CATEGORIES.has(transaction.category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const essentialExpense = monthlyOutflows
    .filter((transaction) => ESSENTIAL_CATEGORIES.has(transaction.category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const discretionaryExpense = monthlyOutflows
    .filter((transaction) => DISCRETIONARY_CATEGORIES.has(transaction.category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const pendingPaymentAmount = snapshot.paymentOrders
    .filter((order) => order.status !== "tamamlandi" && order.status !== "reddedildi")
    .reduce((sum, order) => sum + order.amount, 0);
  const averageOutflow = monthlyOutflows.length > 0 ? totalExpense / monthlyOutflows.length : 0;
  const highValueThreshold = Math.max(HIGH_VALUE_MIN_AMOUNT, averageOutflow * 1.75);
  const highValueTransactionCount = monthlyOutflows.filter(
    (transaction) => transaction.amount >= highValueThreshold
  ).length;
  const totalActiveBalance = snapshot.accounts
    .filter((account) => account.status !== "pasif")
    .reduce((sum, account) => sum + account.balance, 0);
  const subscriptionLikeSignalCount =
    snapshot.paymentOrders.filter((order) => order.paymentType === "abonelik").length +
    monthlyOutflows.filter((transaction) => {
      return (
        SUBSCRIPTION_LIKE_CATEGORIES.has(transaction.category) &&
        transaction.amount >= SUBSCRIPTION_SIGNAL_MIN_AMOUNT &&
        transaction.amount <= SUBSCRIPTION_SIGNAL_MAX_AMOUNT
      );
    }).length;

  return {
    totalIncome,
    totalExpense,
    netCashFlow,
    savingsRate: round(safeRatio(netCashFlow, totalIncome), 3),
    investmentOutflowRatio: round(safeRatio(investmentOutflow, totalExpense), 3),
    essentialExpenseRatio: round(safeRatio(essentialExpense, totalExpense), 3),
    discretionaryExpenseRatio: round(safeRatio(discretionaryExpense, totalExpense), 3),
    budgetUsageAverage: calculateBudgetUsageAverage(snapshot, referenceDate),
    pendingPaymentAmount: round(pendingPaymentAmount),
    highValueTransactionCount,
    totalActiveBalance: round(totalActiveBalance),
    assetExpenseRatio: round(safeRatio(totalActiveBalance, totalExpense), 2),
    dominantCategoryRatio: round(safeRatio(dominantCategory?.[1] ?? 0, totalExpense), 3),
    dominantCategoryLabel: dominantCategory ? categoryLabels[dominantCategory[0]] : "Belirgin değil",
    recentExpensePaceRatio: calculateRecentExpensePaceRatio(snapshot.transactions, referenceDate),
    paymentOrderCount: snapshot.paymentOrders.length,
    subscriptionLikeSignalCount,
    transactionCount: snapshot.transactions.length,
  };
}

export function scoreSpendingDnaProfiles(
  metrics: SpendingDnaMetrics,
  snapshot: FinanceSnapshot
): SpendingDnaProfileScore[] {
  const hasRoboResult = snapshot.roboResults.length > 0;
  const latestRoboProfile = [...snapshot.roboResults].sort(
    (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
  )[0]?.profile;

  const balancedScore =
    30 +
    (metrics.netCashFlow > 0 ? 20 : -10) +
    (metrics.savingsRate >= HEALTHY_SAVINGS_RATE ? 15 : 0) +
    (metrics.budgetUsageAverage > 0 && metrics.budgetUsageAverage <= MODERATE_BUDGET_USAGE ? 15 : 0) +
    (metrics.dominantCategoryRatio <= 0.45 ? 10 : -5) +
    (metrics.investmentOutflowRatio <= HIGH_INVESTMENT_RATIO ? 10 : -5);

  const securityScore =
    28 +
    (metrics.assetExpenseRatio >= STRONG_ASSET_EXPENSE_RATIO ? 25 : metrics.assetExpenseRatio >= 1.5 ? 14 : 0) +
    (metrics.pendingPaymentAmount === 0 ? 14 : metrics.pendingPaymentAmount < metrics.totalExpense * 0.15 ? 8 : -8) +
    (metrics.essentialExpenseRatio <= HIGH_ESSENTIAL_RATIO ? 12 : -10) +
    (metrics.investmentOutflowRatio <= HIGH_INVESTMENT_RATIO ? 12 : -6) +
    (latestRoboProfile === "dusuk" ? 8 : 0);

  const impulseScore =
    18 +
    (metrics.discretionaryExpenseRatio >= HIGH_DISCRETIONARY_RATIO ? 28 : metrics.discretionaryExpenseRatio * 45) +
    (metrics.recentExpensePaceRatio >= 1.35 ? 16 : 0) +
    (metrics.budgetUsageAverage >= HIGH_BUDGET_USAGE ? 18 : metrics.budgetUsageAverage >= MODERATE_BUDGET_USAGE ? 10 : 0) +
    (metrics.dominantCategoryLabel === categoryLabels.eglence || metrics.dominantCategoryLabel === categoryLabels.diger
      ? 8
      : 0);

  const aggressiveScore =
    16 +
    (metrics.investmentOutflowRatio >= HIGH_INVESTMENT_RATIO ? 34 : metrics.investmentOutflowRatio * 70) +
    (metrics.highValueTransactionCount > 0 ? 16 : 0) +
    (metrics.netCashFlow > 0 ? 14 : -8) +
    (hasRoboResult && latestRoboProfile === "yuksek" ? 12 : 0);

  const subscriptionScore =
    14 +
    Math.min(34, metrics.subscriptionLikeSignalCount * 7) +
    (metrics.paymentOrderCount >= 3 ? 16 : metrics.paymentOrderCount >= 1 ? 8 : 0) +
    (metrics.pendingPaymentAmount > 0 ? 8 : 0) +
    (metrics.budgetUsageAverage >= MODERATE_BUDGET_USAGE ? 8 : 0);

  const riskyCashFlowScore =
    18 +
    (metrics.netCashFlow < 0 ? 30 : metrics.savingsRate < HEALTHY_SAVINGS_RATE ? 12 : 0) +
    (metrics.essentialExpenseRatio >= HIGH_ESSENTIAL_RATIO ? 16 : 0) +
    (metrics.pendingPaymentAmount > metrics.totalExpense * 0.2 ? 14 : metrics.pendingPaymentAmount > 0 ? 6 : 0) +
    (metrics.budgetUsageAverage >= HIGH_BUDGET_USAGE ? 14 : metrics.budgetUsageAverage >= MODERATE_BUDGET_USAGE ? 8 : 0) +
    (metrics.highValueTransactionCount >= 2 ? 10 : metrics.highValueTransactionCount === 1 ? 5 : 0);

  const scores: Array<[SpendingDnaProfileId, number, string]> = [
    [
      "balanced_planner",
      balancedScore,
      `Nakit akışı ${metrics.netCashFlow >= 0 ? "pozitif" : "negatif"}, bütçe kullanımı ${formatPercent(
        metrics.budgetUsageAverage
      )} ve baskın kategori payı ${formatPercent(metrics.dominantCategoryRatio)} seviyesinde.`,
    ],
    [
      "security_focused",
      securityScore,
      `Aktif bakiye aylık giderlerin ${metrics.assetExpenseRatio} katı; bekleyen ödeme tutarı ${formatMoney(
        metrics.pendingPaymentAmount
      )}.`,
    ],
    [
      "impulse_spender",
      impulseScore,
      `İsteğe bağlı gider payı ${formatPercent(metrics.discretionaryExpenseRatio)}; son 7 günlük harcama temposu ${metrics.recentExpensePaceRatio}x.`,
    ],
    [
      "aggressive_investor",
      aggressiveScore,
      `Yatırım ve transfer çıkışları toplam giderin ${formatPercent(metrics.investmentOutflowRatio)} kadarını oluşturuyor.`,
    ],
    [
      "subscription_dependent",
      subscriptionScore,
      `Ödeme talimatları ve düzenli küçük/orta giderlerden ${metrics.subscriptionLikeSignalCount} izleme sinyali bulundu.`,
    ],
    [
      "risky_cash_flow",
      riskyCashFlowScore,
      `Net nakit akışı ${formatMoney(metrics.netCashFlow)}; bütçe kullanımı ${formatPercent(
        metrics.budgetUsageAverage
      )}.`,
    ],
  ];

  return scores
    .map(([id, score, reason]) => ({
      id,
      label: getSpendingDnaProfileLabel(id),
      score: Math.round(clamp(score)),
      reason,
    }))
    .sort((a, b) => b.score - a.score);
}

export function getSpendingDnaRiskLevel(
  input: SpendingDnaMetrics | SpendingDnaResult,
  primaryProfileId?: SpendingDnaProfileId,
  primaryProfileScore?: number
): SpendingDnaRiskLevel {
  const metrics = "metrics" in input ? input.metrics : input;

  const isBalanced = primaryProfileId === "balanced_planner";
  const highScore = (primaryProfileScore ?? 0) >= 80;

  if (
    metrics.netCashFlow < 0 ||
    metrics.budgetUsageAverage >= HIGH_BUDGET_USAGE ||
    metrics.pendingPaymentAmount > Math.max(metrics.totalExpense * 0.5, metrics.netCashFlow * 1.5) ||
    primaryProfileId === "risky_cash_flow"
  ) {
    return "yuksek";
  }

  if (isBalanced && highScore) {
    if (
      metrics.pendingPaymentAmount > metrics.totalExpense * 0.25 ||
      metrics.savingsRate < HEALTHY_SAVINGS_RATE ||
      metrics.essentialExpenseRatio >= HIGH_ESSENTIAL_RATIO ||
      metrics.highValueTransactionCount > 0
    ) {
      return "orta";
    }
    return "dusuk";
  }

  if (
    metrics.pendingPaymentAmount > metrics.totalExpense * 0.25 ||
    metrics.savingsRate < HEALTHY_SAVINGS_RATE ||
    metrics.essentialExpenseRatio >= HIGH_ESSENTIAL_RATIO ||
    metrics.highValueTransactionCount > 0 ||
    primaryProfileId === "impulse_spender" ||
    primaryProfileId === "subscription_dependent"
  ) {
    return "orta";
  }

  return "dusuk";
}

export function analyzeSpendingDna(snapshot: FinanceSnapshot): SpendingDnaResult {
  const metrics = calculateSpendingDnaMetrics(snapshot);
  const allProfiles = scoreSpendingDnaProfiles(metrics, snapshot);
  const primaryProfile = allProfiles[0];
  const secondaryProfile = allProfiles[1];
  const riskLevel = getSpendingDnaRiskLevel(metrics, primaryProfile.id, primaryProfile.score);
  const limitedData = metrics.transactionCount < MIN_DATA_TRANSACTION_COUNT;

  return {
    primaryProfile,
    secondaryProfile,
    allProfiles,
    riskLevel,
    summary: buildSummary(primaryProfile, metrics, limitedData),
    evidence: buildEvidence(metrics, limitedData),
    strengths: buildStrengths(metrics),
    weaknesses: buildWeaknesses(metrics),
    recommendations: buildRecommendations(primaryProfile.id, metrics),
    metrics,
    disclaimer: DISCLAIMER,
  };
}

export function summarizeSpendingDnaForCopilot(result: SpendingDnaResult): SpendingDnaCopilotSummary {
  return {
    primaryProfile: result.primaryProfile.label,
    riskLevel: result.riskLevel,
    summary: result.summary,
    recommendations: result.recommendations.slice(0, 3),
    route: "/spending-dna",
  };
}

function buildSummary(
  primaryProfile: SpendingDnaProfileScore,
  metrics: SpendingDnaMetrics,
  limitedData: boolean
): string {
  if (limitedData) {
    return "Veri seti sınırlı olduğu için Harcama DNA’sı güvenli bir başlangıç profiliyle izleniyor.";
  }

  return `${primaryProfile.label} profili öne çıkıyor. Bu seçim net nakit akışı, bütçe kullanımı, kategori yoğunluğu ve yatırım/transfer davranışı birlikte değerlendirilerek yapıldı.`;
}

function buildEvidence(metrics: SpendingDnaMetrics, limitedData: boolean): string[] {
  const evidence = [
    `Net nakit akışı ${formatMoney(metrics.netCashFlow)} ve tasarruf oranı ${formatPercent(metrics.savingsRate)}.`,
    `En baskın kategori ${metrics.dominantCategoryLabel}; toplam gider içindeki payı ${formatPercent(
      metrics.dominantCategoryRatio
    )}.`,
    `Yatırım/transfer çıkış oranı ${formatPercent(metrics.investmentOutflowRatio)}, ortalama bütçe kullanımı ${formatPercent(
      metrics.budgetUsageAverage
    )}.`,
  ];

  if (metrics.pendingPaymentAmount > 0) {
    evidence.push(`Bekleyen ödeme toplamı ${formatMoney(metrics.pendingPaymentAmount)} olarak izleniyor.`);
  }

  if (limitedData) {
    evidence.unshift("İşlem sayısı düşük olduğu için profil yorumu izleme amaçlı ve temkinli üretilmiştir.");
  }

  return evidence.slice(0, 5);
}

function buildStrengths(metrics: SpendingDnaMetrics): string[] {
  const strengths: string[] = [];

  if (metrics.netCashFlow > 0) strengths.push("Gelir-gider farkı pozitif yönde.");
  if (metrics.savingsRate >= STRONG_SAVINGS_RATE) strengths.push("Tasarruf oranı güçlü bir tampon oluşturuyor.");
  if (metrics.assetExpenseRatio >= STRONG_ASSET_EXPENSE_RATIO) strengths.push("Aktif bakiye aylık giderlere göre güçlü.");
  if (metrics.budgetUsageAverage > 0 && metrics.budgetUsageAverage < MODERATE_BUDGET_USAGE) {
    strengths.push("Bütçe kullanımı kontrollü seviyede.");
  }
  if (metrics.dominantCategoryRatio <= 0.45) strengths.push("Giderler tek bir kategoriye aşırı bağımlı görünmüyor.");

  return strengths.length > 0 ? strengths.slice(0, 4) : ["Belirgin güçlü sinyal için daha fazla işlem verisi izlenmeli."];
}

function buildWeaknesses(metrics: SpendingDnaMetrics): string[] {
  const weaknesses: string[] = [];

  if (metrics.netCashFlow < 0) weaknesses.push("Net nakit akışı negatif baskı oluşturuyor.");
  if (metrics.budgetUsageAverage >= HIGH_BUDGET_USAGE) weaknesses.push("Ortalama bütçe kullanımı yüksek seviyede.");
  if (metrics.discretionaryExpenseRatio >= HIGH_DISCRETIONARY_RATIO) {
    weaknesses.push("İsteğe bağlı harcama payı dikkat gerektiriyor.");
  }
  if (metrics.essentialExpenseRatio >= HIGH_ESSENTIAL_RATIO) {
    weaknesses.push("Zorunlu giderlerin toplam gider içindeki payı yüksek.");
  }
  if (metrics.highValueTransactionCount > 0) {
    weaknesses.push("Tekil yüksek tutarlı çıkışlar nakit akışını etkileyebilir.");
  }
  if (metrics.pendingPaymentAmount > 0) weaknesses.push("Bekleyen ödeme talimatları ayrıca takip edilmeli.");

  return weaknesses.length > 0 ? weaknesses.slice(0, 4) : ["Kritik zayıf sinyal bulunmuyor; düzenli takip yeterli."];
}

function buildRecommendations(profileId: SpendingDnaProfileId, metrics: SpendingDnaMetrics): string[] {
  const profileRecommendation: Record<SpendingDnaProfileId, string> = {
    balanced_planner: "Mevcut dengeyi korumak için bütçe limitlerini haftalık alt hedeflerle izleyin.",
    security_focused: "Güvenli nakit tamponunu korurken düşük riskli birikim hedeflerini görünür tutun.",
    impulse_spender: "İsteğe bağlı harcamalarda 24 saat bekleme kuralı ve haftalık limit kullanın.",
    aggressive_investor: "Yatırım ve transfer çıkışları için üst limit ve ikinci kontrol adımı belirleyin.",
    subscription_dependent: "Ödeme talimatlarını ayda bir gözden geçirip kullanılmayan düzenli giderleri kapatın.",
    risky_cash_flow: "Önce zorunlu giderleri ve bekleyen ödemeleri netleştirip nakit akışını pozitife çekin.",
  };
  const recommendations = [profileRecommendation[profileId]];

  if (metrics.netCashFlow < 0) {
    recommendations.push("Negatif nakit akışı kapanana kadar yeni büyük harcamaları erteleyin.");
  } else {
    recommendations.push("Pozitif nakit akışının bir bölümünü otomatik birikim hedefi olarak ayırın.");
  }

  if (metrics.budgetUsageAverage >= MODERATE_BUDGET_USAGE) {
    recommendations.push("Limite yaklaşan bütçelerde kalan tutarı günlük harcama sınırına bölün.");
  } else if (metrics.pendingPaymentAmount > 0) {
    recommendations.push("Bekleyen ödeme tutarını aylık nakit akışıyla karşılaştırarak önceliklendirin.");
  } else {
    recommendations.push("Kategori dağılımını aylık olarak kontrol edip baskın kategori payını düşük tutun.");
  }

  return recommendations.slice(0, 3);
}
