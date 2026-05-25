"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createSeedSnapshot,
  readFinanceSnapshot,
  resetFinanceSnapshot,
  writeFinanceSnapshot,
  type FinanceSnapshot,
} from "@/lib/storage";
import type {
  BankAccount,
  Budget,
  PaymentOrder,
  PaymentType,
  RoboAnswer,
  RoboProfileResult,
  Transaction,
  TransactionCategory,
  TransactionType,
} from "@/types/finance";

type AddTransactionInput = {
  accountId: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  occurredAt: string;
  description?: string;
};

type AddAccountInput = {
  bankName: string;
  accountName: string;
  type: BankAccount["type"];
  iban: string;
  balance: number;
  currency: BankAccount["currency"];
};

type CreatePaymentOrderInput = {
  paymentType: PaymentType;
  sourceAccountId: string;
  payee: string;
  amount: number;
  dueDate: string;
  description?: string;
  status: PaymentOrder["status"];
};

type SaveRoboProfileInput = {
  score: number;
  profile: RoboProfileResult["profile"];
  allocation: RoboProfileResult["allocation"];
  answers: RoboAnswer[];
};

type FinanceDataContextValue = FinanceSnapshot & {
  hydrated: boolean;
  budgetsWithSpending: Budget[];
  lastRoboResult: RoboProfileResult | null;
  addTransaction: (input: AddTransactionInput) => Transaction;
  deleteTransaction: (transactionId: string) => void;
  addAccount: (input: AddAccountInput) => BankAccount;
  updateBudgetLimit: (budgetId: string, limit: number) => void;
  createPaymentOrder: (input: CreatePaymentOrderInput) => PaymentOrder;
  updatePaymentOrderStatus: (orderId: string, status: PaymentOrder["status"]) => void;
  deletePaymentOrder: (orderId: string) => void;
  saveRoboProfileResult: (input: SaveRoboProfileInput) => RoboProfileResult;
  resetToSeed: () => void;
};

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function transactionDirection(type: TransactionType): Transaction["direction"] {
  return type === "gelir" ? "in" : "out";
}

function transactionBalanceEffect(transaction: Transaction): number {
  return transaction.direction === "in" ? transaction.amount : -transaction.amount;
}

