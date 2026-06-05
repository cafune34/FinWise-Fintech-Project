import type {
  BankAccount,
  Budget,
  PaymentOrder,
  RegTechAlert,
  Transaction,
  User,
} from "@/types/finance";

export const mockUser: User = {
  id: "user-1",
  fullName: "Hakan Dolay",
  email: "hakan.dolay@finwise.app",
  riskProfile: "orta",
  createdAt: "2025-07-01T09:00:00.000Z",
};

export const mockAccounts: BankAccount[] = [
  {
    id: "acc-ziraat-maas",
    userId: mockUser.id,
    bankName: "Ziraat Maas Hesabi",
    accountName: "Ziraat Maas Hesabi",
    iban: "TR110001000000000000000001",
    balance: 14850,
    currency: "TRY",
    type: "vadesiz",
    status: "aktif",
    isMock: true,
  },
  {
    id: "acc-garanti-acil",
    userId: mockUser.id,
    bankName: "Garanti Acil Durum Fonu",
    accountName: "Garanti Acil Durum Fonu",
    iban: "TR220001000000000000000002",
    balance: 60000,
    currency: "TRY",
    type: "birikim",
    status: "aktif",
    isMock: true,
  },
  {
    id: "acc-isbank-gunluk",
    userId: mockUser.id,
    bankName: "Is Bankasi Gunluk Harcama Hesabi",
    accountName: "Is Bankasi Gunluk Harcama Hesabi",
    iban: "TR330001000000000000000003",
    balance: 8750,
    currency: "TRY",
    type: "vadesiz",
    status: "aktif",
    isMock: true,
  },
  {
    id: "acc-yapikredi-fon",
    userId: mockUser.id,
    bankName: "Yapi Kredi Birikim / Fon Hesabi",
    accountName: "Yapi Kredi Birikim / Fon Hesabi",
    iban: "TR440001000000000000000004",
    balance: 36500,
    currency: "TRY",
    type: "birikim",
    status: "aktif",
    isMock: true,
  },
  {
    id: "acc-bes-uzun-vade",
    userId: mockUser.id,
    bankName: "BES / Uzun Vadeli Birikim",
    accountName: "BES / Uzun Vadeli Birikim",
    iban: "TR550001000000000000000005",
    balance: 28000,
    currency: "TRY",
    type: "birikim",
    status: "aktif",
    isMock: true,
  },
];

type MonthlyPlan = {
  month: string;
  salary: number;
  rent: number;
  aidat: number;
  electricity: number;
  water: number;
  naturalGas: number;
  internet: number;
  phone: number;
  market: [number, number, number, number];
  transport: [number, number, number, number];
  social: [number, number];
  education: number;
  health?: number;
  clothing?: number;
  saving: number;
  extraIncome?: number;
  earlyBills?: boolean;
};

