import { NextResponse } from "next/server";
import {
  COPILOT_DISCLAIMER,
  type CopilotFinanceContext,
  type CopilotResponseBody,
} from "@/lib/copilotTypes";
import { generateCopilotFallbackAnswer } from "@/lib/copilotFallback";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 12000;

type RecordValue = Record<string, unknown>;

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensureDisclaimer(answer: string): string {
  return answer.includes(COPILOT_DISCLAIMER) ? answer : `${answer.trim()}\n\n${COPILOT_DISCLAIMER}`;
}

function fallbackResponse(question: string, context: CopilotFinanceContext): NextResponse<CopilotResponseBody> {
  return NextResponse.json({
    answer: generateCopilotFallbackAnswer(question, context),
    source: "fallback",
    disclaimer: COPILOT_DISCLAIMER,
  });
}

function buildGeminiPrompt(question: string, context: CopilotFinanceContext): string {
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

function extractGeminiAnswer(payload: GeminiGenerateContentResponse): string | null {
  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter((partText): partText is string => Boolean(partText?.trim()))
    .join("\n")
    .trim();

  return text && text.length > 0 ? text : null;
}

async function requestGeminiAnswer(question: string, context: CopilotFinanceContext): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
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
            maxOutputTokens: 700,
          },
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as GeminiGenerateContentResponse;
    return extractGeminiAnswer(payload);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  let question = "";
  let context: CopilotFinanceContext | null = null;

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

    const geminiAnswer = await requestGeminiAnswer(question, context);

    if (!geminiAnswer) {
      return fallbackResponse(question, context);
    }

    return NextResponse.json({
      answer: ensureDisclaimer(geminiAnswer),
      source: "gemini",
      disclaimer: COPILOT_DISCLAIMER,
    } satisfies CopilotResponseBody);
  } catch {
    if (question && context) {
      return fallbackResponse(question, context);
    }

    return NextResponse.json({ error: "Copilot isteği işlenemedi." }, { status: 400 });
  }
}