function applyBalanceEffect(
  accounts: BankAccount[],
  transaction: Transaction,
  operation: "add" | "remove"
): BankAccount[] {
  const effect = transactionBalanceEffect(transaction) * (operation === "add" ? 1 : -1);

  return accounts.map((account) =>
    account.id === transaction.accountId
      ? { ...account, balance: Number((account.balance + effect).toFixed(2)) }
      : account
  );
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = new Date(dateValue);

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function getBudgetsWithSpending(budgets: Budget[], transactions: Transaction[]): Budget[] {
  const referenceDate = new Date();

  return budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.direction === "out")
      .filter((transaction) => transaction.category === budget.category)
      .filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate))
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      ...budget,
      spent: Number(spent.toFixed(2)),
    };
  });
}

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot>(() => createSeedSnapshot());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateTimer = window.setTimeout(() => {
      setSnapshot(readFinanceSnapshot());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key) {
        setSnapshot(readFinanceSnapshot());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateSnapshot = useCallback((updater: (current: FinanceSnapshot) => FinanceSnapshot) => {
    setSnapshot((current) => {
      return writeFinanceSnapshot(updater(current));
    });
  }, []);

  const addTransaction = useCallback(
    (input: AddTransactionInput) => {
      const direction = transactionDirection(input.type);
      const transaction: Transaction = {
        id: createId("txn"),
        accountId: input.accountId,
        title: input.title.trim(),
        amount: Number(input.amount.toFixed(2)),
        category: input.type === "transfer" ? "transfer" : input.category,
        direction,
        type: input.type,
        occurredAt: new Date(`${input.occurredAt}T12:00:00`).toISOString(),
        description: input.description?.trim() || undefined,
      };

      updateSnapshot((current) => ({
        ...current,
        accounts: applyBalanceEffect(current.accounts, transaction, "add"),
        transactions: [transaction, ...current.transactions],
      }));

      return transaction;
    },
    [updateSnapshot]
  );

  const deleteTransaction = useCallback(
    (transactionId: string) => {
      updateSnapshot((current) => {
        const transaction = current.transactions.find((item) => item.id === transactionId);

        if (!transaction) {
          return current;
        }

        return {
          ...current,
          accounts: applyBalanceEffect(current.accounts, transaction, "remove"),
          transactions: current.transactions.filter((item) => item.id !== transactionId),
        };
      });
    },
    [updateSnapshot]
  );

  const addAccount = useCallback(
    (input: AddAccountInput) => {
      const account: BankAccount = {
        id: createId("acc"),
        userId: snapshot.user.id,
        bankName: input.bankName.trim(),
        accountName: input.accountName.trim(),
        iban: input.iban.trim(),
        balance: Number(input.balance.toFixed(2)),
        currency: input.currency,
        type: input.type,
      };

      updateSnapshot((current) => ({
        ...current,
        accounts: [account, ...current.accounts],
      }));

      return account;
    },
    [snapshot.user.id, updateSnapshot]
  );

  const updateBudgetLimit = useCallback(
    (budgetId: string, limit: number) => {
      updateSnapshot((current) => ({
        ...current,
        budgets: current.budgets.map((budget) =>
          budget.id === budgetId ? { ...budget, limit: Number(limit.toFixed(2)) } : budget
        ),
      }));
    },
    [updateSnapshot]
  );

  const createPaymentOrder = useCallback(
    (input: CreatePaymentOrderInput) => {
      const order: PaymentOrder = {
        id: createId("pay"),
        userId: snapshot.user.id,
        payee: input.payee.trim(),
        amount: Number(input.amount.toFixed(2)),
        dueDate: input.dueDate,
        status: input.status,
        paymentType: input.paymentType,
        sourceAccountId: input.sourceAccountId,
        referenceNumber: `FW-${Date.now()}`,
        description: input.description?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      updateSnapshot((current) => ({
        ...current,
        paymentOrders: [order, ...current.paymentOrders],
      }));

      return order;
    },
    [snapshot.user.id, updateSnapshot]
  );

  const updatePaymentOrderStatus = useCallback(
    (orderId: string, status: PaymentOrder["status"]) => {
      updateSnapshot((current) => ({
        ...current,
        paymentOrders: current.paymentOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      }));
    },
    [updateSnapshot]
  );

  const deletePaymentOrder = useCallback(
    (orderId: string) => {
      updateSnapshot((current) => ({
        ...current,
        paymentOrders: current.paymentOrders.filter((order) => order.id !== orderId),
      }));
    },
    [updateSnapshot]
  );

  const saveRoboProfileResult = useCallback(
    (input: SaveRoboProfileInput) => {
      const result: RoboProfileResult = {
        id: createId("robo"),
        score: input.score,
        profile: input.profile,
        allocation: input.allocation,
        answers: input.answers,
        analyzedAt: new Date().toISOString(),
      };

      updateSnapshot((current) => ({
        ...current,
        roboResults: [result, ...current.roboResults],
      }));

      return result;
    },
    [updateSnapshot]
  );

  const resetToSeed = useCallback(() => {
    setSnapshot(resetFinanceSnapshot());
  }, []);

  const budgetsWithSpending = useMemo(
    () => getBudgetsWithSpending(snapshot.budgets, snapshot.transactions),
    [snapshot.budgets, snapshot.transactions]
  );

  const lastRoboResult = snapshot.roboResults[0] ?? null;

  const value = useMemo<FinanceDataContextValue>(
    () => ({
      ...snapshot,
      hydrated,
      budgetsWithSpending,
      lastRoboResult,
      addTransaction,
      deleteTransaction,
      addAccount,
      updateBudgetLimit,
      createPaymentOrder,
      updatePaymentOrderStatus,
      deletePaymentOrder,
      saveRoboProfileResult,
      resetToSeed,
    }),
    [
      addAccount,
      addTransaction,
      budgetsWithSpending,
      createPaymentOrder,
      deletePaymentOrder,
      deleteTransaction,
      hydrated,
      lastRoboResult,
      resetToSeed,
      saveRoboProfileResult,
      snapshot,
      updateBudgetLimit,
      updatePaymentOrderStatus,
    ]
  );

  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceData() {
  const context = useContext(FinanceDataContext);

  if (!context) {
    throw new Error("useFinanceData must be used inside FinanceDataProvider");
  }

  return context;
}
