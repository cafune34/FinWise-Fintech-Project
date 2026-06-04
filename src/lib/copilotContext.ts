import {
  calculateMonthlyExpense,
  calculateMonthlyIncome,
  calculateNetCashFlow,
  calculateTotalBalance,
  getCategoryExpenseTotals,
} from "@/lib/finance";
import { analyzeBehavioralFinance, summarizeBehavioralInsights } from "@/lib/behavioralFinance";
import { categoryLabels } from "@/lib/labels";
import type { FinanceSnapshot } from "@/lib/storage";
import type { Budget, Transaction, TransactionCategory } from "@/types/finance";
import type {
  CopilotBudgetStatus,
  CopilotBudgetSummary,
  CopilotFinanceContext,
  CopilotRiskyTransaction,
} from "@/lib/copilotTypes";

const NEAR_LIMIT_THRESHOLD = 80;
const MAX_TOP_CATEGORIES = 5;
const MAX_RISKY_TRANSACTIONS = 8;
const MAX_UPCOMING_PAYMENTS = 5;

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function roundPercent(value: number): number {
  return Number(value.toFixed(1));
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = new Date(dateValue);

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function calculateBudgetSpent(budget: Budget, transactions: Transaction[], referenceDate: Date): number {
  return transactions
    .filter((transaction) => transaction.type === "gider")
    .filter((transaction) => transaction.category === budget.category)
    .filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function getBudgetStatus(spent: number, limit: number): CopilotBudgetStatus {
  if (spent > limit) return "exceeded";
  if (limit > 0 && (spent / limit) * 100 >= NEAR_LIMIT_THRESHOLD) return "near_limit";
  return "healthy";
}

function buildBudgetSummaries(
  budgets: Budget[],
  transactions: Transaction[],
  referenceDate: Date
): CopilotBudgetSummary[] {
  return budgets
    .map((budget) => {
      const spent = roundMoney(calculateBudgetSpent(budget, transactions, referenceDate));
      const usagePercent = budget.limit > 0 ? roundPercent((spent / budget.limit) * 100) : 0;

      return {
        category: budget.category,
        label: categoryLabels[budget.category],
        limit: roundMoney(budget.limit),
        spent,
        remaining: roundMoney(budget.limit - spent),
        usagePercent,
        status: getBudgetStatus(spent, budget.limit),
      };
    })
    .sort((a, b) => b.usagePercent - a.usagePercent);
}

function buildRiskyTransactions(
  transactions: Transaction[],
  riskyBudgets: CopilotBudgetSummary[],
  referenceDate: Date
): CopilotRiskyTransaction[] {
  const riskyCategories = new Set(riskyBudgets.map((budget) => budget.category));
  const monthlyExpenses = transactions
    .filter((transaction) => transaction.direction === "out")
    .filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate));

  const averageExpense =
    monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((sum, transaction) => sum + transaction.amount, 0) / monthlyExpenses.length
      : 0;

  return monthlyExpenses
    .filter((transaction) => riskyCategories.has(transaction.category) || transaction.amount >= averageExpense * 1.5)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, MAX_RISKY_TRANSACTIONS)
    .map((transaction) => {
      const budgetRisk = riskyBudgets.find((budget) => budget.category === transaction.category);
      const reason = budgetRisk
        ? `${budgetRisk.label} bütçesi ${budgetRisk.usagePercent}% kullanımda.`
        : "Aylık ortalamanın üzerinde yüksek tutarlı gider.";

      return {
        title: transaction.title,
        amount: roundMoney(transaction.amount),
        category: transaction.category,
        categoryLabel: categoryLabels[transaction.category],
        occurredAt: transaction.occurredAt,
        reason,
      };
    });
}

export function buildCopilotFinanceContext(
  snapshot: FinanceSnapshot,
  referenceDate: Date = new Date()
): CopilotFinanceContext {
  const activeAccounts = snapshot.accounts.filter((account) => account.status !== "pasif");
  const monthlyIncome = roundMoney(calculateMonthlyIncome(snapshot.transactions, referenceDate));
  const monthlyExpense = roundMoney(calculateMonthlyExpense(snapshot.transactions, referenceDate));
  const budgets = buildBudgetSummaries(snapshot.budgets, snapshot.transactions, referenceDate);
  const exceededBudgets = budgets.filter((budget) => budget.status === "exceeded");
  const nearLimitBudgets = budgets.filter((budget) => budget.status === "near_limit");
  const riskyBudgets = [...exceededBudgets, ...nearLimitBudgets];
  const categoryTotals = getCategoryExpenseTotals(snapshot.transactions, referenceDate);
  const pendingOrders = snapshot.paymentOrders.filter(
    (order) => order.status !== "tamamlandi" && order.status !== "reddedildi"
  );
  const completedOrders = snapshot.paymentOrders.filter((order) => order.status === "tamamlandi");
  const lastRoboResult = [...snapshot.roboResults].sort(
    (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
  )[0];
  const behavioralSummary = summarizeBehavioralInsights(analyzeBehavioralFinance(snapshot));

  return {
    userName: snapshot.user.fullName,
    totalBalance: roundMoney(calculateTotalBalance(activeAccounts)),
    accountCount: activeAccounts.length,
    monthlyIncome,
    monthlyExpense,
    netCashFlow: roundMoney(calculateNetCashFlow(snapshot.transactions, referenceDate)),
    topExpenseCategories: Object.entries(categoryTotals)
      .filter(([category, amount]) => amount > 0 && category !== "maas")
      .map(([category, amount]) => ({
        category: category as TransactionCategory,
        label: categoryLabels[category as TransactionCategory],
        amount: roundMoney(amount),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, MAX_TOP_CATEGORIES),
    budgets,
    exceededBudgets,
    nearLimitBudgets,
    riskyTransactions: buildRiskyTransactions(snapshot.transactions, riskyBudgets, referenceDate),
    paymentOrders: {
      pendingCount: pendingOrders.length,
      completedCount: completedOrders.length,
      pendingTotal: roundMoney(pendingOrders.reduce((sum, order) => sum + order.amount, 0)),
      completedTotal: roundMoney(completedOrders.reduce((sum, order) => sum + order.amount, 0)),
      upcomingPending: pendingOrders
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, MAX_UPCOMING_PAYMENTS)
        .map((order) => ({
          payee: order.payee,
          amount: roundMoney(order.amount),
          dueDate: order.dueDate,
          status: order.status,
        })),
    },
    roboAdvisor: lastRoboResult
      ? {
          profile: lastRoboResult.profile,
          score: lastRoboResult.score,
          analyzedAt: lastRoboResult.analyzedAt,
          allocation: lastRoboResult.allocation.map((item) => ({
            asset: item.asset,
            percentage: item.percentage,
          })),
        }
      : null,
    behavioralInsights: {
      total: behavioralSummary.total,
      highRiskCount: behavioralSummary.highRiskCount,
      mediumRiskCount: behavioralSummary.mediumRiskCount,
      topBiases: behavioralSummary.topBiases,
      summary: behavioralSummary.summary,
    },
    purchasingPower: {
      totalTryAssets: roundMoney(calculateTotalBalance(activeAccounts)),
      note: "Kur bazlı karşılıklar ve demo enflasyon notu /purchasing-power panelinde izlenir.",
      route: "/purchasing-power",
    },
    updatedAt: snapshot.updatedAt,
    generatedAt: new Date().toISOString(),
  };
}