const monthlyPlans: MonthlyPlan[] = [
  {
    month: "2025-07",
    salary: 43000,
    rent: 13500,
    aidat: 1000,
    electricity: 760,
    water: 280,
    naturalGas: 250,
    internet: 470,
    phone: 360,
    market: [1650, 1780, 1850, 1720],
    transport: [430, 460, 440, 470],
    social: [820, 760],
    education: 450,
    health: 0,
    clothing: 0,
    saving: 4000,
  },
  {
    month: "2025-08",
    salary: 43200,
    rent: 13500,
    aidat: 1000,
    electricity: 820,
    water: 310,
    naturalGas: 250,
    internet: 470,
    phone: 370,
    market: [1720, 1810, 1890, 1760],
    transport: [450, 470, 460, 480],
    social: [900, 780],
    education: 500,
    health: 650,
    clothing: 0,
    saving: 4200,
    extraIncome: 1800,
  },
  {
    month: "2025-09",
    salary: 43800,
    rent: 14000,
    aidat: 1100,
    electricity: 720,
    water: 300,
    naturalGas: 320,
    internet: 490,
    phone: 380,
    market: [1780, 1880, 1950, 1820],
    transport: [460, 490, 470, 500],
    social: [760, 820],
    education: 950,
    health: 0,
    clothing: 1200,
    saving: 4300,
  },
  {
    month: "2025-10",
    salary: 44000,
    rent: 14000,
    aidat: 1100,
    electricity: 690,
    water: 290,
    naturalGas: 520,
    internet: 500,
    phone: 390,
    market: [1800, 1920, 2010, 1870],
    transport: [470, 500, 480, 510],
    social: [920, 840],
    education: 650,
    health: 720,
    clothing: 0,
    saving: 4500,
  },
  {
    month: "2025-11",
    salary: 44300,
    rent: 14500,
    aidat: 1150,
    electricity: 710,
    water: 310,
    naturalGas: 850,
    internet: 510,
    phone: 400,
    market: [1880, 1980, 2050, 1920],
    transport: [480, 520, 500, 530],
    social: [800, 940],
    education: 700,
    health: 0,
    clothing: 1500,
    saving: 4500,
    extraIncome: 2200,
  },
  {
    month: "2025-12",
    salary: 44500,
    rent: 14500,
    aidat: 1200,
    electricity: 780,
    water: 330,
    naturalGas: 1180,
    internet: 520,
    phone: 410,
    market: [1950, 2050, 2140, 2000],
    transport: [500, 540, 520, 550],
    social: [980, 1050],
    education: 750,
    health: 900,
    clothing: 0,
    saving: 4800,
  },
  {
    month: "2026-01",
    salary: 44800,
    rent: 15000,
    aidat: 1200,
    electricity: 840,
    water: 340,
    naturalGas: 1350,
    internet: 520,
    phone: 420,
    market: [2050, 2140, 2220, 2080],
    transport: [520, 560, 540, 570],
    social: [920, 880],
    education: 800,
    health: 0,
    clothing: 1800,
    saving: 5000,
  },
  {
    month: "2026-02",
    salary: 45200,
    rent: 15000,
    aidat: 1250,
    electricity: 790,
    water: 320,
    naturalGas: 1250,
    internet: 530,
    phone: 430,
    market: [2080, 2180, 2250, 2120],
    transport: [530, 570, 550, 580],
    social: [850, 960],
    education: 850,
    health: 800,
    clothing: 0,
    saving: 5200,
    extraIncome: 2500,
  },
  {
    month: "2026-03",
    salary: 45800,
    rent: 15500,
    aidat: 1250,
    electricity: 720,
    water: 330,
    naturalGas: 920,
    internet: 540,
    phone: 430,
    market: [2140, 2240, 2320, 2180],
    transport: [540, 580, 560, 590],
    social: [960, 1100],
    education: 900,
    health: 0,
    clothing: 1600,
    saving: 5500,
  },
  {
    month: "2026-04",
    salary: 46100,
    rent: 15500,
    aidat: 1300,
    electricity: 690,
    water: 320,
    naturalGas: 560,
    internet: 550,
    phone: 440,
    market: [2200, 2280, 2380, 2240],
    transport: [550, 590, 570, 600],
    social: [880, 980],
    education: 950,
    health: 700,
    clothing: 0,
    saving: 5800,
    extraIncome: 1600,
  },
  {
    month: "2026-05",
    salary: 46500,
    rent: 15500,
    aidat: 1300,
    electricity: 680,
    water: 330,
    naturalGas: 420,
    internet: 550,
    phone: 440,
    market: [2250, 2350, 2420, 2300],
    transport: [560, 600, 580, 610],
    social: [900, 1050],
    education: 900,
    health: 0,
    clothing: 1300,
    saving: 6000,
    earlyBills: true,
  },
];

let transactionSequence = 1;

