export type MarketDataSource = "live" | "fallback" | "demo" | "derived";

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

const MARKET_DATA_TIMEOUT_MS = 10000;

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
    const response = await fetch("/api/market-data", {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!isPositiveNumber(data.usdTry) || !isPositiveNumber(data.eurTry) || !isPositiveNumber(data.gbpTry)) {
      throw new Error("API response is missing required currency rates");
    }

    const items: MarketTickerItem[] = [
      createCurrencyItem("USD/TRY", "Amerikan Doları", data.usdTry, "live", 0.12),
      createCurrencyItem("EUR/TRY", "Euro", data.eurTry, "live", -0.08),
      createCurrencyItem("GBP/TRY", "İngiliz Sterlini", data.gbpTry, "live", 0.05),
    ];

    if (isPositiveNumber(data.bist100)) {
      items.push({
        symbol: "BIST100",
        label: "BIST 100",
        value: data.bist100,
        formattedValue: plainNumberFormatter.format(data.bist100),
        changePercent: typeof data.bist100Change === "number" ? data.bist100Change : undefined,
        source: "live",
      });
    } else {
      items.push(createDemoIndexItem("fallback"));
    }

    if (isPositiveNumber(data.goldTry)) {
      items.push({
        symbol: "XAU/TRY",
        label: "Gram Altın",
        value: data.goldTry,
        formattedValue: formatTryRate(data.goldTry),
        changePercent: typeof data.goldChange === "number" ? data.goldChange : undefined,
        source: "derived",
      });
    } else {
      items.push(createDemoGoldItem("fallback"));
    }

    const now = new Date().toISOString();

    return {
      items,
      source: "live",
      sourceLabel: "Döviz: canlı kaynak",
      updatedAt: data.updatedAt || now,
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
    isDemo: true, // Mark as demo ONLY when fallback
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
    isDemo: true, // Mark as demo ONLY when fallback
  };
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
