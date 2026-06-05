import { categoryLabels } from "@/lib/labels";
import type { FinanceSnapshot } from "@/lib/storage";
import type { BankAccount, Transaction, TransactionCategory } from "@/types/finance";

export type EmergencyFundStatus = "kritik" | "gelistirilmeli" | "iyi" | "guclu";

export type EmergencyFundCategoryBreakdown = {
  category: TransactionCategory;
  label: string;
  amount: number;
  percentage: number;
};

export type EmergencyFundResult = {
  monthlyEssentialExpense: number;
  targetMonths: number;
  targetAmount: number;
  currentAvailableAssets: number;
  completionPercentage: number;
  missingAmount: number;
  surplusAmount: number;
  status: EmergencyFundStatus;
  statusLabel: string;
  summary: string;
  categoryBreakdown: EmergencyFundCategoryBreakdown[];
  recommendations: string[];
  metrics: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    essentialExpenseRatio: number;
    activeAccountBalance: number;
    pendingPaymentAmount: number;
  };
  disclaimer: string;
};

export type EmergencyFundCopilotSummary = {
  completionPercentage: number;
  targetAmount: number;
  missingAmount: number;
  statusLabel: string;
  summary: string;
  recommendations: string[];
  route: "/emergency-fund";
};

const ESSENTIAL_CATEGORIES = new Set<TransactionCategory>(["kira", "fatura", "market", "ulasim", "saglik"]);
const TARGET_MONTHS = 3;
const LOOKBACK_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DISCLAIMER =
  "Bu panel yatırım tavsiyesi değildir; eğitim amaçlı finansal analiz prototipidir.";

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function roundPercent(value: number): number {
  return Number(value.toFixed(1));
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator > 0 ? numerator / denominator : 0;
}

function safeDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isIncome(transaction: Transaction): boolean {
  return transaction.direction === "in" || transaction.type === "gelir" || transaction.category === "maas";
}

function isOutflow(transaction: Transaction): boolean {
  return transaction.direction === "out" || transaction.type === "gider" || transaction.type === "transfer";
}

function isEssentialExpense(transaction: Transaction): boolean {
  return isOutflow(transaction) && ESSENTIAL_CATEGORIES.has(transaction.category);
}

function isDedicatedEmergencyFundAccount(account: BankAccount): boolean {
  const name = `${account.accountName ?? ""} ${account.bankName}`.toLocaleLowerCase("tr-TR");
  return name.includes("acil durum");
}