function isoDate(month: string, day: number, hour = 12): string {
  return `${month}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

function createTransaction(input: Omit<Transaction, "id" | "isMock">): Transaction {
  const id = `txn-memur-${String(transactionSequence).padStart(4, "0")}`;
  transactionSequence += 1;

  return {
    id,
    ...input,
    isMock: true,
  };
}

function buildMonthlyTransactions(plan: MonthlyPlan): Transaction[] {
  const billDays = plan.earlyBills
    ? { electricity: 2, water: 3, naturalGas: 4, internet: 5, phone: 5 }
    : { electricity: 7, water: 12, naturalGas: 18, internet: 9, phone: 10 };

  const transactions: Transaction[] = [
    createTransaction({
      accountId: "acc-ziraat-maas",
      title: "Memur Maasi",
      amount: plan.salary,
      category: "maas",
      direction: "in",
      type: "gelir",
      occurredAt: isoDate(plan.month, 5, 9),
      description: "Aylik kamu personeli maas odemesi",
    }),
    createTransaction({
      accountId: "acc-ziraat-maas",
      title: "Kira Odemesi",
      amount: plan.rent,
      category: "kira",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, 1, 10),
      description: "Aylik duzenli konut kira odemesi",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Site Aidati",
      amount: plan.aidat,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, 3, 11),
      description: "Aylik duzenli site aidati",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Elektrik Faturasi",
      amount: plan.electricity,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, billDays.electricity, 14),
      description: "Aylik mesken elektrik faturasi",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Su Faturasi",
      amount: plan.water,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, billDays.water, 14),
      description: "Aylik su faturasi",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Dogalgaz Faturasi",
      amount: plan.naturalGas,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, billDays.naturalGas, 14),
      description: "Mevsimsel dogalgaz faturasi",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Internet Faturasi",
      amount: plan.internet,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, billDays.internet, 15),
      description: "Ev internet faturasi",
    }),
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Telefon Faturasi",
      amount: plan.phone,
      category: "fatura",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, billDays.phone, 15),
      description: "Mobil hat faturasi",
    }),
    createTransaction({
      accountId: "acc-garanti-acil",
      title: "Acil Durum Fonuna Aktarim",
      amount: plan.saving,
      category: "yatirim",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, 6, 10),
      description: "Aylik duzenli acil durum fonu birikimi",
    }),
  ];

  plan.market.forEach((amount, index) => {
    transactions.push(
      createTransaction({
        accountId: "acc-isbank-gunluk",
        title: "Market Alisverisi",
        amount,
        category: "market",
        direction: "out",
        type: "gider",
        occurredAt: isoDate(plan.month, [4, 11, 18, 25][index], 17),
        description: "Haftalik temel market ve mutfak harcamasi",
      })
    );
  });

  plan.transport.forEach((amount, index) => {
    transactions.push(
      createTransaction({
        accountId: "acc-isbank-gunluk",
        title: "Ulasim Karti Yukleme",
        amount,
        category: "ulasim",
        direction: "out",
        type: "gider",
        occurredAt: isoDate(plan.month, [6, 13, 20, 27][index], 8),
        description: "Toplu tasima ve gunluk ulasim gideri",
      })
    );
  });

  plan.social.forEach((amount, index) => {
    transactions.push(
      createTransaction({
        accountId: "acc-isbank-gunluk",
        title: index === 0 ? "Kafe / Sosyal Etkinlik" : "Aile Yemegi",
        amount,
        category: "eglence",
        direction: "out",
        type: "gider",
        occurredAt: isoDate(plan.month, index === 0 ? 16 : 24, 19),
        description: "Kontrollu sosyal yasam harcamasi",
      })
    );
  });

  transactions.push(
    createTransaction({
      accountId: "acc-isbank-gunluk",
      title: "Online Egitim Aboneligi",
      amount: plan.education,
      category: "egitim",
      direction: "out",
      type: "gider",
      occurredAt: isoDate(plan.month, 21, 16),
      description: "Kisisel gelisim ve mesleki egitim harcamasi",
    })
  );

  if (plan.health && plan.health > 0) {
    transactions.push(
      createTransaction({
        accountId: "acc-isbank-gunluk",
        title: "Eczane Alisverisi",
        amount: plan.health,
        category: "saglik",
        direction: "out",
        type: "gider",
        occurredAt: isoDate(plan.month, 14, 13),
        description: "Rutin saglik ve ilac harcamasi",
      })
    );
  }

  if (plan.clothing && plan.clothing > 0) {
    transactions.push(
      createTransaction({
        accountId: "acc-isbank-gunluk",
        title: "Giyim / Bakim Alisverisi",
        amount: plan.clothing,
        category: "diger",
        direction: "out",
        type: "gider",
        occurredAt: isoDate(plan.month, 23, 18),
        description: "Donemsel giyim ve kisisel bakim harcamasi",
      })
    );
  }

  if (plan.extraIncome && plan.extraIncome > 0) {
    transactions.push(
      createTransaction({
        accountId: "acc-ziraat-maas",
        title: "Ek Ders / Mesai Odemesi",
        amount: plan.extraIncome,
        category: "maas",
        direction: "in",
        type: "gelir",
        occurredAt: isoDate(plan.month, 22, 9),
        description: "Donemsel kucuk ek gelir odemesi",
      })
    );
  }

  return transactions;
}

const juneTransactions: Transaction[] = [
  createTransaction({
    accountId: "acc-ziraat-maas",
    title: "Kira Odemesi",
    amount: 15500,
    category: "kira",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-01T10:00:00.000Z",
    description: "Aylik duzenli konut kira odemesi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Site Aidati",
    amount: 1300,
    category: "fatura",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-02T11:00:00.000Z",
    description: "Aylik duzenli site aidati",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Market Alisverisi",
    amount: 2300,
    category: "market",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-03T17:00:00.000Z",
    description: "Haftalik temel market ve mutfak harcamasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Ulasim Karti Yukleme",
    amount: 550,
    category: "ulasim",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-03T08:00:00.000Z",
    description: "Toplu tasima ve gunluk ulasim gideri",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Online Egitim Aboneligi",
    amount: 900,
    category: "egitim",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-04T16:00:00.000Z",
    description: "Kisisel gelisim ve mesleki egitim harcamasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Eczane Alisverisi",
    amount: 900,
    category: "saglik",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-04T13:00:00.000Z",
    description: "Rutin saglik ve ilac harcamasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Kafe / Sosyal Etkinlik",
    amount: 750,
    category: "eglence",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-04T19:00:00.000Z",
    description: "Kontrollu sosyal yasam harcamasi",
  }),
  createTransaction({
    accountId: "acc-ziraat-maas",
    title: "Memur Maasi",
    amount: 46500,
    category: "maas",
    direction: "in",
    type: "gelir",
    occurredAt: "2026-06-05T09:00:00.000Z",
    description: "Aylik kamu personeli maas odemesi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Market Alisverisi",
    amount: 2100,
    category: "market",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-05T12:00:00.000Z",
    description: "Haftalik temel market ve mutfak harcamasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Su Faturasi",
    amount: 320,
    category: "fatura",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-05T13:00:00.000Z",
    description: "Aylik su faturasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Dogalgaz Faturasi",
    amount: 450,
    category: "fatura",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-05T14:00:00.000Z",
    description: "Mevsimsel dogalgaz faturasi",
  }),
  createTransaction({
    accountId: "acc-isbank-gunluk",
    title: "Ulasim Karti Yukleme",
    amount: 450,
    category: "ulasim",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-05T15:00:00.000Z",
    description: "Toplu tasima ve gunluk ulasim gideri",
  }),
  createTransaction({
    accountId: "acc-garanti-acil",
    title: "Acil Durum Fonuna Aktarim",
    amount: 5000,
    category: "yatirim",
    direction: "out",
    type: "gider",
    occurredAt: "2026-06-05T16:00:00.000Z",
    description: "Aylik duzenli acil durum fonu birikimi",
  }),
  createTransaction({
    accountId: "acc-ziraat-maas",
    title: "Ek Ders / Mesai Odemesi",
    amount: 2000,
    category: "maas",
    direction: "in",
    type: "gelir",
    occurredAt: "2026-06-05T17:00:00.000Z",
    description: "Donemsel kucuk ek gelir odemesi",
  }),
];

export const mockTransactions: Transaction[] = [
  ...monthlyPlans.flatMap(buildMonthlyTransactions),
  ...juneTransactions,
].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

export const mockBudgets: Budget[] = [
  { id: "bgt-kira", userId: mockUser.id, category: "kira", limit: 16000, spent: 0, period: "aylik" },
  { id: "bgt-market", userId: mockUser.id, category: "market", limit: 10000, spent: 0, period: "aylik" },
  { id: "bgt-fatura", userId: mockUser.id, category: "fatura", limit: 4000, spent: 0, period: "aylik" },
  { id: "bgt-ulasim", userId: mockUser.id, category: "ulasim", limit: 3000, spent: 0, period: "aylik" },
  { id: "bgt-saglik", userId: mockUser.id, category: "saglik", limit: 1500, spent: 0, period: "aylik" },
  { id: "bgt-egitim", userId: mockUser.id, category: "egitim", limit: 1500, spent: 0, period: "aylik" },
  { id: "bgt-eglence", userId: mockUser.id, category: "eglence", limit: 2500, spent: 0, period: "aylik" },
  { id: "bgt-diger", userId: mockUser.id, category: "diger", limit: 2000, spent: 0, period: "aylik" },
  { id: "bgt-yatirim", userId: mockUser.id, category: "yatirim", limit: 6000, spent: 0, period: "aylik" },
];

export const mockPaymentOrders: PaymentOrder[] = [
  {
    id: "pay-electric-2026-06",
    userId: mockUser.id,
    sourceAccountId: "acc-isbank-gunluk",
    payee: "Elektrik Faturasi",
    amount: 850,
    dueDate: "2026-06-07",
    status: "beklemede",
    paymentType: "fatura",
    referenceNumber: "FW-DEMO-2026-06-ELK",
    referenceNo: "FW-DEMO-2026-06-ELK",
    description: "Haziran elektrik faturasi bekleyen talimat",
    createdAt: "2026-06-05T09:00:00.000Z",
    isMock: true,
  },
  {
    id: "pay-internet-2026-06",
    userId: mockUser.id,
    sourceAccountId: "acc-isbank-gunluk",
    payee: "Internet Faturasi",
    amount: 520,
    dueDate: "2026-06-09",
    status: "beklemede",
    paymentType: "fatura",
    referenceNumber: "FW-DEMO-2026-06-NET",
    referenceNo: "FW-DEMO-2026-06-NET",
    description: "Haziran internet faturasi bekleyen talimat",
    createdAt: "2026-06-05T09:00:00.000Z",
    isMock: true,
  },
  {
    id: "pay-phone-2026-06",
    userId: mockUser.id,
    sourceAccountId: "acc-isbank-gunluk",
    payee: "Telefon Faturasi",
    amount: 430,
    dueDate: "2026-06-10",
    status: "beklemede",
    paymentType: "fatura",
    referenceNumber: "FW-DEMO-2026-06-TEL",
    referenceNo: "FW-DEMO-2026-06-TEL",
    description: "Haziran telefon faturasi bekleyen talimat",
    createdAt: "2026-06-05T09:00:00.000Z",
    isMock: true,
  },
  {
    id: "pay-transport-2026-06",
    userId: mockUser.id,
    sourceAccountId: "acc-isbank-gunluk",
    payee: "Ulasim Karti Otomatik Yukleme",
    amount: 750,
    dueDate: "2026-06-12",
    status: "beklemede",
    paymentType: "abonelik",
    referenceNumber: "FW-DEMO-2026-06-ULS",
    referenceNo: "FW-DEMO-2026-06-ULS",
    description: "Ulasim karti icin bekleyen otomatik yukleme",
    createdAt: "2026-06-05T09:00:00.000Z",
    isMock: true,
  },
];

export const mockRegTechAlerts: RegTechAlert[] = [];
