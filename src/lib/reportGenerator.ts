import html2canvas from "html2canvas";
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

const PDF_PAGE_WIDTH = 210;
const PDF_PAGE_HEIGHT = 297;
const REPORT_RENDER_WIDTH = 794;
const REPORT_PAGE_SAFE_GAP = 28;
const RISKY_CATEGORIES = new Set<TransactionCategory>(["transfer", "yatirim", "kira", "fatura"]);
const REPORT_DISCLAIMER =
  "Bu rapor yatırım tavsiyesi değildir; eğitim amaçlı akademik fintech karar destek prototipidir.";

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

  return "Snapshot, nakit akışı ve güvenlik fonu perspektifinde izlenebilir bir finansal görünüm sunuyor.";
}

export function formatCurrencyTRY(value: number): string {
  return `₺${new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
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
    month: "long",
    year: "numeric",
  }).format(date);
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
      "API çağrısı yapılmadan mevcut Copilot context özetinden yararlanılmıştır. " +
      "Para Akış Haritası modülü, gelirin gider kategorilerine görsel dağılımını ayrı sayfada sunar. " +
      "Harcama Isı Haritası modülü, günlük harcama yoğunluğunu takvim görünümünde ayrı sayfada sunar. " +
      "What-if Simülatörü ayrı bir sayfa olarak kullanılabilir. " +
      "Enflasyon Zaman Tüneli modülü, TL'nin yıllara göre demo satın alma gücü analizini ayrı sayfada sunar. " +
      "Karbon Ayak İzi modülü, harcama kategorilerini demo ESG katsayılarıyla analiz eder. " +
      `En son verilere göre tahmini toplam salınım ${formatKgCo2(carbonResult.totalEstimatedKgCo2)} düzeyindedir.`,
    conclusion: buildConclusion({
      netCashFlow: context.netCashFlow,
      behavioralHighRiskCount,
      emergencyStatusLabel: emergencyFund.statusLabel,
    }),
    disclaimer: REPORT_DISCLAIMER,
  };
}

function createElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function appendChildren(parent: HTMLElement, children: HTMLElement[]): HTMLElement {
  children.forEach((child) => parent.appendChild(child));
  return parent;
}

function createKeyValueRows(rows: KeyValueRow[]): HTMLElement {
  const list = createElement("div", "kv-list");

  rows.forEach((row) => {
    const item = createElement("div", "kv-row");
    item.dataset.pdfBlock = "true";
    item.appendChild(createElement("div", "kv-label", row.label));
    item.appendChild(createElement("div", "kv-value", row.value));
    list.appendChild(item);
  });

  return list;
}

function createSection(title: string, children: HTMLElement[]): HTMLElement {
  const section = createElement("section", "report-section");
  section.dataset.pdfBlock = "true";
  section.appendChild(createElement("h2", "section-title", title));
  appendChildren(section, children);

  return section;
}

function createParagraph(text: string): HTMLElement {
  const paragraph = createElement("p", "report-copy", text);
  paragraph.dataset.pdfBlock = "true";

  return paragraph;
}

function createBulletList(items: string[]): HTMLElement {
  if (items.length === 0) {
    return createParagraph("Bu bölüm için yeterli veri bulunmuyor.");
  }

  const list = createElement("ul", "bullet-list");

  items.forEach((item) => {
    const bullet = createElement("li", undefined, item);
    bullet.dataset.pdfBlock = "true";
    list.appendChild(bullet);
  });

  return list;
}

function createBehavioralInsightCards(data: FinancialReportData): HTMLElement {
  const wrapper = createElement("div", "insight-list");

  data.behavioralInsights.slice(0, 5).forEach((insight, index) => {
    const card = createElement("article", "insight-card");
    card.dataset.pdfBlock = "true";
    card.appendChild(createElement("h3", "card-title", `İçgörü ${index + 1}: ${getBehavioralBiasLabel(insight.type)}`));
    card.appendChild(
      createKeyValueRows([
        { label: "Kanıt", value: insight.evidence },
        { label: "Risk seviyesi", value: getBehavioralRiskLabel(insight.riskLevel) },
        { label: "Öneri", value: insight.recommendation },
      ])
    );
    wrapper.appendChild(card);
  });

  return wrapper;
}

function createRiskyTransactionRows(data: FinancialReportData): HTMLElement {
  if (data.riskyTransactions.length === 0) {
    return createParagraph("Riskli veya yüksek tutarlı işlem bulunamadı.");
  }

  return createKeyValueRows(
    data.riskyTransactions.map((transaction, index) => ({
      label: `İşlem ${index + 1}`,
      value: `${transaction.title} | ${transaction.categoryLabel} | ${formatCurrencyTRY(
        transaction.amount
      )} | ${formatDate(transaction.occurredAt)}`,
    }))
  );
}

function createReportStyles(): HTMLStyleElement {
  const style = document.createElement("style");

  style.textContent = `
    .finwise-report,
    .finwise-report * {
      box-sizing: border-box;
    }

    .finwise-report {
      width: ${REPORT_RENDER_WIDTH}px;
      min-height: 100%;
      background: #ffffff;
      color: #0f172a;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      letter-spacing: 0;
    }

    .report-header {
      background: #07111f;
      color: #e2e8f0;
      padding: 34px 48px 30px;
    }

    .brand-row {
      align-items: center;
      display: flex;
      justify-content: space-between;
      gap: 24px;
    }

    .brand {
      color: #67e8f9;
      font-size: 18px;
      font-weight: 800;
    }

    .badge {
      border: 1px solid rgba(103, 232, 249, 0.38);
      border-radius: 999px;
      color: #cffafe;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 10px;
      text-transform: uppercase;
    }

    .report-title {
      color: #ffffff;
      font-size: 31px;
      line-height: 1.15;
      margin: 24px 0 10px;
    }

    .report-subtitle {
      color: #cbd5e1;
      font-size: 14px;
      margin: 0;
      max-width: 620px;
    }

    .meta-grid {
      display: grid;
      gap: 10px;
      grid-template-columns: 1fr 1fr;
      margin-top: 22px;
    }

    .meta-card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .meta-label {
      color: #94a3b8;
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .meta-value {
      color: #ffffff;
      display: block;
      font-size: 14px;
      font-weight: 700;
      margin-top: 2px;
      overflow-wrap: anywhere;
    }

    .intro-note {
      background: #ecfeff;
      border-bottom: 1px solid #bae6fd;
      color: #164e63;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      padding: 16px 48px;
    }

    .report-section {
      padding: 24px 48px 0;
    }

    .section-title {
      border-bottom: 2px solid #22d3ee;
      color: #0f172a;
      font-size: 18px;
      line-height: 1.2;
      margin: 0 0 14px;
      padding-bottom: 8px;
    }

    .kv-list {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }

    .kv-row {
      display: grid;
      gap: 16px;
      grid-template-columns: 190px minmax(0, 1fr);
      min-height: 42px;
      padding: 10px 14px;
    }

    .kv-row:nth-child(odd) {
      background: #f8fafc;
    }

    .kv-row + .kv-row {
      border-top: 1px solid #e2e8f0;
    }

    .kv-label {
      color: #475569;
      font-size: 12px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .kv-value {
      color: #0f172a;
      font-size: 13px;
      font-weight: 600;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .report-copy {
      color: #334155;
      font-size: 14px;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .bullet-list {
      color: #334155;
      margin: 12px 0 0;
      padding-left: 20px;
    }

    .bullet-list li {
      margin: 7px 0;
      overflow-wrap: anywhere;
    }

    .insight-list {
      display: grid;
      gap: 12px;
    }

    .insight-card {
      border: 1px solid #dbeafe;
      border-radius: 8px;
      overflow: hidden;
    }

    .card-title {
      background: #eff6ff;
      color: #1e3a8a;
      font-size: 14px;
      line-height: 1.3;
      margin: 0;
      padding: 10px 14px;
    }

    .subheading {
      color: #0f172a;
      font-size: 14px;
      margin: 14px 0 8px;
    }

    .report-footer {
      color: #64748b;
      font-size: 11px;
      margin-top: 28px;
      padding: 0 48px 34px;
      text-align: center;
    }
  `;

  return style;
}

function createReportElement(data: FinancialReportData): HTMLElement {
  const host = createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.left = "-10000px";
  host.style.pointerEvents = "none";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.width = `${REPORT_RENDER_WIDTH}px`;
  host.style.zIndex = "-1";

  const report = createElement("div", "finwise-report");
  const header = createElement("header", "report-header");
  const brandRow = createElement("div", "brand-row");
  brandRow.appendChild(createElement("div", "brand", "FinWise"));
  brandRow.appendChild(createElement("div", "badge", "Yatırım Tavsiyesi Değildir"));
  header.appendChild(brandRow);
  header.appendChild(createElement("h1", "report-title", "FinWise Finansal Analiz Raporu"));
  header.appendChild(
    createElement(
      "p",
      "report-subtitle",
      "Tek tık finansal analiz PDF'i; eğitim amaçlı akademik fintech karar destek prototipi."
    )
  );

  const metaGrid = createElement("div", "meta-grid");
  metaGrid.appendChild(
    appendChildren(createElement("div", "meta-card"), [
      createElement("span", "meta-label", "Kullanıcı"),
      createElement("span", "meta-value", data.user.fullName),
    ])
  );
  metaGrid.appendChild(
    appendChildren(createElement("div", "meta-card"), [
      createElement("span", "meta-label", "Rapor Tarihi"),
      createElement("span", "meta-value", formatDate(data.generatedAt)),
    ])
  );
  header.appendChild(metaGrid);
  report.appendChild(header);
  report.appendChild(
    createElement(
      "p",
      "intro-note",
      "Eğitim amaçlı finansal analiz prototipi. Bu rapor yatırım tavsiyesi değildir."
    )
  );

  report.appendChild(
    createSection("Kullanıcı Özeti", [
      createKeyValueRows([
        { label: "Kullanıcı adı", value: data.user.fullName },
        { label: "Risk profili", value: data.user.riskProfileLabel },
        { label: "Toplam hesap sayısı", value: String(data.user.accountCount) },
        { label: "Toplam varlık", value: formatCurrencyTRY(data.user.totalAssets) },
        { label: "Snapshot Güncelleme Tarihi", value: formatDate(data.user.updatedAt) },
      ]),
    ])
  );

  report.appendChild(
    createSection("Genel Finans ve Bütçe Özeti", [
      createKeyValueRows([
        { label: "Toplam TL varlık", value: formatCurrencyTRY(data.finance.totalTryAssets) },
        { label: "Aylık gelir", value: formatCurrencyTRY(data.finance.monthlyIncome) },
        { label: "Aylık gider", value: formatCurrencyTRY(data.finance.monthlyExpense) },
        { label: "Nakit akışı", value: formatCurrencyTRY(data.finance.netCashFlow) },
        {
          label: "En yüksek harcama kategorileri",
          value:
            data.finance.topExpenseCategories
              .map((category) => `${category.label}: ${formatCurrencyTRY(category.amount)}`)
              .join(" | ") || "Belirgin kategori yok",
        },
        { label: "Bekleyen ödeme tutarı", value: formatCurrencyTRY(data.finance.pendingPaymentAmount) },
      ]),
    ])
  );

  report.appendChild(createSection("Riskli İşlemler", [createRiskyTransactionRows(data)]));

  report.appendChild(
    createSection("Davranışsal Finans İçgörüleri", [
      createKeyValueRows([{ label: "Risk aralığı", value: "Düşük / Orta / Yüksek" }]),
      createBehavioralInsightCards(data),
    ])
  );

  report.appendChild(
    createSection("Harcama DNA'sı", [
      createKeyValueRows([
        { label: "Ana profil", value: data.spendingDna.primaryProfile.label },
        { label: "İkincil eğilim", value: data.spendingDna.secondaryProfile?.label ?? "Belirgin değil" },
        { label: "Risk seviyesi", value: riskProfileLabels[data.spendingDna.riskLevel] },
        { label: "Profil skoru", value: `${data.spendingDna.primaryProfile.score}/100` },
      ]),
      createElement("h3", "subheading", "Öneriler"),
      createBulletList(data.spendingDna.recommendations.slice(0, 3)),
    ])
  );

  report.appendChild(
    createSection("Acil Durum Fonu", [
      createKeyValueRows([
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
      ]),
    ])
  );

  report.appendChild(
    createSection("Satın Alma Gücü Özeti", [
      createKeyValueRows([
        { label: "Toplam TL varlık", value: formatCurrencyTRY(data.purchasingPower.totalTryAssets) },
        { label: "USD karşılığı", value: formatCurrencyUSD(data.purchasingPower.usdValue) },
        { label: "EUR karşılığı", value: formatCurrencyEUR(data.purchasingPower.eurValue) },
        { label: "Veri yaklaşımı", value: data.purchasingPower.sourceLabel },
        { label: "Not", value: data.purchasingPower.note },
      ]),
    ])
  );

  report.appendChild(createSection("AI Finans Koçu Özeti", [createParagraph(data.copilotSummary)]));
  report.appendChild(createSection("Sonuç ve Uyarı", [createParagraph(data.conclusion), createParagraph(data.disclaimer)]));
  report.appendChild(createElement("footer", "report-footer", `FinWise Report | ${formatDate(data.generatedAt)}`));

  host.appendChild(createReportStyles());
  host.appendChild(report);

  return host;
}

function applyPdfPageBreaks(report: HTMLElement): void {
  const pageHeight = (report.offsetWidth * PDF_PAGE_HEIGHT) / PDF_PAGE_WIDTH;
  const blocks = Array.from(report.querySelectorAll<HTMLElement>("[data-pdf-block]"));

  blocks.forEach((block) => {
    const blockHeight = block.offsetHeight;

    if (blockHeight <= 0 || blockHeight >= pageHeight - REPORT_PAGE_SAFE_GAP * 2) {
      return;
    }

    const pageOffset = block.offsetTop % pageHeight;

    if (pageOffset > REPORT_PAGE_SAFE_GAP && pageOffset + blockHeight > pageHeight - REPORT_PAGE_SAFE_GAP) {
      block.style.marginTop = `${pageHeight - pageOffset + REPORT_PAGE_SAFE_GAP}px`;
    }
  });
}

function addCanvasPagesToPdf(doc: jsPDF, canvas: HTMLCanvasElement): void {
  const pageHeightPx = Math.floor((canvas.width * PDF_PAGE_HEIGHT) / PDF_PAGE_WIDTH);
  let sourceY = 0;
  let pageIndex = 0;

  while (sourceY < canvas.height) {
    const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;

    const context = pageCanvas.getContext("2d");

    if (!context) {
      throw new Error("PDF canvas context could not be created.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (pageIndex > 0) {
      doc.addPage();
    }

    doc.addImage(pageCanvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, PDF_PAGE_WIDTH, PDF_PAGE_HEIGHT);
    sourceY += pageHeightPx;
    pageIndex += 1;
  }
}

async function waitForBrowserFonts(): Promise<void> {
  await document.fonts.ready;
}

export async function generateFinancialReportPdf(snapshot: FinanceSnapshot): Promise<void> {
  const data = buildFinancialReportData(snapshot);
  const reportHost = createReportElement(data);
  document.body.appendChild(reportHost);

  try {
    await waitForBrowserFonts();

    const reportElement = reportHost.querySelector<HTMLElement>(".finwise-report");

    if (!reportElement) {
      throw new Error("Financial report HTML could not be prepared.");
    }

    applyPdfPageBreaks(reportElement);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const canvas = await html2canvas(reportElement, {
      backgroundColor: "#ffffff",
      logging: false,
      scale: Math.min(window.devicePixelRatio * 1.5, 2),
      useCORS: true,
      windowWidth: REPORT_RENDER_WIDTH,
    });
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    addCanvasPagesToPdf(doc, canvas);
    doc.save(`finwise-finansal-analiz-raporu-${data.fileDate}.pdf`);
  } finally {
    reportHost.remove();
  }
}
