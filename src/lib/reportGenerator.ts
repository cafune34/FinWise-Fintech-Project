import { jsPDF } from "jspdf";
import { analyzeBehavioralFinance, getBehavioralBiasLabel, getBehavioralRiskLabel } from "@/lib/behavioralFinance";
import { buildCopilotFinanceContext } from "@/lib/copilotContext";
import { analyzeEmergencyFund } from "@/lib/emergencyFund";
import {
  calculateTotalTryAssets,
  formatCurrencyEUR,
  formatCurrencyUSD,
  getFallbackPurchasingPower,
} from "@/lib/purchasingPower";
import { analyzeSpendingDna } from "@/lib/spendingDna";
import { analyzeCarbonFootprint, formatKgCo2 } from "@/lib/carbonFootprint";
import { categoryLabels, riskProfileLabels } from "@/lib/labels";
import type { FinanceSnapshot } from "@/lib/storage";
import type { Transaction, TransactionCategory } from "@/types/finance";

type KeyValueRow = {
  label: string;
  value: string;
};

type ReportCategorySummary = {
  label: string;
  amount: number;
};

type ReportRiskyTransaction = {
  title: string;
  categoryLabel: string;
  amount: number;
  occurredAt: string;
};

export type FinancialReportData = {
  generatedAt: string;
  fileDate: string;
  user: {
    fullName: string;
    riskProfileLabel: string;
    accountCount: number;
    totalAssets: number;
    updatedAt: string;
  };
  finance: {
    totalTryAssets: number;
    monthlyIncome: number;
    monthlyExpense: number;
    netCashFlow: number;
    topExpenseCategories: ReportCategorySummary[];
    pendingPaymentAmount: number;
  };
  riskyTransactions: ReportRiskyTransaction[];
  behavioralInsights: ReturnType<typeof analyzeBehavioralFinance>;
  spendingDna: ReturnType<typeof analyzeSpendingDna>;
  emergencyFund: ReturnType<typeof analyzeEmergencyFund>;
  purchasingPower: {
    totalTryAssets: number;
    usdValue: number;
    eurValue: number;
    sourceLabel: string;
    note: string;
  };
  copilotSummary: string;
  conclusion: string;
  disclaimer: string;
};

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 16;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const PAGE_BOTTOM = 18;
const SECTION_GAP = 6;
const RISKY_CATEGORIES = new Set<TransactionCategory>(["transfer", "yatirim", "kira", "fatura"]);
const REPORT_DISCLAIMER =
  "Bu rapor yatırım tavsiyesi değildir; eğitim amaçlı akademik fintech karar destek prototipidir.";

const turkishPdfMap: Record<string, string> = {
  "ğ": "g",
  "Ğ": "G",
  "ü": "u",
  "Ü": "U",
  "ş": "s",
  "Ş": "S",
  "ı": "i",
  "İ": "I",
  "ö": "o",
  "Ö": "O",
  "ç": "c",
  "Ç": "C",
};

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function safeDate(value?: string | Date): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;

  return Number.isNaN(date.getTime()) ? null : date;
}

function getReferenceDate(snapshot: FinanceSnapshot): Date {
  const latestTransactionDate = snapshot.transactions
    .map((transaction) => safeDate(transaction.occurredAt))
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return latestTransactionDate ?? safeDate(snapshot.updatedAt) ?? new Date();
}

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = safeDate(dateValue);
  if (!date) return false;

  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

function isOutflow(transaction: Transaction): boolean {
  return transaction.direction === "out" || transaction.type === "gider" || transaction.type === "transfer";
}

function riskWeight(level: "dusuk" | "orta" | "yuksek"): number {
  if (level === "yuksek") return 3;
  if (level === "orta") return 2;
  return 1;
}

function formatFileDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildRiskyTransactions(snapshot: FinanceSnapshot, referenceDate: Date): ReportRiskyTransaction[] {
  const outflows = snapshot.transactions.filter(isOutflow);
  const monthlyOutflows = outflows.filter((transaction) => isSameMonth(transaction.occurredAt, referenceDate));
  const scopedOutflows = monthlyOutflows.length > 0 ? monthlyOutflows : outflows;
  const averageOutflow =
    scopedOutflows.length > 0
      ? scopedOutflows.reduce((sum, transaction) => sum + transaction.amount, 0) / scopedOutflows.length
      : 0;

  const prioritized = scopedOutflows
    .filter((transaction) => RISKY_CATEGORIES.has(transaction.category) || transaction.amount >= averageOutflow * 1.5)
    .sort((a, b) => b.amount - a.amount);
  const topOutflows = [...scopedOutflows].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const merged = [...prioritized, ...topOutflows].filter(
    (transaction, index, all) => all.findIndex((item) => item.id === transaction.id) === index
  );

  return merged
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((transaction) => ({
      title: transaction.title,
      categoryLabel: categoryLabels[transaction.category] ?? transaction.category,
      amount: roundMoney(transaction.amount),
      occurredAt: transaction.occurredAt,
    }));
}

function buildConclusion(data: {
  netCashFlow: number;
  behavioralHighRiskCount: number;
  emergencyStatusLabel: string;
}): string {
  if (data.netCashFlow < 0) {
    return `Snapshot, negatif nakit akışı nedeniyle bütçe baskısının yakından izlenmesini gerektiriyor. Acil durum fonu durumu ${data.emergencyStatusLabel} seviyesinde.`;
  }

  if (data.behavioralHighRiskCount > 0) {
    return `Snapshot, pozitif nakit akışına rağmen davranışsal finans tarafında ${data.behavioralHighRiskCount} yüksek riskli sinyal içeriyor.`;
  }

  return `Snapshot, nakit akışı ve güvenlik fonu perspektifinde izlenebilir bir finansal görünüm sunuyor.`;
}

export function formatCurrencyTRY(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} TL`;
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)}%`;
}

