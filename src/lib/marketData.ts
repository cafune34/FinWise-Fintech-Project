export type MarketDataSource = "live" | "fallback" | "demo";

export type MarketTickerItem = {
  symbol: string;
  label: string;
  value: number;
  formattedValue: string;
  changePercent?: number;
  source: MarketDataSource;
  isDemo?: boolean;
};

export type MarketTickerResult = {
  items: MarketTickerItem[];
  source: MarketDataSource;
  sourceLabel: string;
  updatedAt: string;
  error?: string;
};

type FrankfurterRateRow = {
  date?: unknown;
  base?: unknown;
  quote?: unknown;
  rate?: unknown;
};

const MARKET_DATA_TIMEOUT_MS = 8000;
const FRANKFURTER_RATES_URL = "https://api.frankfurter.dev/v2/rates?base=USD&quotes=TRY,EUR,GBP";

const numberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const plainNumberFormatter = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 0,
});

export async function fetchMarketTickerData(): Promise<MarketTickerResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MARKET_DATA_TIMEOUT_MS);

  try {
    const response = await fetch(FRANKFURTER_RATES_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Frankfurter returned ${response.status}`);
    }

    const data: unknown = await response.json();
    const rates = parseFrankfurterRates(data);
    const usdTry = rates.get("TRY");
    const usdEur = rates.get("EUR");
    const usdGbp = rates.get("GBP");

    if (!isPositiveNumber(usdTry) || !isPositiveNumber(usdEur) || !isPositiveNumber(usdGbp)) {
      throw new Error("Frankfurter response is missing required rates");
    }

    const eurTry = usdTry / usdEur;
    const gbpTry = usdTry / usdGbp;
    const now = new Date().toISOString();

    return {
      items: [
        createCurrencyItem("USD/TRY", "Amerikan Doları", usdTry, "live", 0.12),
        createCurrencyItem("EUR/TRY", "Euro", eurTry, "live", -0.08),
        createCurrencyItem("GBP/TRY", "İngiliz Sterlini", gbpTry, "live", 0.05),
        createDemoIndexItem(),
        createDemoGoldItem(),
      ],
      source: "live",
      sourceLabel: "Döviz: canlı kaynak (Frankfurter)",
      updatedAt: now,
    };
  } catch (error) {
    return getFallbackMarketTickerData(error instanceof Error ? error.message : "Piyasa verisi alınamadı");
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getFallbackMarketTickerData(reason?: string): MarketTickerResult {
  const now = new Date().toISOString();

  return {
    items: [
      createCurrencyItem("USD/TRY", "Amerikan Doları", 32.1, "fallback", 0.1),
      createCurrencyItem("EUR/TRY", "Euro", 34.8, "fallback", -0.05),
      createCurrencyItem("GBP/TRY", "İngiliz Sterlini", 40.2, "fallback", 0.03),
      createDemoIndexItem("fallback"),
      createDemoGoldItem("fallback"),
    ],
    source: "fallback",
    sourceLabel: "Fallback veri gösteriliyor",
    updatedAt: now,
    error: reason,
  };
}

export function formatTryRate(value: number): string {
  return `₺${numberFormatter.format(value)}`;
}

export function formatMarketUpdatedAt(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function parseFrankfurterRates(data: unknown): Map<string, number> {
  if (!Array.isArray(data)) {
    throw new Error("Frankfurter response is not an array");
  }

  const rates = new Map<string, number>();

  data.forEach((row: FrankfurterRateRow) => {
    if (typeof row.quote === "string" && typeof row.rate === "number") {
      rates.set(row.quote, row.rate);
    }
  });

  return rates;
}

function createCurrencyItem(
  symbol: string,
  label: string,
  value: number,
  source: MarketDataSource,
  changePercent?: number
): MarketTickerItem {
  return {
    symbol,
    label,
    value,
    formattedValue: formatTryRate(value),
    changePercent,
    source,
  };
}

function createDemoIndexItem(source: MarketDataSource = "demo"): MarketTickerItem {
  return {
    symbol: "BIST100",
    label: "BIST 100",
    value: 10000,
    formattedValue: plainNumberFormatter.format(10000),
    changePercent: 0.42,
    source,
    isDemo: true,
  };
}

function createDemoGoldItem(source: MarketDataSource = "demo"): MarketTickerItem {
  return {
    symbol: "XAU/TRY",
    label: "Gram Altın",
    value: 2450,
    formattedValue: formatTryRate(2450),
    changePercent: 0.18,
    source,
    isDemo: true,
  };
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
