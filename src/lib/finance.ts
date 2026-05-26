import type { BankAccount, Budget, Transaction, TransactionCategory } from "@/types/finance";

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

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = new Date(dateValue);

  return (
    date.getFullYear() === referenceDate.getFullYear() &&
    date.getMonth() === referenceDate.getMonth()
  );
}

function sortByOccurredAtDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function calculateTotalBalance(accounts: BankAccount[]): number {
  return accounts
    .filter((account) => account.status !== "pasif")
    .reduce((sum, account) => sum + account.balance, 0);
}

export function calculateMonthlyIncome(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): number {
  return transactions
    .filter((txn) => txn.type === "gelir" && isSameMonth(txn.occurredAt, referenceDate))
    .reduce((sum, txn) => sum + txn.amount, 0);
}

export function calculateMonthlyExpense(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): number {
  return transactions
    .filter((txn) => txn.type === "gider" && isSameMonth(txn.occurredAt, referenceDate))
    .reduce((sum, txn) => sum + txn.amount, 0);
}

export function calculateNetCashFlow(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): number {
  return calculateMonthlyIncome(transactions, referenceDate) - calculateMonthlyExpense(transactions, referenceDate);
}

export function getCategoryExpenseTotals(
  transactions: Transaction[],
  referenceDate?: Date
): Record<TransactionCategory, number> {
  const initialTotals = ALL_CATEGORIES.reduce<Record<TransactionCategory, number>>((acc, category) => {
    acc[category] = 0;

    return acc;
  }, {} as Record<TransactionCategory, number>);

  return transactions.reduce((totals, txn) => {
    const inScope = referenceDate ? isSameMonth(txn.occurredAt, referenceDate) : true;

    if (txn.direction === "out" && inScope) {
      totals[txn.category] += txn.amount;
    }

    return totals;
  }, initialTotals);
}

export function filterTransactionsByAccount(
  transactions: Transaction[],
  accountId: string
): Transaction[] {
  return transactions.filter((txn) => txn.accountId === accountId);
}

export function getRecentTransactions(transactions: Transaction[], limit = 8): Transaction[] {
  return sortByOccurredAtDesc(transactions).slice(0, limit);
}

export function calculateBudgetUsagePercent(budget: Pick<Budget, "spent" | "limit">): number {
  if (budget.limit <= 0) {
    return 0;
  }

  return (budget.spent / budget.limit) * 100;
}

export function isBudgetExceeded(budget: Pick<Budget, "spent" | "limit">): boolean {
  return budget.spent > budget.limit;
}