export function formatDate(value?: string | Date): string {
  const date = safeDate(value);
  if (!date) return "Tarih yok";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function sanitizePdfText(value: unknown): string {
  return String(value ?? "")
    .replace(/[ğĞüÜşŞıİöÖçÇ]/g, (char) => turkishPdfMap[char] ?? char)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/₺/g, "TL")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

export function buildFinancialReportData(snapshot: FinanceSnapshot): FinancialReportData {
  const generatedAt = new Date();
  const referenceDate = getReferenceDate(snapshot);
  const context = buildCopilotFinanceContext(snapshot, referenceDate);
  const behavioralInsights = analyzeBehavioralFinance(snapshot).sort(
    (a, b) => riskWeight(b.riskLevel) - riskWeight(a.riskLevel)
  );
  const spendingDna = analyzeSpendingDna(snapshot);
  const emergencyFund = analyzeEmergencyFund(snapshot);
  const purchasingPower = getFallbackPurchasingPower(snapshot, "PDF raporu için güvenli senkron kur özeti");
  const totalTryAssets = calculateTotalTryAssets(snapshot);
  const behavioralHighRiskCount = behavioralInsights.filter((insight) => insight.riskLevel === "yuksek").length;
  const carbonResult = analyzeCarbonFootprint(snapshot);

  return {
    generatedAt: generatedAt.toISOString(),
    fileDate: formatFileDate(generatedAt),
    user: {
      fullName: snapshot.user.fullName,
      riskProfileLabel: riskProfileLabels[snapshot.user.riskProfile],
      accountCount: context.accountCount,
      totalAssets: context.totalBalance,
      updatedAt: snapshot.updatedAt,
    },
    finance: {
      totalTryAssets,
      monthlyIncome: context.monthlyIncome,
      monthlyExpense: context.monthlyExpense,
      netCashFlow: context.netCashFlow,
      topExpenseCategories: context.topExpenseCategories.map((category) => ({
        label: category.label,
        amount: category.amount,
      })),
      pendingPaymentAmount: context.paymentOrders.pendingTotal,
    },
    riskyTransactions: buildRiskyTransactions(snapshot, referenceDate),
    behavioralInsights,
    spendingDna,
    emergencyFund,
    purchasingPower: {
      totalTryAssets: purchasingPower.totalTryAssets,
      usdValue: purchasingPower.usdValue,
      eurValue: purchasingPower.eurValue,
      sourceLabel: purchasingPower.sourceLabel,
      note:
        purchasingPower.source === "live"
          ? "Satın alma gücü özeti canlı piyasa verisiyle hesaplandı."
          : "Satın alma gücü panelinde detaylı analiz sunulmaktadır; PDF içinde güvenli senkron özet kullanıldı.",
    },
    copilotSummary:
      `FinWise Copilot, bu snapshot için nakit akışı (${formatCurrencyTRY(
        context.netCashFlow
      )}), riskli harcamalar ve bütçe baskısı üzerinden öneriler üretebilir. ` +
      `API çağrısı yapılmadan mevcut Copilot context özetinden yararlanılmıştır. ` +
      `Para Akış Haritası modülü, gelirin gider kategorilerine görsel dağılımını ayrı sayfada sunar. ` +
      `What-if Simülatörü ayrı bir sayfa olarak kullanılabilir. ` +
      `Enflasyon Zaman Tüneli modülü, TL'nin yıllara göre demo satın alma gücü analizini ayrı sayfada sunar. ` +
      `Karbon Ayak İzi modülü, harcama kategorilerini demo ESG katsayılarıyla analiz eder. ` +
      `En son verilere göre tahmini toplam salınım ${formatKgCo2(carbonResult.totalEstimatedKgCo2)} düzeyindedir.`,
    conclusion: buildConclusion({
      netCashFlow: context.netCashFlow,
      behavioralHighRiskCount,
      emergencyStatusLabel: emergencyFund.statusLabel,
    }),
    disclaimer: REPORT_DISCLAIMER,
  };
}

export function addReportHeader(doc: jsPDF, title: string, subtitle?: string): number {
  doc.setFillColor(7, 11, 20);
  doc.rect(0, 0, PAGE_WIDTH, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(34, 211, 238);
  doc.text("FinWise", MARGIN_X, 13);
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.text(sanitizePdfText(title), MARGIN_X, 22);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(sanitizePdfText(subtitle), PAGE_WIDTH - MARGIN_X, 22, { align: "right" });
  }

  return 42;
}

export function addPageIfNeeded(doc: jsPDF, currentY: number, neededHeight: number): number {
  if (currentY + neededHeight <= PAGE_HEIGHT - PAGE_BOTTOM) {
    return currentY;
  }

  doc.addPage();
  return addReportHeader(doc, "FinWise Finansal Analiz Raporu", "Devam");
}

export function addSectionTitle(doc: jsPDF, title: string, currentY: number): number {
  const y = addPageIfNeeded(doc, currentY + SECTION_GAP, 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizePdfText(title), MARGIN_X, y);
  doc.setDrawColor(34, 211, 238);
  doc.setLineWidth(0.4);
  doc.line(MARGIN_X, y + 2.5, PAGE_WIDTH - MARGIN_X, y + 2.5);

  return y + 9;
}

export function addKeyValueRows(doc: jsPDF, rows: KeyValueRow[], currentY: number): number {
  let y = currentY;

  rows.forEach((row, index) => {
    const valueLines = doc.splitTextToSize(sanitizePdfText(row.value), CONTENT_WIDTH - 66) as string[];
    const rowHeight = Math.max(9, valueLines.length * 4.8 + 5);
    y = addPageIfNeeded(doc, y, rowHeight + 2);

    doc.setFillColor(index % 2 === 0 ? 248 : 255, index % 2 === 0 ? 250 : 255, index % 2 === 0 ? 252 : 255);
    doc.rect(MARGIN_X, y - 3, CONTENT_WIDTH, rowHeight, "F");
    doc.setDrawColor(226, 232, 240);
    doc.line(MARGIN_X, y + rowHeight - 3, PAGE_WIDTH - MARGIN_X, y + rowHeight - 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(sanitizePdfText(row.label), MARGIN_X + 3, y + 2.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    valueLines.forEach((line, lineIndex) => {
      doc.text(line, MARGIN_X + 62, y + 2.5 + lineIndex * 4.8);
    });

    y += rowHeight + 1.5;
  });

  return y + 2;
}

export function addTextBlock(doc: jsPDF, text: string, currentY: number): number {
  let y = currentY;
  const lines = doc.splitTextToSize(sanitizePdfText(text), CONTENT_WIDTH) as string[];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  lines.forEach((line) => {
    y = addPageIfNeeded(doc, y, 6);
    doc.text(line, MARGIN_X, y);
    y += 5.4;
  });

  return y + 2;
}

function addBulletRows(doc: jsPDF, items: string[], currentY: number): number {
  let y = currentY;

  if (items.length === 0) {
    return addTextBlock(doc, "Bu bölüm için yeterli veri bulunmuyor.", y);
  }

  items.forEach((item) => {
    y = addTextBlock(doc, `- ${item}`, y);
  });

  return y;
}

function addReportFooters(doc: jsPDF, generatedAt: string) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      sanitizePdfText(`FinWise Report | ${formatDate(generatedAt)} | Sayfa ${page}/${pageCount}`),
      MARGIN_X,
      PAGE_HEIGHT - 9
    );
    doc.text(sanitizePdfText("Yatirim tavsiyesi degildir."), PAGE_WIDTH - MARGIN_X, PAGE_HEIGHT - 9, {
      align: "right",
    });
  }
}

