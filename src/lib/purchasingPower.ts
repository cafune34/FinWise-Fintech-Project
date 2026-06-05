import {
  fetchMarketTickerData,
  getFallbackMarketTickerData,
  type MarketDataSource,
  type MarketTickerItem,
  type MarketTickerResult,
} from "@/lib/marketData";
import {
  calculateMonthlyExpense,
  calculateNetCashFlow,
} from "@/lib/finance";
import type { FinanceSnapshot } from "@/lib/storage";

export type PurchasingPowerDataSource = "live" | "fallback" | "demo" | "derived";
export type PurchasingPowerLevel = "dusuk" | "orta" | "yuksek";

export type PurchasingPowerResult = {
  totalTryAssets: number;
  usdValue: number;
  eurValue: number;
  gramGoldValue?: number;
  usdTryRate: number;
  eurTryRate: number;
  gramGoldTryRate?: number;
  gramGoldIsDemo?: boolean;
  source: PurchasingPowerDataSource;
  sourceLabel: string;
  updatedAt: string;
  protectionScore: number;
  protectionLevel: PurchasingPowerLevel;
  protectionComment: string;
  inflationNote: string;
  recommendations: string[];
  disclaimer: string;
  metrics: {
    netCashFlow: number;
    assetExpenseRatio: number;
    mandatoryRatio: number;
  };
};

const FALLBACK_USD_TRY = 32.1;
const FALLBACK_EUR_TRY = 34.8;
const DISCLAIMER = "Yatırım tavsiyesi değildir.";

const tryCurrencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

const usdCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const eurCurrencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 2,
});

export function calculateTotalTryAssets(snapshot: FinanceSnapshot): number {
  return roundMoney(
    snapshot.accounts
      .filter((account) => account.status !== "pasif")
      .filter((account) => account.currency === "TRY")
      .reduce((sum, account) => sum + account.balance, 0)
  );
}

export async function calculatePurchasingPower(snapshot: FinanceSnapshot): Promise<PurchasingPowerResult> {
  try {
    const marketData = await fetchMarketTickerData();
    return buildPurchasingPowerFromRates(snapshot, marketData);
  } catch (error) {
    return getFallbackPurchasingPower(
      snapshot,
      error instanceof Error ? error.message : "Piyasa verisi alınamadı"
    );
  }
}

export function buildPurchasingPowerFromRates(
  snapshot: FinanceSnapshot,
  marketData: MarketTickerResult
): PurchasingPowerResult {
  const usdItem = findMarketItem(marketData.items, "USD/TRY");
  const eurItem = findMarketItem(marketData.items, "EUR/TRY");

  if (!isPositiveNumber(usdItem?.value) || !isPositiveNumber(eurItem?.value)) {
    return getFallbackPurchasingPower(snapshot, "USD/TRY veya EUR/TRY verisi eksik");
  }

  const goldItem = findMarketItem(marketData.items, "XAU/TRY");
  const totalTryAssets = calculateTotalTryAssets(snapshot);
  const usdTryRate = usdItem.value;
  const eurTryRate = eurItem.value;
  const gramGoldTryRate = isPositiveNumber(goldItem?.value) ? goldItem.value : undefined;
  
  const monthlyExpense = calculateMonthlyExpense(snapshot.transactions);
  const netCashFlow = calculateNetCashFlow(snapshot.transactions);
  const assetExpenseRatio = monthlyExpense > 0 ? totalTryAssets / monthlyExpense : totalTryAssets > 0 ? 6 : 0;
  const mandatoryExpense = snapshot.transactions
    .filter((transaction) => transaction.direction === "out")
    .filter((transaction) => ["kira", "fatura", "saglik"].includes(transaction.category))
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const mandatoryRatio = monthlyExpense > 0 ? mandatoryExpense / monthlyExpense : 0;
  
  const metrics = { netCashFlow, assetExpenseRatio, mandatoryRatio };
  const protectionScore = calculateProtectionScore(snapshot, totalTryAssets, metrics);
  const protectionLevel = getProtectionLevel(protectionScore);

  return {
    totalTryAssets,
    usdValue: roundMoney(totalTryAssets / usdTryRate),
    eurValue: roundMoney(totalTryAssets / eurTryRate),
    gramGoldValue: gramGoldTryRate ? roundMoney(totalTryAssets / gramGoldTryRate) : undefined,
    usdTryRate,
    eurTryRate,
    gramGoldTryRate,
    gramGoldIsDemo: Boolean(goldItem?.isDemo),
    source: normalizeSource(marketData.source),
    sourceLabel: marketData.sourceLabel,
    updatedAt: marketData.updatedAt,
    protectionScore,
    protectionLevel,
    protectionComment: buildProtectionComment(protectionLevel, protectionScore),
    inflationNote: buildInflationNote(marketData.source),
    recommendations: buildRecommendations(snapshot, protectionScore),
    disclaimer: DISCLAIMER,
    metrics,
  };
}

