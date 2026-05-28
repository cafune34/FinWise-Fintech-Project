import type { BankAccount, PaymentOrder, RegTechSeverity, TransactionCategory, RiskProfile, TransactionType } from "@/types/finance";

export const categoryLabels: Record<TransactionCategory, string> = {
  market: "Market",
  ulasim: "Ulaşım",
  fatura: "Fatura",
  egitim: "Eğitim",
  eglence: "Eğlence",
  saglik: "Sağlık",
  kira: "Kira",
  maas: "Maaş",
  transfer: "Transfer",
  yatirim: "Yatırım",
  diger: "Diğer",
};

export const severityLabels: Record<RegTechSeverity, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

export const paymentStatusLabels: Record<PaymentOrder["status"], string> = {
  planlandi: "Planlandı",
  isleme_alindi: "İşleme Alındı",
  beklemede: "Beklemede",
  tamamlandi: "Tamamlandı",
  reddedildi: "Reddedildi",
};

export const riskProfileLabels: Record<RiskProfile, string> = {
  dusuk: "Düşük Risk",
  orta: "Orta Risk",
  yuksek: "Yüksek Risk",
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  gelir: "Gelir",
  gider: "Gider",
  transfer: "Para Transferi",
};

export function getAccountTypeLabel(type: BankAccount["type"]): string {
  return type === "vadesiz" ? "Vadesiz Hesap" : "Birikim Hesabı";
}

