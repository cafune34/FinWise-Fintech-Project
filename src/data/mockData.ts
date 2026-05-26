import type {
  BankAccount,
  Budget,
  PaymentOrder,
  RegTechAlert,
  Transaction,
  TransactionCategory,
  User,
} from "@/types/finance";

export const mockUser: User = {
  id: "user-1",
  fullName: "Hakan Dolay",
  email: "hakan.dolay@finwise.app",
  riskProfile: "orta",
  createdAt: "2026-05-01T09:00:00.000Z",
};

export const mockAccounts: BankAccount[] = [
  {
    id: "acc-akbank",
    userId: mockUser.id,
    bankName: "Akbank Varlık Hesabı",
    iban: "TR110006200000000000000001",
    balance: 82500,
    currency: "TRY",
    type: "vadesiz",
    isMock: true,
  },
  {
    id: "acc-garanti",
    userId: mockUser.id,
    bankName: "Garanti Birikim Portföyü",
    iban: "TR340006200000000000000002",
    balance: 45200,
    currency: "TRY",
    type: "birikim",
    isMock: true,
  },
  {
    id: "acc-ziraat",
    userId: mockUser.id,
    bankName: "Ziraat Günlük Hesap",
    iban: "TR870006200000000000000003",
    balance: 28300,
    currency: "TRY",
    type: "vadesiz",
    isMock: true,
  },
];

const categoryPool: TransactionCategory[] = [
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

const merchantByCategory: Record<TransactionCategory, string> = {
  market: "Market Alışverişi",
  ulasim: "Ulaşım Kart Yükleme",
  fatura: "Elektrik/Su Faturası",
  egitim: "Online Eğitim",
  eglence: "Sosyal Etkinlik",
  saglik: "Eczane/Özel Klinik",
  kira: "Kira Ödemesi",
  maas: "Maaş Ödemesi",
  transfer: "Banka Transferi",
  yatirim: "Fon/Altın Alımı",
  diger: "Diğer Harcama",
};

const directionByCategory: Record<TransactionCategory, "in" | "out"> = {
  market: "out",
  ulasim: "out",
  fatura: "out",
  egitim: "out",
  eglence: "out",
  saglik: "out",
  kira: "out",
  maas: "in",
  transfer: "out",
  yatirim: "out",
  diger: "out",
};

const amountByCategory: Record<TransactionCategory, number> = {
  market: 650,
  ulasim: 170,
  fatura: 1200,
  egitim: 900,
  eglence: 480,
  saglik: 730,
  kira: 18500,
  maas: 48000,
  transfer: 2200,
  yatirim: 3500,
  diger: 410,
};

const variableTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => {
  const category = categoryPool[i % categoryPool.length];
  const account = mockAccounts[i % mockAccounts.length];
  const baseAmount = amountByCategory[category];
  const amount = baseAmount + (i % 5) * 95;
  const daysAgo = 1 + i;

  return {
    id: `txn-${String(i + 1).padStart(3, "0")}`,
    accountId: account.id,
    title: merchantByCategory[category],
    amount,
    category,
    direction: directionByCategory[category],
    occurredAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    description: "Aylık finans görünümü kaydı",
    isMock: true,
  };
});

const largeTransactions: Transaction[] = [
  {
    id: "txn-large-001",
    accountId: "acc-akbank",
    title: "Yüksek Tutarlı Transfer",
    amount: 125000,
    category: "transfer",
    direction: "out",
    occurredAt: "2026-05-05T11:30:00.000Z",
    description: "Risk izleme kaydı",
    isMock: true,
  },
  {
    id: "txn-large-002",
    accountId: "acc-garanti",
    title: "Kurumsal Maaş Girişi",
    amount: 98000,
    category: "maas",
    direction: "in",
    occurredAt: "2026-05-03T08:45:00.000Z",
    description: "Risk izleme kaydı",
    isMock: true,
  },
  {
    id: "txn-large-003",
    accountId: "acc-ziraat",
    title: "Yatırım Fon Toplu Alım",
    amount: 76500,
    category: "yatirim",
    direction: "out",
    occurredAt: "2026-05-02T15:10:00.000Z",
    description: "Risk izleme kaydı",
    isMock: true,
  },
  {
    id: "txn-large-004",
    accountId: "acc-akbank",
    title: "Yüksek Tutarlı Kira",
    amount: 52000,
    category: "kira",
    direction: "out",
    occurredAt: "2026-05-01T12:00:00.000Z",
    description: "Risk izleme kaydı",
    isMock: true,
  },
  {
    id: "txn-large-005",
    accountId: "acc-garanti",
    title: "Özel Sağlık Ödemesi",
    amount: 47200,
    category: "saglik",
    direction: "out",
    occurredAt: "2026-04-30T09:20:00.000Z",
    description: "Risk izleme kaydı",
    isMock: true,
  },
];

export const mockTransactions: Transaction[] = [
  ...largeTransactions,
  ...variableTransactions,
];

export const mockBudgets: Budget[] = [
  { id: "bgt-1", userId: mockUser.id, category: "market", limit: 8500, spent: 5100, period: "aylik" },
  { id: "bgt-2", userId: mockUser.id, category: "ulasim", limit: 3000, spent: 1860, period: "aylik" },
  { id: "bgt-3", userId: mockUser.id, category: "fatura", limit: 6000, spent: 4200, period: "aylik" },
  { id: "bgt-4", userId: mockUser.id, category: "eglence", limit: 4500, spent: 2750, period: "aylik" },
  { id: "bgt-5", userId: mockUser.id, category: "yatirim", limit: 12000, spent: 7300, period: "aylik" },
];

export const mockPaymentOrders: PaymentOrder[] = [
  {
    id: "pay-1",
    userId: mockUser.id,
    sourceAccountId: "acc-akbank",
    payee: "Elektrik Faturasi",
    amount: 1450,
    dueDate: "2026-05-29",
    status: "beklemede",
    isMock: true,
  },
  {
    id: "pay-2",
    userId: mockUser.id,
    sourceAccountId: "acc-ziraat",
    payee: "Internet Faturasi",
    amount: 790,
    dueDate: "2026-05-30",
    status: "tamamlandi",
    isMock: true,
  },
];

export const mockRegTechAlerts: RegTechAlert[] = [
  {
    id: "alert-1",
    userId: mockUser.id,
    transactionId: "txn-large-001",
    level: "yuksek",
    reason: "Alışılmış işlem ortalamasının üzerinde yüksek tutarlı transfer",
    createdAt: "2026-05-05T11:35:00.000Z",
    resolved: false,
  },
  {
    id: "alert-2",
    userId: mockUser.id,
    transactionId: "txn-large-003",
    level: "orta",
    reason: "Kısa sürede art arda yüksek tutarlı yatırım işlemi",
    createdAt: "2026-05-02T15:20:00.000Z",
    resolved: false,
  },
];
