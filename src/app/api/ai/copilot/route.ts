import { NextResponse } from "next/server";
import {
  COPILOT_DISCLAIMER,
  type CopilotFinanceContext,
  type CopilotResponseBody,
} from "@/lib/copilotTypes";
import { generateCopilotFallbackAnswer } from "@/lib/copilotFallback";

const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_TIMEOUT_MS = 10000;
const MODELS_TO_TRY = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];

let cachedWorkingModel: string | null = null;

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureDisclaimer(answer: string): string {
  return answer.includes(COPILOT_DISCLAIMER) ? answer : `${answer.trim()}\n\n${COPILOT_DISCLAIMER}`;
}

function formatMoneyPlain(value: number): string {
  return `${Math.round(value).toLocaleString("tr-TR")} TL`;
}

function formatPercentPlain(value: number): string {
  return `%${Math.round(value)}`;
}

function formatRiskLevel(value: CopilotFinanceContext["spendingDna"]["riskLevel"]): string {
  if (value === "yuksek") return "yüksek";
  if (value === "orta") return "orta";
  return "düşük";
}

function getBudgetSignal(context: CopilotFinanceContext): string {
  const riskyBudget = [...context.exceededBudgets, ...context.nearLimitBudgets][0];

  if (riskyBudget) {
    const status = riskyBudget.status === "exceeded" ? "limiti aşmış" : "limite yaklaşıyor";
    return `${riskyBudget.label} bütçesi ${status}: ${formatMoneyPlain(riskyBudget.spent)} / ${formatMoneyPlain(
      riskyBudget.limit
    )} (%${riskyBudget.usagePercent}).`;
  }

  const budgetAlert = context.regTech.topAlerts.find((alert) => {
    const text = `${alert.title} ${alert.reason}`.toLocaleLowerCase("tr-TR");
    return text.includes("bütçe") || text.includes("butce") || text.includes("limit") || text.includes("market");
  });

  if (!budgetAlert) {
    return "Aktif bütçelerde kritik aşım görünmüyor.";
  }

  const budgetAlertText = `${budgetAlert.title} ${budgetAlert.reason}`.toLocaleLowerCase("tr-TR");

  if (budgetAlertText.includes("market")) {
    return `Market bütçesi limite yaklaşıyor: ${budgetAlert.reason}`;
  }

  return `${budgetAlert.title}: ${budgetAlert.reason}`;
}

function buildContextBrief(context: CopilotFinanceContext): string {
  const emergencyCurrentAmount = Math.max(context.emergencyFund.targetAmount - context.emergencyFund.missingAmount, 0);

  return [
    `Kullanıcı: ${context.userFullName}`,
    `Ay: ${context.currentMonthLabel} (${context.currentMonth})`,
    `Aylık gelir: ${formatMoneyPlain(context.monthlyIncome)}`,
    `Aylık gider: ${formatMoneyPlain(context.monthlyExpense)}`,
    `Net nakit akışı: ${formatMoneyPlain(context.netCashFlow)}`,
    `Portföy toplamı: ${formatMoneyPlain(context.portfolioTotal)}`,
    `Acil fon: ${formatMoneyPlain(emergencyCurrentAmount)} / ${formatMoneyPlain(
      context.emergencyFund.targetAmount
    )} (${formatPercentPlain(context.emergencyFund.completionPercentage)})`,
    `RegTech: ${context.regTech.total} sinyal; yüksek ${context.regTech.highSeverityCount}, orta ${context.regTech.mediumSeverityCount}, düşük ${context.regTech.lowSeverityCount}`,
    `Harcama DNA: ${context.spendingDna.primaryProfile}, risk ${formatRiskLevel(context.spendingDna.riskLevel)}`,
    `Bütçe sinyali: ${getBudgetSignal(context)}`,
  ].join("\n");
}

function fallbackResponse(question: string, context: CopilotFinanceContext): NextResponse<CopilotResponseBody> {
  console.info("AI_PROVIDER=fallback");

  return NextResponse.json({
    answer: generateCopilotFallbackAnswer(question, context),
    source: "fallback",
    provider: "fallback",
    disclaimer: COPILOT_DISCLAIMER,
  });
}

