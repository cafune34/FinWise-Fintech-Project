import type { Budget, Transaction, TransactionCategory } from "@/types/finance";

const ALL_CATEGORIES: TransactionCategory[] = [
  "market",
  "ulasim",
  "fatura",
  "egitim",
  "eglence",
  "saglik",
  "kira",
  "maas",
  "transfer",
  "yatirim",
  "diger",
];

export type SeasonalFactorMap = Partial<Record<TransactionCategory, number>>;

export type CategoryForecast = {
  category: TransactionCategory;
  currentMonthExpense: number;
  nextMonthForecast: number;
  budgetLimit: number | null;
  expectedOverrun: number;
  riskStatus: "budget_risk" | "normal";
  seasonalFactor: number;
  threeMonthAverage: number;
};

const DEFAULT_SEASONAL_FACTORS: Record<TransactionCategory, number> = {
  market: 1.04,
  ulasim: 1.02,
  fatura: 1.08,
  egitim: 1.03,
  eglence: 1.06,
  saglik: 1.05,
  kira: 1.0,
  maas: 1.0,
  transfer: 1.01,
  yatirim: 1.02,
  diger: 1.02,
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthKeys(referenceDate: Date, monthCount: number): string[] {
  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (monthCount - 1 - index), 1);

    return monthKey(monthDate);
  });
}

function roundToCurrency(value: number): number {
  return Number(value.toFixed(2));
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

export function getMonthlyCategoryExpenses(
  transactions: Transaction[],
  referenceDate: Date = new Date(),
  monthCount = 3
): Record<TransactionCategory, number[]> {
  const safeMonthCount = Math.max(1, monthCount);
  const targetMonthKeys = getMonthKeys(referenceDate, safeMonthCount);
  const monthIndexByKey = new Map(targetMonthKeys.map((key, index) => [key, index]));

  const monthlyByCategory = ALL_CATEGORIES.reduce<Record<TransactionCategory, number[]>>((acc, category) => {
    acc[category] = Array.from({ length: safeMonthCount }, () => 0);

    return acc;
  }, {} as Record<TransactionCategory, number[]>);

  transactions.forEach((transaction) => {
    if (transaction.direction !== "out") {
      return;
    }

    const key = monthKey(new Date(transaction.occurredAt));
    const monthIndex = monthIndexByKey.get(key);

    if (monthIndex === undefined) {
      return;
    }

    monthlyByCategory[transaction.category][monthIndex] += transaction.amount;
  });

  return monthlyByCategory;
}

export function forecastNextMonthCategoryExpense(
  category: TransactionCategory,
  monthlySeries: Record<TransactionCategory, number[]>,
  seasonalFactor: number = DEFAULT_SEASONAL_FACTORS[category]
): number {
  const values = monthlySeries[category] ?? [];

  if (values.length === 0) {
    return 0;
  }

  const threeMonths = values.slice(-3);
  const average = threeMonths.reduce((sum, value) => sum + value, 0) / threeMonths.length;

  return roundToCurrency(Math.max(0, average * seasonalFactor));
}

export function forecastAllCategories(
  transactions: Transaction[],
  budgets: Budget[],
  options?: {
    referenceDate?: Date;
    monthCount?: number;
    seasonalFactors?: SeasonalFactorMap;
  }
): CategoryForecast[] {
  const referenceDate = options?.referenceDate ?? new Date();
  const monthCount = options?.monthCount ?? 3;
  const seasonalFactors = { ...DEFAULT_SEASONAL_FACTORS, ...(options?.seasonalFactors ?? {}) };
  const monthlyCategoryExpenses = getMonthlyCategoryExpenses(transactions, referenceDate, monthCount);
  const budgetLimitByCategory = new Map(budgets.map((budget) => [budget.category, budget.limit]));

  return ALL_CATEGORIES.map((category) => {
    const seasonalFactor = seasonalFactors[category] ?? 1;
    const currentMonthExpense = roundToCurrency(
      transactions
        .filter((transaction) => transaction.direction === "out" && transaction.category === category)
        .filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate))
        .reduce((sum, transaction) => sum + transaction.amount, 0)
    );
    const nextMonthForecast = forecastNextMonthCategoryExpense(category, monthlyCategoryExpenses, seasonalFactor);
    const budgetLimit = budgetLimitByCategory.get(category) ?? null;
    const expectedOverrun = budgetLimit === null ? 0 : roundToCurrency(Math.max(0, nextMonthForecast - budgetLimit));
    const riskStatus = expectedOverrun > 0 ? "budget_risk" : "normal";
    const threeMonthValues = monthlyCategoryExpenses[category].slice(-3);
    const threeMonthAverage =
      threeMonthValues.length > 0
        ? roundToCurrency(threeMonthValues.reduce((sum, value) => sum + value, 0) / threeMonthValues.length)
        : 0;

    return {
      category,
      currentMonthExpense,
      nextMonthForecast,
      budgetLimit,
      expectedOverrun,
      riskStatus,
      seasonalFactor,
      threeMonthAverage,
    };
  });
}

export function getRiskyForecastCategories(
  forecasts: CategoryForecast[],
  limit?: number
): CategoryForecast[] {
  const risky = forecasts
    .filter((forecast) => forecast.riskStatus === "budget_risk")
    .sort((a, b) => {
      if (b.expectedOverrun !== a.expectedOverrun) {
        return b.expectedOverrun - a.expectedOverrun;
      }

      return b.nextMonthForecast - a.nextMonthForecast;
    });

  return typeof limit === "number" ? risky.slice(0, limit) : risky;
}