export function getFallbackPurchasingPower(snapshot: FinanceSnapshot, reason?: string): PurchasingPowerResult {
  const fallbackData = getFallbackMarketTickerData(reason);
  const result = buildPurchasingPowerFromRates(snapshot, fallbackData);

  return {
    ...result,
    usdTryRate: isPositiveNumber(result.usdTryRate) ? result.usdTryRate : FALLBACK_USD_TRY,
    eurTryRate: isPositiveNumber(result.eurTryRate) ? result.eurTryRate : FALLBACK_EUR_TRY,
    source: "fallback",
    sourceLabel: reason ? `Fallback veri gösteriliyor: ${reason}` : fallbackData.sourceLabel,
  };
}

export function getProtectionLevel(score: number): PurchasingPowerLevel {
  if (score >= 70) return "yuksek";
  if (score >= 40) return "orta";
  return "dusuk";
}

export function formatCurrencyTRY(value: number): string {
  return tryCurrencyFormatter.format(value);
}

export function formatCurrencyUSD(value: number): string {
  return usdCurrencyFormatter.format(value);
}

export function formatCurrencyEUR(value: number): string {
  return eurCurrencyFormatter.format(value);
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function calculateProtectionScore(snapshot: FinanceSnapshot, totalTryAssets: number, metrics: { netCashFlow: number; assetExpenseRatio: number; mandatoryRatio: number }): number {
  const { netCashFlow, assetExpenseRatio, mandatoryRatio } = metrics;
  const investmentTransactions = snapshot.transactions.filter((transaction) => transaction.category === "yatirim");

  let score = 35;

  if (netCashFlow > 0) score += 20;
  if (netCashFlow < 0) score -= 10;

  if (assetExpenseRatio >= 6) score += 25;
  else if (assetExpenseRatio >= 3) score += 16;
  else if (assetExpenseRatio >= 1) score += 8;

  if (investmentTransactions.length > 0) score += 8;

  if (mandatoryRatio > 0.7) score -= 15;
  else if (mandatoryRatio > 0.5) score -= 8;
  else score += 5;

  return clamp(Math.round(score), 0, 100);
}

function buildProtectionComment(level: PurchasingPowerLevel, score: number): string {
  if (level === "yuksek") {
    return `FinWise değer koruma göstergesi ${score}/100. TL varlık görünümü nakit akışı ve gider baskısı açısından güçlü izleniyor.`;
  }

  if (level === "orta") {
    return `FinWise değer koruma göstergesi ${score}/100. Portföy izlenebilir durumda; kur karşılıkları ve zorunlu gider baskısı düzenli takip edilmeli.`;
  }

  return `FinWise değer koruma göstergesi ${score}/100. Nakit akışı, zorunlu giderler ve TL varlık tamponu daha yakından izlenmeli.`;
}

function buildInflationNote(source: MarketDataSource): string {
  const sourceText =
    source === "live"
      ? "Döviz karşılıkları canlı piyasa verisiyle"
      : "Döviz karşılıkları fallback/demo veriyle";

  return `${sourceText} hesaplanır. Bu panel gerçek enflasyon API verisi kullanmaz; TL varlıkların satın alma gücünü eğitim amaçlı ve kur bazlı bir bakışla yorumlar.`;
}

function buildRecommendations(snapshot: FinanceSnapshot, score: number): string[] {
  const netCashFlow = calculateNetCashFlow(snapshot.transactions);
  const monthlyExpense = calculateMonthlyExpense(snapshot.transactions);
  const totalTryAssets = calculateTotalTryAssets(snapshot);
  const recommendations: string[] = [];

  if (netCashFlow < 0) {
    recommendations.push("Net nakit akışı negatifse satın alma gücü baskısını azaltmak için gider ritmi tekrar kontrol edilmeli.");
  } else {
    recommendations.push("Pozitif nakit akışı TL varlık tamponunu korumaya yardımcı olur; aylık fark düzenli izlenmeli.");
  }

  if (monthlyExpense > 0 && totalTryAssets / monthlyExpense < 3) {
    recommendations.push("Toplam TL varlık, aylık giderlerin üç katının altındaysa kısa vadeli güvenlik tamponu güçlendirilebilir.");
  }

  if (score < 70) {
    recommendations.push("Kur bazlı karşılıklar ve zorunlu gider ağırlığı birlikte takip edilerek satın alma gücü değişimi izlenebilir.");
  } else {
    recommendations.push("Mevcut görünüm dengeli; kaynak/fallback etiketiyle kur verisinin güncelliği kontrol edilmeli.");
  }

  return recommendations.slice(0, 3);
}

function findMarketItem(items: MarketTickerItem[], symbol: string): MarketTickerItem | undefined {
  return items.find((item) => item.symbol === symbol);
}

function normalizeSource(source: MarketDataSource): PurchasingPowerDataSource {
  return source === "live" ? "live" : source === "derived" ? "derived" : source === "demo" ? "demo" : "fallback";
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
