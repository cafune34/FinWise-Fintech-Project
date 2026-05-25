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

export type User = {
  id: string;
  fullName: string;
  email: string;
  riskProfile: "dusuk" | "orta" | "yuksek";
  createdAt: string;
};

export type BankAccount = {
  id: string;
  userId: string;
  bankName: string;
  iban: string;
  balance: number;
  currency: "TRY";
  type: "vadesiz" | "birikim";
  isMock: true;
};

export type Transaction = {
  id: string;
  accountId: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  direction: "in" | "out";
  occurredAt: string;
  description?: string;
  isMock: true;
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
  status: "planlandi" | "simule_edildi";
  isMock: true;
};

export type RegTechAlert = {
  id: string;
  userId: string;
  transactionId: string;
  level: "dusuk" | "orta" | "yuksek";
  reason: string;
  createdAt: string;
  resolved: boolean;
};
