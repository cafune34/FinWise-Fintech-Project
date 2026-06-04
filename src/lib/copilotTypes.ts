import type { PaymentOrder, RiskProfile, TransactionCategory } from "@/types/finance";

export const COPILOT_DISCLAIMER =
  "Bu yanıt yatırım tavsiyesi değildir; eğitim amaçlı finansal analizdir.";

export type CopilotMessageSource = "gemini" | "fallback";

export type CopilotTopExpenseCategory = {
  category: TransactionCategory;
  label: string;
  amount: number;
};

export type CopilotBudgetStatus = "exceeded" | "near_limit" | "healthy";

export type CopilotBudgetSummary = {
  category: TransactionCategory;
  label: string;
  limit: number;
  spent: number;
  remaining: number;
  usagePercent: number;
  status: CopilotBudgetStatus;
};

export type CopilotRiskyTransaction = {
  title: string;
  amount: number;
  category: TransactionCategory;
  categoryLabel: string;
  occurredAt: string;
  reason: string;
};

export type CopilotPaymentSummary = {
  pendingCount: number;
  completedCount: number;
  pendingTotal: number;
  completedTotal: number;
  upcomingPending: Array<{
    payee: string;
    amount: number;
    dueDate: string;
    status: PaymentOrder["status"];
  }>;
};

export type CopilotRoboAdvisorSummary = {
  profile: RiskProfile;
  score: number;
  analyzedAt: string;
  allocation: Array<{
    asset: string;
    percentage: number;
  }>;
} | null;

export type CopilotBehavioralInsightsSummary = {
  total: number;
  highRiskCount: number;
  mediumRiskCount: number;
  topBiases: string[];
  summary: string;
};

export type CopilotPurchasingPowerSummary = {
  totalTryAssets: number;
  note: string;
  route: "/purchasing-power";
};

export type CopilotFinanceContext = {
  userName: string;
  totalBalance: number;
  accountCount: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  topExpenseCategories: CopilotTopExpenseCategory[];
  budgets: CopilotBudgetSummary[];
  exceededBudgets: CopilotBudgetSummary[];
  nearLimitBudgets: CopilotBudgetSummary[];
  riskyTransactions: CopilotRiskyTransaction[];
  paymentOrders: CopilotPaymentSummary;
  roboAdvisor: CopilotRoboAdvisorSummary;
  behavioralInsights: CopilotBehavioralInsightsSummary;
  purchasingPower: CopilotPurchasingPowerSummary;
  updatedAt: string;
  generatedAt: string;
};

export type CopilotRequestBody = {
  question: string;
  context: CopilotFinanceContext;
};

export type CopilotResponseBody = {
  answer: string;
  source: CopilotMessageSource;
  disclaimer: string;
};
