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
  TransactionCategory,
} from "@/types/finance";

export const FINWISE_STORAGE_KEY = "finwise:v2:sprint7";
const STORAGE_VERSION = 27;

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
  return paymentOrders.map((order) => {
    const ref = order.referenceNumber ?? order.referenceNo ?? order.id.toUpperCase();
    return {
      ...order,
      createdAt: order.createdAt ?? `${order.dueDate}T09:00:00.000Z`,
      referenceNumber: ref,
      referenceNo: ref,
      paymentType: order.paymentType ?? "fatura",
    };
  });
}

export function reconcileCompletedPaymentOrders(snapshot: FinanceSnapshot): FinanceSnapshot {
  const nextTransactions = [...snapshot.transactions];
  const nextAccounts = [...snapshot.accounts];

  const nextOrders = snapshot.paymentOrders.map((order) => {
    if (order.status === "tamamlandi" && !order.postedTransactionId) {
      const txnId = `txn-pay-${order.id}`;

      const exists = nextTransactions.some((t) => t.id === txnId);
      if (!exists) {
        const category = order.paymentType === "fatura" ? "fatura" : order.paymentType === "transfer" ? "transfer" : "eglence";
        const accountId = order.sourceAccountId || (nextAccounts.length > 0 ? nextAccounts[0].id : "");
        
        if (!accountId) return order;

        const newTxn: Transaction = {
          id: txnId,
          accountId: accountId,
          title: `${order.payee} Ödemesi`,
          amount: order.amount,
          category: category as TransactionCategory,
          direction: "out",
          type: "gider",
          occurredAt: order.createdAt || new Date().toISOString(),
          description: order.description || "Geçmiş ödeme talimatı onayı",
        };
        nextTransactions.push(newTxn);

        const accIndex = nextAccounts.findIndex((a) => a.id === accountId);
        if (accIndex !== -1) {
          nextAccounts[accIndex] = {
            ...nextAccounts[accIndex],
            balance: Number((nextAccounts[accIndex].balance - newTxn.amount).toFixed(2)),
          };
        }
      }

      return {
        ...order,
        postedTransactionId: txnId,
      };
    }
    return order;
  });

  return {
    ...snapshot,
    accounts: nextAccounts,
    transactions: nextTransactions,
    paymentOrders: nextOrders,
  };
}

export function createSeedSnapshot(): FinanceSnapshot {
  const base: FinanceSnapshot = {
    version: STORAGE_VERSION,
    user: clone(mockUser),
    accounts: normalizeAccounts(clone(mockAccounts)),
    transactions: normalizeTransactions(clone(mockTransactions)),
    budgets: clone(mockBudgets),
    paymentOrders: normalizePaymentOrders(clone(mockPaymentOrders)),
    roboResults: [],
    updatedAt: new Date().toISOString(),
  };
  return reconcileCompletedPaymentOrders(base);
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

    const baseSnapshot: FinanceSnapshot = {
      ...seed,
      ...parsed,
      accounts: normalizeAccounts(parsed.accounts),
      transactions: normalizeTransactions(parsed.transactions),
      paymentOrders: normalizePaymentOrders(parsed.paymentOrders),
      roboResults: parsed.roboResults ?? [],
      updatedAt: parsed.updatedAt ?? seed.updatedAt,
    };

    return reconcileCompletedPaymentOrders(baseSnapshot);
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
