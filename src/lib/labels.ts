import type { BankAccount, PaymentOrder, RegTechSeverity, TransactionCategory } from "@/types/finance";

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

export function getAccountTypeLabel(type: BankAccount["type"]): string {
  return type === "vadesiz" ? "Vadesiz Hesap" : "Birikim Hesabı";
}
