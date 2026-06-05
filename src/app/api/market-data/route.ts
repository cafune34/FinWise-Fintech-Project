import { NextResponse } from "next/server";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    // Fetch Frankfurter Rates
    const frankfurterPromise = fetch("https://api.frankfurter.dev/v2/rates?base=USD&quotes=TRY,EUR,GBP", {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) throw new Error("Frankfurter failed");
      return res.json();
    });

    // Fetch BIST100 from Yahoo Finance
    const bist100Promise = fetch("https://query1.finance.yahoo.com/v8/finance/chart/XU100.IS?range=1d&interval=1m", {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) throw new Error("Yahoo Finance BIST100 failed");
      return res.json();
    });

    // Fetch Gold Ounce from Yahoo Finance
    const goldPromise = fetch("https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1d&interval=1m", {
      signal: controller.signal,
    }).then((res) => {
      if (!res.ok) throw new Error("Yahoo Finance Gold failed");
      return res.json();
    });

    // Settle all promises
    const [frankfurterRes, bist100Res, goldRes] = await Promise.allSettled([
      frankfurterPromise,
      bist100Promise,
      goldPromise,
    ]);

    clearTimeout(timeoutId);

    // Parse Frankfurter
    let usdTry = null;
    let eurTry = null;
    let gbpTry = null;
    if (frankfurterRes.status === "fulfilled") {
      const data = frankfurterRes.value;
      let rawUsdTry = 0, rawEur = 0, rawGbp = 0;
      if (Array.isArray(data)) {
        for (const row of data) {
          if (row.quote === "TRY") rawUsdTry = row.rate;
          if (row.quote === "EUR") rawEur = row.rate;
          if (row.quote === "GBP") rawGbp = row.rate;
        }
        if (rawUsdTry > 0 && rawEur > 0 && rawGbp > 0) {
          usdTry = rawUsdTry;
          eurTry = rawUsdTry / rawEur;
          gbpTry = rawUsdTry / rawGbp;
        }
      }
    }

    // Parse BIST100
    let bist100 = null;
    let bist100Change = null;
    if (bist100Res.status === "fulfilled") {
      try {
        const meta = bist100Res.value?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          bist100 = meta.regularMarketPrice;
          if (meta.chartPreviousClose) {
            bist100Change = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100;
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }

    // Parse Gold
    let goldTry = null;
    let goldChange = null;
    if (goldRes.status === "fulfilled" && usdTry) {
      try {
        const meta = goldRes.value?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice) {
          const goldOunceUsd = meta.regularMarketPrice;
          goldTry = (goldOunceUsd * usdTry) / 31.1034768;
          if (meta.chartPreviousClose) {
            goldChange = ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100;
          }
        }
      } catch {
        // Ignore parsing errors
      }
    }

    return NextResponse.json({
      usdTry,
      eurTry,
      gbpTry,
      bist100,
      bist100Change,
      goldTry,
      goldChange,
      updatedAt: new Date().toISOString(),
    });

  } catch {
    return NextResponse.json({ error: "Market data fetch failed" }, { status: 500 });
  }
}