function getReferenceDate(transactions: Transaction[]): Date {
  const dates = transactions
    .map((transaction) => safeDate(transaction.occurredAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime());

  return dates[0] ?? new Date();
}

function getRecentEssentialTransactions(snapshot: FinanceSnapshot): Transaction[] {
  const referenceDate = getReferenceDate(snapshot.transactions);
  const startDate = new Date(referenceDate.getTime() - LOOKBACK_DAYS * MS_PER_DAY);
  const recent = snapshot.transactions.filter((transaction) => {
    const date = safeDate(transaction.occurredAt);
    return date ? isEssentialExpense(transaction) && date > startDate && date <= referenceDate : false;
  });

  if (recent.length > 0) {
    return recent;
  }

  return snapshot.transactions.filter(isEssentialExpense);
}

export function calculateMonthlyEssentialExpense(snapshot: FinanceSnapshot): number {
  return roundMoney(getRecentEssentialTransactions(snapshot).reduce((sum, transaction) => sum + transaction.amount, 0));
}

export function calculateEmergencyFundTarget(monthlyEssentialExpense: number, months = TARGET_MONTHS): number {
  return roundMoney(monthlyEssentialExpense * months);
}

export function calculateAvailableAssets(snapshot: FinanceSnapshot): number {
  return roundMoney(
    snapshot.accounts
      .filter((account) => account.status !== "pasif")
      .filter((account) => account.currency === "TRY")
      .filter((account) => account.balance > 0)
      .filter(isDedicatedEmergencyFundAccount)
      .reduce((sum, account) => sum + account.balance, 0)
  );
}

export function buildEmergencyFundCategoryBreakdown(snapshot: FinanceSnapshot): EmergencyFundCategoryBreakdown[] {
  const transactions = getRecentEssentialTransactions(snapshot);
  const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  return Array.from(ESSENTIAL_CATEGORIES)
    .map((category) => {
      const amount = roundMoney(
        transactions
          .filter((transaction) => transaction.category === category)
          .reduce((sum, transaction) => sum + transaction.amount, 0)
      );

      return {
        category,
        label: categoryLabels[category],
        amount,
        percentage: roundPercent(safeRatio(amount, total) * 100),
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getEmergencyFundStatus(completionPercentage: number): EmergencyFundStatus {
  if (completionPercentage >= 100) return "guclu";
  if (completionPercentage >= 67) return "iyi";
  if (completionPercentage >= 34) return "gelistirilmeli";
  return "kritik";
}

export function getEmergencyFundStatusLabel(status: EmergencyFundStatus): string {
  const labels: Record<EmergencyFundStatus, string> = {
    kritik: "Kritik",
    gelistirilmeli: "Geliştirilmeli",
    iyi: "İyi",
    guclu: "Güçlü",
  };

  return labels[status];
}

export function analyzeEmergencyFund(snapshot: FinanceSnapshot): EmergencyFundResult {
  const monthlyEssentialExpense = calculateMonthlyEssentialExpense(snapshot);
  const targetAmount = calculateEmergencyFundTarget(monthlyEssentialExpense);
  const currentAvailableAssets = calculateAvailableAssets(snapshot);
  const completionPercentage = targetAmount > 0 ? roundPercent((currentAvailableAssets / targetAmount) * 100) : 0;
  const missingAmount = roundMoney(Math.max(targetAmount - currentAvailableAssets, 0));
  const surplusAmount = roundMoney(Math.max(currentAvailableAssets - targetAmount, 0));
  const status = getEmergencyFundStatus(completionPercentage);
  const categoryBreakdown = buildEmergencyFundCategoryBreakdown(snapshot);
  const totalIncome = roundMoney(snapshot.transactions.filter(isIncome).reduce((sum, transaction) => sum + transaction.amount, 0));
  const totalExpense = roundMoney(snapshot.transactions.filter(isOutflow).reduce((sum, transaction) => sum + transaction.amount, 0));
  const pendingPaymentAmount = roundMoney(
    snapshot.paymentOrders
      .filter((order) => order.status !== "tamamlandi" && order.status !== "reddedildi")
      .reduce((sum, order) => sum + order.amount, 0)
  );
  const metrics = {
    totalIncome,
    totalExpense,
    netCashFlow: roundMoney(totalIncome - totalExpense),
    essentialExpenseRatio: roundPercent(safeRatio(monthlyEssentialExpense, totalExpense) * 100),
    activeAccountBalance: currentAvailableAssets,
    pendingPaymentAmount,
  };

  const result: EmergencyFundResult = {
    monthlyEssentialExpense,
    targetMonths: TARGET_MONTHS,
    targetAmount,
    currentAvailableAssets,
    completionPercentage,
    missingAmount,
    surplusAmount,
    status,
    statusLabel: getEmergencyFundStatusLabel(status),
    summary: buildSummary(status, completionPercentage, missingAmount, surplusAmount),
    categoryBreakdown,
    recommendations: buildRecommendations(completionPercentage, metrics, categoryBreakdown),
    metrics,
    disclaimer: DISCLAIMER,
  };

  return result;
}

export function summarizeEmergencyFundForCopilot(result: EmergencyFundResult): EmergencyFundCopilotSummary {
  return {
    completionPercentage: result.completionPercentage,
    targetAmount: result.targetAmount,
    missingAmount: result.missingAmount,
    statusLabel: result.statusLabel,
    summary: result.summary,
    recommendations: result.recommendations.slice(0, 3),
    route: "/emergency-fund",
  };
}

export function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 1,
  }).format(value) + "%";
}

function buildSummary(
  status: EmergencyFundStatus,
  completionPercentage: number,
  missingAmount: number,
  surplusAmount: number
): string {
  if (status === "guclu") {
    return `3 aylık güvenlik fonu hedefi karşılanmış durumda. Hedefin üzerinde ${formatCurrencyTRY(
      surplusAmount
    )} tampon bulunuyor.`;
  }

  return `3 aylık güvenlik fonu hedefinin ${formatPercent(
    completionPercentage
  )} kadarı hazır. Hedefe ulaşmak için ${formatCurrencyTRY(missingAmount)} ek tampon gerekiyor.`;
}

function buildRecommendations(
  completionPercentage: number,
  metrics: EmergencyFundResult["metrics"],
  categoryBreakdown: EmergencyFundCategoryBreakdown[]
): string[] {
  const recommendations: string[] = [];
  const dominantCategory = categoryBreakdown.find((item) => item.amount > 0);

  if (completionPercentage >= 100) {
    recommendations.push("3 aylık güvenlik fonu hedefi karşılanmış; fonu ayrı ve kolay erişilebilir bir hesapta korumayı değerlendirin.");
  } else if (completionPercentage < 34) {
    recommendations.push("Önce 1 aylık temel gider kadar mini güvenlik fonu hedefleyin.");
  } else {
    recommendations.push("Eksik tutarı aylık küçük parçalara bölerek güvenlik fonunu düzenli büyütün.");
  }

  if (metrics.pendingPaymentAmount > 0) {
    recommendations.push("Bekleyen ödemeleri güvenlik fonundan ayrı takip edin.");
  }

  if (metrics.netCashFlow > 0) {
    recommendations.push("Pozitif nakit akışının bir bölümünü otomatik acil durum fonuna ayırın.");
  } else {
    recommendations.push("Nakit akışı negatife döndüğünde yeni harcamalardan önce sabit giderleri gözden geçirin.");
  }

  if (dominantCategory && ["kira", "fatura"].includes(dominantCategory.category)) {
    recommendations.push("Kira ve fatura gibi sabit giderleri ayrı alt hedeflerde izleyin.");
  } else {
    recommendations.push("Temel gider kategorilerini aylık olarak kontrol edip beklenmeyen artışları erken yakalayın.");
  }

  return recommendations.slice(0, 4);
}