function buildGeminiPrompt(question: string, context: CopilotFinanceContext): string {
  if (context.currentMonthLabel) {
    return [
      "Sen FinWise Copilot adlı Türkçe konuşan bir kişisel finans analiz asistanısın.",
      "Kısa, anlaşılır ve finansal dashboard diliyle cevap ver.",
      "Yanıtı 1 kısa paragraf ve gerekirse 2-3 pratik maddeyle sınırla.",
      "Kesin yatırım tavsiyesi verme.",
      "Sadece verilen finans context verisine dayan; banka, işlem, kategori veya tutar uydurma.",
      "Bütçe sorularında gelir, gider, net nakit akışı, acil fon yüzdesi, bütçe sinyali ve risk seviyesinden en az üçünü mutlaka sayısal olarak kullan.",
      "Generic selamlama veya boş özet üretme; sayılar yoksa yanıt geçersiz sayılır.",
      `Yanıtın sonunda şu uyarı aynen yer alsın: ${COPILOT_DISCLAIMER}`,
      "",
      "Zorunlu finans context özeti:",
      buildContextBrief(context),
      "",
      "Ham finans context:",
      JSON.stringify(context, null, 2),
      "",
      `Kullanıcı sorusu: ${question}`,
    ].join("\n");
  }

  return [
    "Sen FinWise Copilot adlı Türkçe konuşan bir kişisel finans analiz asistanısın.",
    "Kısa, anlaşılır ve finansal dashboard diliyle cevap ver.",
    "Yanıtı 3-5 pratik maddeyle sınırla.",
    "Kesin yatırım tavsiyesi verme.",
    "Sadece verilen finans context verisine dayan; banka, işlem, kategori veya tutar uydurma.",
    `Yanıtın sonunda şu uyarı aynen yer alsın: ${COPILOT_DISCLAIMER}`,
    "",
    "Finans context özeti:",
    JSON.stringify(context, null, 2),
    "",
    `Kullanıcı sorusu: ${question}`,
  ].join("\n");
}

function extractGeminiAnswer(payload: unknown): { answer: string | null; candidateCount: number } {
  if (!isRecord(payload) || !Array.isArray(payload.candidates)) {
    return { answer: null, candidateCount: 0 };
  }

  const candidateCount = payload.candidates.length;
  if (candidateCount === 0) {
    return { answer: null, candidateCount: 0 };
  }

  const firstCandidate = payload.candidates[0];

  if (
    !isRecord(firstCandidate) ||
    !isRecord(firstCandidate.content) ||
    !Array.isArray(firstCandidate.content.parts)
  ) {
    return { answer: null, candidateCount };
  }

  const text = firstCandidate.content.parts
    .map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : null))
    .filter((partText): partText is string => Boolean(partText?.trim()))
    .join("\n")
    .trim();

  return { answer: text && text.length > 0 ? text : null, candidateCount };
}

function isFinancialQuestion(question: string): boolean {
  const normalized = question
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");

  const financialKeywords = [
    "butce", "gelir", "gider", "harcama", "nakit", "akis", "tasarruf", "birikim",
    "kart", "borc", "limit", "kategori", "analiz", "risk", "yatirim", "fon",
    "acil", "regtech", "sinyal", "fatura", "odeme", "talimat", "nereye", "kac",
    "ne kadar", "kanal", "kira", "market", "portfoy", "bakiye", "para", "durum"
  ];

  return financialKeywords.some((keyword) => normalized.includes(keyword));
}

function isUsefulGeminiAnswer(
  answer: string,
  question: string,
  context: CopilotFinanceContext
): { useful: boolean; reason: string; isGenericOrTooShort: boolean } {
  const isFinancial = isFinancialQuestion(question);
  const minLength = isFinancial ? 80 : 50;

  if (answer.trim().length < minLength) {
    return {
      useful: false,
      reason: "gemini_generic_or_too_short",
      isGenericOrTooShort: true,
    };
  }

  if (isFinancial) {
    const incomeRaw = Math.round(context.monthlyIncome);
    const expenseRaw = Math.round(context.monthlyExpense);
    const cashFlowRaw = Math.round(context.netCashFlow);
    const portfolioRaw = Math.round(context.portfolioTotal);
    const emergencyPctRaw = Math.round(context.emergencyFund.completionPercentage);

    const evidenceTokens = [
      incomeRaw.toLocaleString("tr-TR"),
      expenseRaw.toLocaleString("tr-TR"),
      cashFlowRaw.toLocaleString("tr-TR"),
      portfolioRaw.toLocaleString("tr-TR"),
      String(incomeRaw),
      String(expenseRaw),
      String(cashFlowRaw),
      String(portfolioRaw),
      String(emergencyPctRaw),
      context.nearLimitBudgets[0]?.label,
      context.exceededBudgets[0]?.label,
      context.regTech.topAlerts[0]?.title,
    ].filter((token): token is string => Boolean(token) && token !== "0");

    const normalizedAnswer = answer.toLocaleLowerCase("tr-TR");
    const matchedEvidenceCount = evidenceTokens.filter((token) =>
      normalizedAnswer.includes(token.toLocaleLowerCase("tr-TR"))
    ).length;

    if (matchedEvidenceCount < 2) {
      return {
        useful: false,
        reason: "gemini_generic_or_too_short",
        isGenericOrTooShort: true,
      };
    }
  }

  return {
    useful: true,
    reason: "none",
    isGenericOrTooShort: false,
  };
}

