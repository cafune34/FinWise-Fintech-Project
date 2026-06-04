import type { FinanceSnapshot } from "@/lib/storage";
import type { Transaction, TransactionCategory } from "@/types/finance";
import { calculateAvailableAssets, analyzeEmergencyFund } from "@/lib/emergencyFund";
import { categoryLabels } from "@/lib/labels";

export type ScenarioType =
  | "one_time_expense"
  | "monthly_recurring_expense"
  | "extra_income"
  | "rent_increase"
  | "subscription"
  | "debt_installment";

export type ScenarioRiskLevel =
  | "dusuk"
  | "orta"
  | "yuksek"
  | "kritik";

export type ScenarioInput = {
  type: ScenarioType;
  title: string;
  amount: number;
  category: string;
  months?: number;
  note?: string;
};

export type ScenarioSimulationResult = {
  scenario: ScenarioInput;
  currentBalance: number;
  simulatedBalance: number;
  balanceDelta: number;
  currentMonthlyIncome: number;
  currentMonthlyExpense: number;
  simulatedMonthlyIncome: number;
  simulatedMonthlyExpense: number;
  currentNetCashFlow: number;
  simulatedNetCashFlow: number;
  netCashFlowDelta: number;
  budgetImpact: {
    category: string;
    currentSpent: number;
    limit?: number;
    simulatedSpent: number;
    usageBefore?: number;
    usageAfter?: number;
    status: string;
  };
  emergencyFundImpact: {
    currentCompletion: number;
    simulatedCompletion: number;
    targetAmount: number;
    missingAmountAfterScenario: number;
    statusLabel: string;
  };
  finWiseScoreImpact: {
    before: number;
    after: number;
    delta: number;
  };
  riskLevel: ScenarioRiskLevel;
  summary: string;
  recommendations: string[];
  warnings: string[];
  disclaimer: string;
};

const DISCLAIMER = "Bu simülasyon gerçek verilerinizi değiştirmez; yatırım tavsiyesi değildir.";

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function roundPercent(value: number): number {
  return Number(value.toFixed(1));
}

