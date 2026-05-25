import type { BankAccount, PaymentType } from "@/types/finance";

export type PaymentOrderInput = {
  paymentType: PaymentType;
  sourceAccountId: string;
  payeeName: string;
  amount: number;
  description?: string;
};

export type PaymentValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sourceAccount?: BankAccount;
};

export type PaymentSimulationResult = {
  status: "isleme_alindi" | "beklemede" | "tamamlandi";
  referenceNumber: string;
  createdAt: string;
  paymentType: PaymentType;
  paymentTypeLabel: string;
  sourceAccountId: string;
  sourceAccountName: string;
  payeeName: string;
  amount: number;
  description?: string;
  isRealPayment: false;
  message: string;
};

export function getPaymentTypeLabel(paymentType: PaymentType): string {
  switch (paymentType) {
    case "fatura":
      return "Fatura Ödeme";
    case "transfer":
      return "Para Transferi";
    case "abonelik":
      return "Abonelik Ödemesi";
    default:
      return "Ödeme";
  }
}

export function validatePaymentOrder(input: PaymentOrderInput, accounts: BankAccount[]): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sourceAccount = accounts.find((account) => account.id === input.sourceAccountId);

  if (!input.sourceAccountId || !sourceAccount) {
    errors.push("Kaynak hesap seçilmelidir.");
  }

  if (!input.payeeName.trim()) {
    errors.push("Alıcı adı / kurum adı zorunludur.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    errors.push("Tutar 0'dan büyük olmalıdır.");
  }

  if (sourceAccount && input.amount > sourceAccount.balance) {
    warnings.push("Girilen tutar kaynak hesap bakiyesinden büyüktür. Talimat beklemede olarak işaretlendi.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    sourceAccount,
  };
}

export function simulatePaymentOrder(input: PaymentOrderInput, sourceAccount: BankAccount): PaymentSimulationResult {
  const referenceNumber = `FW-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
  const status: PaymentSimulationResult["status"] = input.amount > sourceAccount.balance ? "beklemede" : "isleme_alindi";

  return {
    status,
    referenceNumber,
    createdAt: new Date().toISOString(),
    paymentType: input.paymentType,
    paymentTypeLabel: getPaymentTypeLabel(input.paymentType),
    sourceAccountId: sourceAccount.id,
    sourceAccountName: sourceAccount.bankName,
    payeeName: input.payeeName,
    amount: input.amount,
    description: input.description?.trim() || undefined,
    isRealPayment: false,
    message: "Talimat oluşturuldu",
  };
}