interface GeminiRequestResult {
  answer: string | null;
  selectedModel: string;
  geminiHttpStatus: number | string;
  fallbackReason: string;
  responseTextLength: number;
  parsedCandidateCount: number;
  isGenericOrTooShort: boolean;
}

async function requestGeminiAnswer(question: string, context: CopilotFinanceContext): Promise<GeminiRequestResult> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const overrideModel = process.env.GEMINI_MODEL?.trim();
  const hasApiKey = apiKey.length > 0;

  if (!hasApiKey) {
    return {
      answer: null,
      selectedModel: overrideModel || DEFAULT_GEMINI_MODEL,
      geminiHttpStatus: "none",
      fallbackReason: "missing_api_key",
      responseTextLength: 0,
      parsedCandidateCount: 0,
      isGenericOrTooShort: false,
    };
  }

  let models: string[];
  if (overrideModel) {
    models = [overrideModel];
  } else if (cachedWorkingModel) {
    models = [cachedWorkingModel, ...MODELS_TO_TRY.filter((m) => m !== cachedWorkingModel)];
  } else {
    models = MODELS_TO_TRY;
  }

  let lastResult: GeminiRequestResult | null = null;

  for (const model of models) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: buildGeminiPrompt(question, context),
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 4000,
            },
          }),
          signal: controller.signal,
        }
      );

      const responseText = await response.text();
      const responseTextLength = responseText.length;

      if (!response.ok) {
        let fallbackReason = `gemini_http_error_${response.status}`;
        if (response.status === 400 || response.status === 404) {
          try {
            const errObj = JSON.parse(responseText);
            const errMsg = errObj?.error?.message?.toLowerCase() || "";
            if (errMsg.includes("model") || errMsg.includes("not found") || errMsg.includes("not supported")) {
              fallbackReason = "invalid_model_name";
            }
          } catch {
            // ignore
          }
        }

        lastResult = {
          answer: null,
          selectedModel: model,
          geminiHttpStatus: response.status,
          fallbackReason,
          responseTextLength,
          parsedCandidateCount: 0,
          isGenericOrTooShort: false,
        };

        if (response.status === 400 || response.status === 404 || response.status === 429) {
          if (!overrideModel && model !== models[models.length - 1]) {
            clearTimeout(timeoutId);
            continue;
          }
        }

        clearTimeout(timeoutId);
        return lastResult;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(responseText);
      } catch {
        clearTimeout(timeoutId);
        lastResult = {
          answer: null,
          selectedModel: model,
          geminiHttpStatus: 200,
          fallbackReason: "gemini_parse_error",
          responseTextLength,
          parsedCandidateCount: 0,
          isGenericOrTooShort: false,
        };
        clearTimeout(timeoutId);
        return lastResult;
      }

      const { answer, candidateCount } = extractGeminiAnswer(payload);

      if (candidateCount === 0) {
        lastResult = {
          answer: null,
          selectedModel: model,
          geminiHttpStatus: 200,
          fallbackReason: "gemini_blocked_or_no_candidates",
          responseTextLength,
          parsedCandidateCount: 0,
          isGenericOrTooShort: false,
        };
        clearTimeout(timeoutId);
        return lastResult;
      }

      if (!answer) {
        lastResult = {
          answer: null,
          selectedModel: model,
          geminiHttpStatus: 200,
          fallbackReason: "gemini_empty_response",
          responseTextLength,
          parsedCandidateCount: candidateCount,
          isGenericOrTooShort: false,
        };
        clearTimeout(timeoutId);
        return lastResult;
      }

      const checkResult = isUsefulGeminiAnswer(answer, question, context);

      if (!checkResult.useful) {
        lastResult = {
          answer: null,
          selectedModel: model,
          geminiHttpStatus: 200,
          fallbackReason: checkResult.reason,
          responseTextLength,
          parsedCandidateCount: candidateCount,
          isGenericOrTooShort: checkResult.isGenericOrTooShort,
        };
        clearTimeout(timeoutId);
        return lastResult;
      }

      if (!overrideModel) {
        cachedWorkingModel = model;
      }

      clearTimeout(timeoutId);
      return {
        answer,
        selectedModel: model,
        geminiHttpStatus: 200,
        fallbackReason: "none",
        responseTextLength,
        parsedCandidateCount: candidateCount,
        isGenericOrTooShort: false,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isTimeout =
        (err instanceof Error && err.name === "AbortError") ||
        controller.signal.aborted;
      const fallbackReason = isTimeout ? "gemini_timeout" : "gemini_network_error";

      lastResult = {
        answer: null,
        selectedModel: model,
        geminiHttpStatus: "none",
        fallbackReason,
        responseTextLength: 0,
        parsedCandidateCount: 0,
        isGenericOrTooShort: false,
      };

      return lastResult;
    }
  }

  return lastResult || {
    answer: null,
    selectedModel: overrideModel || DEFAULT_GEMINI_MODEL,
    geminiHttpStatus: "none",
    fallbackReason: "unknown_error",
    responseTextLength: 0,
    parsedCandidateCount: 0,
    isGenericOrTooShort: false,
  };
}

