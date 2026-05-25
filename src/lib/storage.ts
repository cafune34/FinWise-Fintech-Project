import {
  mockAccounts,
  mockBudgets,
  mockPaymentOrders,
  mockTransactions,
  mockUser,
} from "@/data/mockData";
import type {
  BankAccount,
  Budget,
  PaymentOrder,
  RoboProfileResult,
  Transaction,
} from "@/types/finance";

export const FINWISE_STORAGE_KEY = "finwise:v2:sprint7";
const STORAGE_VERSION = 1;

export type FinanceSnapshot = {
  version: number;
  user: typeof mockUser;
  accounts: BankAccount[];
  transactions: Transaction[];
  budgets: Budget[];
  paymentOrders: PaymentOrder[];
  roboResults: RoboProfileResult[];
  updatedAt: string;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((transaction) => ({
    ...transaction,
    type: transaction.type ?? (transaction.category === "transfer" ? "transfer" : transaction.direction === "in" ? "gelir" : "gider"),
  }));
}

function normalizeAccounts(accounts: BankAccount[]): BankAccount[] {
  return accounts.map((account) => ({
    ...account,
    accountName: account.accountName ?? account.bankName,
  }));
}

function normalizePaymentOrders(paymentOrders: PaymentOrder[]): PaymentOrder[] {
  return paymentOrders.map((order) => ({
    ...order,
    createdAt: order.createdAt ?? `${order.dueDate}T09:00:00.000Z`,
    referenceNumber: order.referenceNumber ?? order.id.toUpperCase(),
    paymentType: order.paymentType ?? "fatura",
  }));
}

export function createSeedSnapshot(): FinanceSnapshot {
  return {
    version: STORAGE_VERSION,
    user: clone(mockUser),
    accounts: normalizeAccounts(clone(mockAccounts)),
    transactions: normalizeTransactions(clone(mockTransactions)),
    budgets: clone(mockBudgets),
    paymentOrders: normalizePaymentOrders(clone(mockPaymentOrders)),
    roboResults: [],
    updatedAt: new Date().toISOString(),
  };
}

function isFinanceSnapshot(value: unknown): value is FinanceSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<FinanceSnapshot>;

  return (
    Array.isArray(candidate.accounts) &&
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.budgets) &&
    Array.isArray(candidate.paymentOrders) &&
    Array.isArray(candidate.roboResults)
  );
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readFinanceSnapshot(): FinanceSnapshot {
  const seed = createSeedSnapshot();

  if (!canUseStorage()) {
    return seed;
  }

  try {
    const stored = window.localStorage.getItem(FINWISE_STORAGE_KEY);

    if (!stored) {
      writeFinanceSnapshot(seed);
      return seed;
    }

    const parsed = JSON.parse(stored) as unknown;

    if (!isFinanceSnapshot(parsed)) {
      writeFinanceSnapshot(seed);
      return seed;
    }

    return {
      ...seed,
      ...parsed,
      accounts: normalizeAccounts(parsed.accounts),
      transactions: normalizeTransactions(parsed.transactions),
      paymentOrders: normalizePaymentOrders(parsed.paymentOrders),
      roboResults: parsed.roboResults ?? [],
      updatedAt: parsed.updatedAt ?? seed.updatedAt,
    };
  } catch {
    writeFinanceSnapshot(seed);
    return seed;
  }
}

export function writeFinanceSnapshot(snapshot: FinanceSnapshot): FinanceSnapshot {
  const nextSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  if (canUseStorage()) {
    window.localStorage.setItem(FINWISE_STORAGE_KEY, JSON.stringify(nextSnapshot));
  }

  return nextSnapshot;
}

export function resetFinanceSnapshot(): FinanceSnapshot {
  const seed = createSeedSnapshot();

  if (canUseStorage()) {
    window.localStorage.removeItem(FINWISE_STORAGE_KEY);
  }

  return writeFinanceSnapshot(seed);
}