function getReferenceDate(transactions: Transaction[]): Date {
  const dates = transactions
    .map((t) => (t.occurredAt ? new Date(t.occurredAt) : null))
    .filter((d): d is Date => d !== null && !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0] ?? new Date();
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

export function getScenarioTypeLabel(type: ScenarioType): string {
  const labels: Record<ScenarioType, string> = {
    one_time_expense: "Tek Seferlik Harcama",
    monthly_recurring_expense: "Aylık Tekrar Eden Gider",
    extra_income: "Ek Gelir",
    rent_increase: "Kira Artışı",
    subscription: "Abonelik Ekleme",
    debt_installment: "Borç/Taksit Ekleme",
  };
  return labels[type];
}

export function calculateScenarioBaseMetrics(snapshot: FinanceSnapshot) {
  const currentBalance = calculateAvailableAssets(snapshot);
  const refDate = getReferenceDate(snapshot.transactions);
  const startDate = new Date(refDate.getTime() - 30 * 24 * 60 * 60 * 1000);

  let recentTransactions = snapshot.transactions.filter((txn) => {
    const d = txn.occurredAt ? new Date(txn.occurredAt) : null;
    return d && d > startDate && d <= refDate;
  });

  if (recentTransactions.length === 0) {
    recentTransactions = snapshot.transactions;
  }

  const currentMonthlyIncome = recentTransactions
    .filter((txn) => txn.direction === "in" || txn.type === "gelir")
    .reduce((sum, txn) => sum + txn.amount, 0);

  const currentMonthlyExpense = recentTransactions
    .filter((txn) => txn.direction === "out" || txn.type === "gider" || txn.type === "transfer")
    .reduce((sum, txn) => sum + txn.amount, 0);

  return {
    currentBalance: roundMoney(currentBalance),
    currentMonthlyIncome: roundMoney(currentMonthlyIncome),
    currentMonthlyExpense: roundMoney(currentMonthlyExpense),
    currentNetCashFlow: roundMoney(currentMonthlyIncome - currentMonthlyExpense),
  };
}

export function applyScenarioToMetrics(metrics: ReturnType<typeof calculateScenarioBaseMetrics>, scenario: ScenarioInput) {
  const amount = scenario.amount;
  const isIncome = scenario.type === "extra_income";

  let simulatedBalance = metrics.currentBalance;
  let simulatedMonthlyIncome = metrics.currentMonthlyIncome;
  let simulatedMonthlyExpense = metrics.currentMonthlyExpense;

  if (isIncome) {
    simulatedBalance += amount;
    simulatedMonthlyIncome += amount;
  } else {
    simulatedBalance -= amount;
    simulatedMonthlyExpense += amount;
  }

  const balanceDelta = roundMoney(simulatedBalance - metrics.currentBalance);
  const simulatedNetCashFlow = roundMoney(simulatedMonthlyIncome - simulatedMonthlyExpense);
  const netCashFlowDelta = roundMoney(simulatedNetCashFlow - metrics.currentNetCashFlow);

  return {
    simulatedBalance: roundMoney(simulatedBalance),
    balanceDelta,
    simulatedMonthlyIncome: roundMoney(simulatedMonthlyIncome),
    simulatedMonthlyExpense: roundMoney(simulatedMonthlyExpense),
    simulatedNetCashFlow,
    netCashFlowDelta,
  };
}

export function calculateBudgetImpact(snapshot: FinanceSnapshot, scenario: ScenarioInput) {
  const isIncome = scenario.type === "extra_income";
  const expenseImpact = isIncome ? 0 : scenario.amount;
  const category = scenario.category as TransactionCategory;

  const budget = snapshot.budgets.find((b) => b.category === category);
  
  const referenceDate = new Date();
  const currentSpent = snapshot.transactions
    .filter((txn) => txn.type === "gider")
    .filter((txn) => txn.category === category)
    .filter((txn) => {
      const d = txn.occurredAt ? new Date(txn.occurredAt) : null;
      return d && d.getFullYear() === referenceDate.getFullYear() && d.getMonth() === referenceDate.getMonth();
    })
    .reduce((sum, txn) => sum + txn.amount, 0);

  if (!budget) {
    return {
      category,
      currentSpent: roundMoney(currentSpent),
      limit: undefined,
      simulatedSpent: roundMoney(currentSpent + expenseImpact),
      usageBefore: undefined,
      usageAfter: undefined,
      status: "Bu kategori için bütçe limiti bulunmuyor.",
    };
  }

  const limit = budget.limit;
  const simulatedSpent = currentSpent + expenseImpact;
  const usageBefore = limit > 0 ? (currentSpent / limit) * 100 : 0;
  const usageAfter = limit > 0 ? (simulatedSpent / limit) * 100 : 0;

  let status = "Limit Dahilinde";
  if (usageAfter > 100) {
    status = "Bütçe Aşıldı";
  } else if (usageAfter >= 80) {
    status = "Limite Yakın";
  }

  return {
    category,
    currentSpent: roundMoney(currentSpent),
    limit: roundMoney(limit),
    simulatedSpent: roundMoney(simulatedSpent),
    usageBefore: roundPercent(usageBefore),
    usageAfter: roundPercent(usageAfter),
    status,
  };
}

export function calculateEmergencyFundImpact(snapshot: FinanceSnapshot, scenario: ScenarioInput) {
  const efResult = analyzeEmergencyFund(snapshot);
  const currentCompletion = efResult.completionPercentage;
  const currentAvailableAssets = efResult.currentAvailableAssets;

  let simulatedAvailableAssets = currentAvailableAssets;
  const amount = scenario.amount;

  if (scenario.type === "extra_income") {
    simulatedAvailableAssets += amount;
  } else {
    simulatedAvailableAssets -= amount;
  }
  simulatedAvailableAssets = Math.max(simulatedAvailableAssets, 0);

  const ESSENTIAL_CATEGORIES = new Set<TransactionCategory>(["kira", "fatura", "market", "ulasim", "saglik"]);
  const category = scenario.category as TransactionCategory;
  const isEssential = ESSENTIAL_CATEGORIES.has(category);

  let simulatedMonthlyEssentialExpense = efResult.monthlyEssentialExpense;
  const isRecurring = scenario.type !== "one_time_expense";

  if (isRecurring && isEssential && scenario.type !== "extra_income") {
    simulatedMonthlyEssentialExpense += amount;
  }

  const simulatedTargetAmount = roundMoney(simulatedMonthlyEssentialExpense * 3);
  const simulatedCompletion = simulatedTargetAmount > 0 ? (simulatedAvailableAssets / simulatedTargetAmount) * 100 : 0;
  const missingAmountAfterScenario = roundMoney(Math.max(simulatedTargetAmount - simulatedAvailableAssets, 0));

  let statusLabel = "Kritik";
  if (simulatedCompletion >= 100) statusLabel = "Güçlü";
  else if (simulatedCompletion >= 67) statusLabel = "İyi";
  else if (simulatedCompletion >= 34) statusLabel = "Geliştirilmeli";

  return {
    currentCompletion: roundPercent(currentCompletion),
    simulatedCompletion: roundPercent(simulatedCompletion),
    targetAmount: roundMoney(simulatedTargetAmount),
    missingAmountAfterScenario,
    statusLabel,
  };
}

export function calculateFinWiseScoreImpact(snapshot: FinanceSnapshot, result: Partial<ScenarioSimulationResult>) {
  const getBalancePoints = (bal: number) => {
    if (bal > 50000) return 25;
    if (bal > 20000) return 20;
    if (bal > 5000) return 15;
    return 10;
  };

  const getCashFlowPoints = (flow: number) => {
    if (flow > 10000) return 25;
    if (flow > 0) return 20;
    return 10;
  };

  const getEFPoints = (completion: number) => {
    if (completion >= 100) return 25;
    if (completion >= 67) return 20;
    if (completion >= 34) return 15;
    return 5;
  };

  const getBudgetPoints = (excCount: number) => {
    if (excCount === 0) return 25;
    if (excCount === 1) return 18;
    if (excCount === 2) return 12;
    return 5;
  };

  // Exceeded budgets before
  const referenceDate = new Date();
  const exceededBefore = snapshot.budgets.filter((b) => {
    const spent = snapshot.transactions
      .filter((t) => t.type === "gider" && t.category === b.category)
      .filter((t) => {
        const d = t.occurredAt ? new Date(t.occurredAt) : null;
        return d && d.getFullYear() === referenceDate.getFullYear() && d.getMonth() === referenceDate.getMonth();
      })
      .reduce((sum, t) => sum + t.amount, 0);
    return spent > b.limit;
  }).length;

  const beforeBalancePts = getBalancePoints(result.currentBalance ?? 0);
  const beforeFlowPts = getCashFlowPoints(result.currentNetCashFlow ?? 0);
  const beforeEFPts = getEFPoints(result.emergencyFundImpact?.currentCompletion ?? 0);
  const beforeBudgetPts = getBudgetPoints(exceededBefore);

  const scoreBefore = Math.min(100, Math.max(0, beforeBalancePts + beforeFlowPts + beforeEFPts + beforeBudgetPts));

  const afterBalancePts = getBalancePoints(result.simulatedBalance ?? 0);
  const afterFlowPts = getCashFlowPoints(result.simulatedNetCashFlow ?? 0);
  const afterEFPts = getEFPoints(result.emergencyFundImpact?.simulatedCompletion ?? 0);

  let exceededAfter = exceededBefore;
  if (result.budgetImpact && result.budgetImpact.limit !== undefined) {
    const wasExceeded = (result.budgetImpact.currentSpent ?? 0) > (result.budgetImpact.limit ?? 0);
    const isExceededNow = (result.budgetImpact.simulatedSpent ?? 0) > (result.budgetImpact.limit ?? 0);
    if (!wasExceeded && isExceededNow) {
      exceededAfter += 1;
    } else if (wasExceeded && !isExceededNow) {
      exceededAfter = Math.max(0, exceededAfter - 1);
    }
  }
  const afterBudgetPts = getBudgetPoints(exceededAfter);

  let riskPenalty = 0;
  if (result.riskLevel === "kritik") riskPenalty = 10;
  else if (result.riskLevel === "yuksek") riskPenalty = 5;

  const scoreAfter = Math.min(100, Math.max(0, afterBalancePts + afterFlowPts + afterEFPts + afterBudgetPts - riskPenalty));

  return {
    before: Math.round(scoreBefore),
    after: Math.round(scoreAfter),
    delta: Math.round(scoreAfter - scoreBefore),
  };
}

export function getScenarioRiskLevel(
  simulatedNetCashFlow: number,
  simulatedBalance: number,
  usageAfter: number | undefined,
  simulatedEFCompletion: number,
  scenario: ScenarioInput,
  currentBalance: number
): ScenarioRiskLevel {
  if (simulatedEFCompletion < 33) {
    return "kritik";
  }
  if (simulatedNetCashFlow < -10000) {
    return "kritik";
  }
  if (simulatedNetCashFlow < 0) {
    return "yuksek";
  }
  if (simulatedBalance < 1000) {
    return "yuksek";
  }
  if (usageAfter !== undefined && usageAfter > 100) {
    return "yuksek";
  }
  if (scenario.type === "one_time_expense" && scenario.amount > currentBalance * 0.5) {
    return "yuksek";
  }
  if (scenario.type === "extra_income") {
    return "dusuk";
  }
  if (scenario.amount > currentBalance * 0.2) {
    return "orta";
  }
  return "dusuk";
}

export function getScenarioRecommendations(result: {
  scenario: ScenarioInput;
  simulatedBalance: number;
  simulatedNetCashFlow: number;
  budgetImpact: ReturnType<typeof calculateBudgetImpact>;
  emergencyFundImpact: ReturnType<typeof calculateEmergencyFundImpact>;
  riskLevel: ScenarioRiskLevel;
}): { recommendations: string[]; warnings: string[] } {
  const recommendations: string[] = [];
  const warnings: string[] = [];
  const { scenario, simulatedBalance, simulatedNetCashFlow, budgetImpact, emergencyFundImpact, riskLevel } = result;

  if (riskLevel === "kritik") {
    warnings.push("Kritik Risk Seviyesi: Bu senaryo finansal güvenliğinizi tehlikeye atabilir.");
  }
  if (simulatedBalance < 0) {
    warnings.push("Bakiye Yetersiz: Simülasyon sonrasında toplam bakiyeniz negatife düşmektedir.");
    recommendations.push("Harcamayı ertelemeyi veya alternatif bir finansman kaynağı bulmayı düşünün.");
  }
  if (simulatedNetCashFlow < 0) {
    warnings.push("Negatif Nakit Akışı: Aylık giderleriniz gelirlerinizi aşıyor.");
    recommendations.push("Nakit akışını düzeltmek için diğer kategorilerdeki isteğe bağlı harcamaları azaltın.");
  }
  if (budgetImpact && budgetImpact.limit !== undefined && budgetImpact.simulatedSpent > budgetImpact.limit) {
    const categoryLabel = categoryLabels[budgetImpact.category as TransactionCategory] || budgetImpact.category;
    warnings.push(`${categoryLabel} kategorisinde bütçe sınırı aşılmaktadır.`);
    recommendations.push("İlgili kategorideki bütçe limitinizi artırmayı veya bu alandaki harcamaları kısıtlamayı planlayın.");
  }
  if (emergencyFundImpact.simulatedCompletion < emergencyFundImpact.currentCompletion) {
    warnings.push("Acil durum fonu tamamlanma oranı düşmektedir.");
    recommendations.push("Acil durum fonunu güçlendirmek amacıyla aylık tasarruf oranınızı artırın.");
  }

  if (scenario.type === "extra_income") {
    recommendations.push("Ek gelirin bir kısmını acil durum fonuna aktararak finansal tamponunuzu artırın.");
    recommendations.push("Kalan tutarı yatırım veya borç kapatma için değerlendirebilirsiniz.");
  } else {
    if (scenario.type === "subscription") {
      recommendations.push("Aboneliği başlatmadan önce deneme süresini değerlendirin ve aktif kullanmayacaksanız iptal edin.");
    }
    if (scenario.type === "debt_installment") {
      recommendations.push("Taksit ödemelerinin aylık nakit akışınıza getireceği yükü yakından izleyin.");
    }
  }

  if (recommendations.length < 2) {
    recommendations.push("Aylık harcamalarınızı düzenli takip ederek bütçe dengenizi koruyun.");
    recommendations.push("FinWise Copilot üzerinden kişisel finansal tavsiyeler alabilirsiniz.");
  }

  return { recommendations, warnings };
}

export function summarizeScenarioForCopilot(result: ScenarioSimulationResult): string {
  const isIncome = result.scenario.type === "extra_income";
  const directionText = isIncome ? "artış" : "azalış";
  return `Kullanıcı, ${formatCurrencyTRY(result.scenario.amount)} tutarında bir ${getScenarioTypeLabel(result.scenario.type)} senaryosu simüle etti. Simülasyon sonucunda toplam bakiye ${formatCurrencyTRY(result.simulatedBalance)} (${directionText}), aylık net nakit akışı ise ${formatCurrencyTRY(result.simulatedNetCashFlow)} olarak hesaplandı. Risk seviyesi: ${result.riskLevel.toUpperCase()}.`;
}

export function simulateScenario(snapshot: FinanceSnapshot, scenario: ScenarioInput): ScenarioSimulationResult {
  const baseMetrics = calculateScenarioBaseMetrics(snapshot);
  const simulatedMetrics = applyScenarioToMetrics(baseMetrics, scenario);
  const budgetImpact = calculateBudgetImpact(snapshot, scenario);
  const emergencyFundImpact = calculateEmergencyFundImpact(snapshot, scenario);

  const riskLevel = getScenarioRiskLevel(
    simulatedMetrics.simulatedNetCashFlow,
    simulatedMetrics.simulatedBalance,
    budgetImpact.usageAfter,
    emergencyFundImpact.simulatedCompletion,
    scenario,
    baseMetrics.currentBalance
  );

  const partialResult = {
    scenario,
    currentBalance: baseMetrics.currentBalance,
    simulatedBalance: simulatedMetrics.simulatedBalance,
    balanceDelta: simulatedMetrics.balanceDelta,
    currentMonthlyIncome: baseMetrics.currentMonthlyIncome,
    currentMonthlyExpense: baseMetrics.currentMonthlyExpense,
    simulatedMonthlyIncome: simulatedMetrics.simulatedMonthlyIncome,
    simulatedMonthlyExpense: simulatedMetrics.simulatedMonthlyExpense,
    currentNetCashFlow: baseMetrics.currentNetCashFlow,
    simulatedNetCashFlow: simulatedMetrics.simulatedNetCashFlow,
    netCashFlowDelta: simulatedMetrics.netCashFlowDelta,
    budgetImpact,
    emergencyFundImpact,
    riskLevel,
  };

  const scoreImpact = calculateFinWiseScoreImpact(snapshot, partialResult);
  const { recommendations, warnings } = getScenarioRecommendations(partialResult);

  return {
    ...partialResult,
    finWiseScoreImpact: scoreImpact,
    recommendations,
    warnings,
    summary: summarizeScenarioForCopilot({
      ...partialResult,
      finWiseScoreImpact: scoreImpact,
      recommendations,
      warnings,
      summary: "",
      disclaimer: DISCLAIMER,
    }),
    disclaimer: DISCLAIMER,
  };
}