export async function POST(request: Request) {
  let question = "";
  let context: CopilotFinanceContext | null = null;
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  const hasApiKey = apiKey.length > 0;

  try {
    const body = (await request.json()) as unknown;

    if (!isRecord(body)) {
      return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 });
    }

    if (typeof body.question !== "string" || body.question.trim().length === 0) {
      return NextResponse.json({ error: "question alanı boş olamaz." }, { status: 400 });
    }

    if (!isRecord(body.context)) {
      return NextResponse.json({ error: "context alanı obje olmalıdır." }, { status: 400 });
    }

    question = body.question.trim();
    context = body.context as CopilotFinanceContext;

    if (!hasApiKey) {
      const defaultModel = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
      console.info(
        `AI_DEBUG hasApiKey=false selectedModel=${defaultModel} requestUrlHost=generativelanguage.googleapis.com status=none fallbackReason=missing_api_key responseLength=0 parsedCandidateCount=0 isGenericOrTooShort=false provider=fallback`
      );
      console.info("AI_PROVIDER=fallback");
      return fallbackResponse(question, context);
    }

    const geminiResult = await requestGeminiAnswer(question, context);

    const requestUrlHost = "generativelanguage.googleapis.com";
    const provider = geminiResult.answer ? "gemini" : "fallback";

    console.info(
      `AI_DEBUG hasApiKey=true selectedModel=${geminiResult.selectedModel} requestUrlHost=${requestUrlHost} status=${geminiResult.geminiHttpStatus} fallbackReason=${geminiResult.fallbackReason} responseLength=${geminiResult.responseTextLength} parsedCandidateCount=${geminiResult.parsedCandidateCount} isGenericOrTooShort=${geminiResult.isGenericOrTooShort} provider=${provider}`
    );
    console.info(`AI_PROVIDER=${provider}`);

    if (!geminiResult.answer) {
      return fallbackResponse(question, context);
    }

    return NextResponse.json({
      answer: ensureDisclaimer(geminiResult.answer),
      source: "gemini",
      provider: "gemini",
      disclaimer: COPILOT_DISCLAIMER,
    } satisfies CopilotResponseBody);
  } catch {
    const defaultModel = process.env.GEMINI_MODEL?.trim() || cachedWorkingModel || DEFAULT_GEMINI_MODEL;
    console.info(
      `AI_DEBUG hasApiKey=${hasApiKey} selectedModel=${defaultModel} requestUrlHost=generativelanguage.googleapis.com status=none fallbackReason=unknown_error responseLength=0 parsedCandidateCount=0 isGenericOrTooShort=false provider=fallback`
    );
    console.info("AI_PROVIDER=fallback");

    if (question && context) {
      return fallbackResponse(question, context);
    }

    return NextResponse.json({ error: "Copilot isteği işlenemedi." }, { status: 400 });
  }
}
