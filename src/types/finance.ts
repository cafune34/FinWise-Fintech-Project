export type TransactionCategory =
  | "market"
  | "ulasim"
  | "fatura"
  | "egitim"
  | "eglence"
  | "saglik"
  | "kira"
  | "maas"
  | "transfer"
  | "yatirim"
  | "diger";

export type RiskProfile = "dusuk" | "orta" | "yuksek";

export type RoboAnswerOption = {
  value: string;
  label: string;
  score: 1 | 2 | 3;
};

export type RoboQuestion = {
  id: string;
  question: string;
  options: RoboAnswerOption[];
};

export type RoboAnswer = {
  questionId: string;
  selectedValue: string;
  score: number;
};

export type PortfolioAllocation = {
  asset: string;
  percentage: number;
};

export type PaymentType = "fatura" | "transfer" | "abonelik";

export type TransactionType = "gelir" | "gider" | "transfer";

export type User = {
  id: string;
  fullName: string;
  email: string;
  riskProfile: RiskProfile;
  createdAt: string;
};

export type BankAccount = {
  id: string;
  userId: string;
  bankName: string;
  accountName?: string;
  iban: string;
  balance: number;
  currency: "TRY";
  type: "vadesiz" | "birikim";
  isMock?: true;
};

export type Transaction = {
  id: string;
  accountId: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  direction: "in" | "out";
  type?: TransactionType;
  occurredAt: string;
  description?: string;
  isMock?: true;
};

export type Budget = {
  id: string;
  userId: string;
  category: TransactionCategory;
  limit: number;
  spent: number;
  period: "aylik";
};

export type PaymentOrder = {
  id: string;
  userId: string;
  payee: string;
  amount: number;
  dueDate: string;
  status: "planlandi" | "isleme_alindi" | "beklemede" | "tamamlandi" | "reddedildi";
  paymentType?: PaymentType;
  sourceAccountId?: string;
  referenceNumber?: string;
  description?: string;
  createdAt?: string;
  isMock?: true;
};

export type RoboProfileResult = {
  id: string;
  score: number;
  profile: RiskProfile;
  allocation: PortfolioAllocation[];
  answers: RoboAnswer[];
  analyzedAt: string;
};

export type RegTechSeverity = "high" | "medium" | "low";

export type RegTechRuleCode =
  | "LARGE_TRANSACTION"
  | "MONTHLY_EXPENSE_OVER_INCOME"
  | "BUDGET_EXCEEDED"
  | "TRANSFER_DENSITY"
  | "NIGHT_HIGH_AMOUNT"
  | "REPEATING_MERCHANT";

export type RegTechAlert = {
  id: string;
  userId: string;
  transactionId?: string;
  level: RiskProfile;
  severity?: RegTechSeverity;
  ruleCode?: RegTechRuleCode;
  title?: string;
  reason: string;
  createdAt: string;
  resolved: boolean;
};

