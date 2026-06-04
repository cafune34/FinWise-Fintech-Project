"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, Loader2, Send, UserRound } from "lucide-react";
import { clsx } from "clsx";
import CopilotSuggestionCard from "@/components/copilot/CopilotSuggestionCard";
import { generateCopilotFallbackAnswer } from "@/lib/copilotFallback";
import { buildCopilotFinanceContext } from "@/lib/copilotContext";
import {
  COPILOT_DISCLAIMER,
  type CopilotMessageSource,
  type CopilotResponseBody,
} from "@/lib/copilotTypes";
import type { FinanceSnapshot } from "@/lib/storage";
import { useFinanceData } from "@/lib/useFinanceData";

const SUGGESTED_QUESTIONS = [
  "Bu ay neden tasarruf edemedim?",
  "En çok nereye para harcadım?",
  "Bütçem riskte mi?",
  "Hangi harcamaları azaltmalıyım?",
  "Bekleyen ödemelerim risk oluşturuyor mu?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: CopilotMessageSource;
};

function createMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isCopilotResponseBody(value: unknown): value is CopilotResponseBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<CopilotResponseBody>;
  return (
    typeof candidate.answer === "string" &&
    (candidate.source === "gemini" || candidate.source === "fallback") &&
    candidate.disclaimer === COPILOT_DISCLAIMER
  );
}

export default function CopilotChat() {
  const financeData = useFinanceData();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const snapshot = useMemo<FinanceSnapshot>(
    () => ({
      version: financeData.version,
      user: financeData.user,
      accounts: financeData.accounts,
      transactions: financeData.transactions,
      budgets: financeData.budgets,
      paymentOrders: financeData.paymentOrders,
      roboResults: financeData.roboResults,
      updatedAt: financeData.updatedAt,
    }),
    [
      financeData.accounts,
      financeData.budgets,
      financeData.paymentOrders,
      financeData.roboResults,
      financeData.transactions,
      financeData.updatedAt,
      financeData.user,
      financeData.version,
    ]
  );

  const copilotContext = useMemo(() => buildCopilotFinanceContext(snapshot), [snapshot]);

  async function sendQuestion(question: string) {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading || !financeData.hydrated) {
      return;
    }

    setStatusMessage(null);
    setInputValue("");
    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmedQuestion,
          context: copilotContext,
        }),
      });

      const payload = (await response.json()) as unknown;

      if (!response.ok || !isCopilotResponseBody(payload)) {
        throw new Error("Copilot yanıtı doğrulanamadı.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content: payload.answer,
          source: payload.source,
        },
      ]);
    } catch {
      setStatusMessage("Bağlantı sorunu oluştu; yerel analiz gösteriliyor.");
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          content: generateCopilotFallbackAnswer(trimmedQuestion, copilotContext),
          source: "fallback",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendQuestion(inputValue);
  }

  return (
    <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Hazır sorular</p>
              <h3 className="mt-1 text-base font-semibold text-white">Hızlı analiz başlat</h3>
            </div>
            <Bot className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="mt-4 grid gap-3">
            {SUGGESTED_QUESTIONS.map((question) => (
              <CopilotSuggestionCard
                key={question}
                question={question}
                disabled={isLoading || !financeData.hydrated}
                onSelect={sendQuestion}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0b1220]/80 p-5 shadow-xl shadow-black/10">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Context özeti</p>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Hesap</span>
              <span className="font-semibold text-white">{copilotContext.accountCount}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Riskli bütçe</span>
              <span className="font-semibold text-amber-300">
                {copilotContext.exceededBudgets.length + copilotContext.nearLimitBudgets.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Riskli işlem örneği</span>
              <span className="font-semibold text-cyan-300">{copilotContext.riskyTransactions.length}</span>
            </div>
          </div>
        </section>
      </aside>

      <section className="flex min-h-[640px] flex-col rounded-2xl border border-white/10 bg-[#0b1220]/80 shadow-2xl shadow-black/20">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Sohbet</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Finansal karar desteği</h3>
            </div>
            <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              Güvenli özet context
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[360px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.025] p-6 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-cyan-300/10 text-cyan-300">
                  <Bot className="h-6 w-6" />
                </div>
                <h4 className="mt-4 text-base font-semibold text-white">Bir soru ile başlayın</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Copilot yalnızca özet finans context ile çalışır; ham snapshot veya localStorage verisi gönderilmez.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <article
                  key={message.id}
                  className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}
                >
                  {!isUser && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-300">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={clsx(
                      "max-w-[min(100%,760px)] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-lg",
                      isUser
                        ? "border-cyan-300/30 bg-cyan-300 text-slate-950"
                        : "border-white/10 bg-white/[0.045] text-slate-200"
                    )}
                  >
                    {!isUser && message.source && (
                      <div className="mb-2 flex">
                        <span
                          className={clsx(
                            "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                            message.source === "gemini"
                              ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                              : "border-amber-300/30 bg-amber-300/10 text-amber-200"
                          )}
                        >
                          {message.source === "gemini" ? "AI" : "Yerel analiz"}
                        </span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {isUser && (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10 text-cyan-200">
                      <UserRound className="h-4 w-4" />
                    </div>
                  )}
                </article>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              Copilot analiz ediyor...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
          {statusMessage && (
            <p className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
              {statusMessage}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              ref={inputRef}
              value={inputValue}
              disabled={isLoading || !financeData.hydrated}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={financeData.hydrated ? "Finansal sorunuzu yazın..." : "Veriler yükleniyor..."}
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !financeData.hydrated || inputValue.trim().length === 0}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Gönder
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