function addBehavioralInsightRows(doc: jsPDF, data: FinancialReportData, currentY: number): number {
  let y = currentY;

  data.behavioralInsights.slice(0, 5).forEach((insight, index) => {
    y = addKeyValueRows(
      doc,
      [
        { label: `İçgörü ${index + 1}`, value: getBehavioralBiasLabel(insight.type) },
        { label: "Kanıt", value: insight.evidence },
        { label: "Risk seviyesi", value: getBehavioralRiskLabel(insight.riskLevel) },
        { label: "Öneri", value: insight.recommendation },
      ],
      y
    );
  });

  return y;
}

function renderFinancialReport(doc: jsPDF, data: FinancialReportData) {
  let y = addReportHeader(doc, "FinWise Finansal Analiz Raporu", "Tek tık finansal analiz PDF'i");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(23);
  doc.setTextColor(15, 23, 42);
  doc.text(sanitizePdfText("FinWise Finansal Analiz Raporu"), MARGIN_X, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(sanitizePdfText(`Kullanıcı: ${data.user.fullName}`), MARGIN_X, y);
  y += 6;
  doc.text(sanitizePdfText(`Rapor tarihi: ${formatDate(data.generatedAt)}`), MARGIN_X, y);
  y += 9;
  y = addTextBlock(
    doc,
    "Eğitim amaçlı finansal analiz prototipi. Bu rapor yatırım tavsiyesi değildir.",
    y
  );

  y = addSectionTitle(doc, "Kullanıcı Özeti", y);
  y = addKeyValueRows(
    doc,
    [
      { label: "Kullanıcı adı", value: data.user.fullName },
      { label: "Risk profili", value: data.user.riskProfileLabel },
      { label: "Toplam hesap sayısı", value: String(data.user.accountCount) },
      { label: "Toplam varlık", value: formatCurrencyTRY(data.user.totalAssets) },
      { label: "Snapshot güncelleme tarihi", value: formatDate(data.user.updatedAt) },
    ],
    y
  );

  y = addSectionTitle(doc, "Genel Finans Özeti", y);
  y = addKeyValueRows(
    doc,
    [
      { label: "Toplam TL varlık", value: formatCurrencyTRY(data.finance.totalTryAssets) },
      { label: "Aylık gelir", value: formatCurrencyTRY(data.finance.monthlyIncome) },
      { label: "Aylık gider", value: formatCurrencyTRY(data.finance.monthlyExpense) },
      { label: "Net nakit akışı", value: formatCurrencyTRY(data.finance.netCashFlow) },
      {
        label: "En yüksek harcama kategorileri",
        value:
          data.finance.topExpenseCategories
            .map((category) => `${category.label}: ${formatCurrencyTRY(category.amount)}`)
            .join(" | ") || "Belirgin kategori yok",
      },
      { label: "Bekleyen ödeme tutarı", value: formatCurrencyTRY(data.finance.pendingPaymentAmount) },
    ],
    y
  );

  y = addSectionTitle(doc, "Riskli İşlemler", y);
  if (data.riskyTransactions.length === 0) {
    y = addTextBlock(doc, "Riskli veya yüksek tutarlı işlem bulunamadı.", y);
  } else {
    y = addKeyValueRows(
      doc,
      data.riskyTransactions.map((transaction, index) => ({
        label: `İşlem ${index + 1}`,
        value: `${transaction.title} | ${transaction.categoryLabel} | ${formatCurrencyTRY(
          transaction.amount
        )} | ${formatDate(transaction.occurredAt)}`,
      })),
      y
    );
  }

  y = addSectionTitle(doc, "Davranışsal Finans İçgörüleri", y);
  y = addBehavioralInsightRows(doc, data, y);

  y = addSectionTitle(doc, "Harcama DNA'sı", y);
  y = addKeyValueRows(
    doc,
    [
      { label: "Ana profil", value: data.spendingDna.primaryProfile.label },
      { label: "İkincil eğilim", value: data.spendingDna.secondaryProfile?.label ?? "Belirgin değil" },
      { label: "Risk seviyesi", value: riskProfileLabels[data.spendingDna.riskLevel] },
      { label: "Profil skoru", value: `${data.spendingDna.primaryProfile.score}/100` },
    ],
    y
  );
  y = addBulletRows(doc, data.spendingDna.recommendations.slice(0, 3), y);

  y = addSectionTitle(doc, "Acil Durum Fonu", y);
  y = addKeyValueRows(
    doc,
    [
      { label: "Aylık temel gider", value: formatCurrencyTRY(data.emergencyFund.monthlyEssentialExpense) },
      { label: "3 aylık hedef", value: formatCurrencyTRY(data.emergencyFund.targetAmount) },
      { label: "Mevcut varlık", value: formatCurrencyTRY(data.emergencyFund.currentAvailableAssets) },
      { label: "Tamamlanma yüzdesi", value: formatPercent(data.emergencyFund.completionPercentage) },
      {
        label: "Eksik/fazla tutar",
        value:
          data.emergencyFund.missingAmount > 0
            ? `${formatCurrencyTRY(data.emergencyFund.missingAmount)} eksik`
            : `${formatCurrencyTRY(data.emergencyFund.surplusAmount)} fazla`,
      },
      { label: "Durum etiketi", value: data.emergencyFund.statusLabel },
    ],
    y
  );

  y = addSectionTitle(doc, "Satın Alma Gücü Özeti", y);
  y = addKeyValueRows(
    doc,
    [
      { label: "Toplam TL varlık", value: formatCurrencyTRY(data.purchasingPower.totalTryAssets) },
      { label: "USD karşılığı", value: formatCurrencyUSD(data.purchasingPower.usdValue) },
      { label: "EUR karşılığı", value: formatCurrencyEUR(data.purchasingPower.eurValue) },
      { label: "Veri yaklaşımı", value: data.purchasingPower.sourceLabel },
      { label: "Not", value: data.purchasingPower.note },
    ],
    y
  );

  y = addSectionTitle(doc, "AI Finans Koçu Özeti", y);
  y = addTextBlock(doc, data.copilotSummary, y);

  y = addSectionTitle(doc, "Sonuç ve Uyarı", y);
  y = addTextBlock(doc, data.conclusion, y);
  addTextBlock(doc, data.disclaimer, y);
  addReportFooters(doc, data.generatedAt);
}

export async function generateFinancialReportPdf(snapshot: FinanceSnapshot): Promise<void> {
  const data = buildFinancialReportData(snapshot);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  renderFinancialReport(doc, data);
  doc.save(`finwise-finansal-analiz-raporu-${data.fileDate}.pdf`);
}
