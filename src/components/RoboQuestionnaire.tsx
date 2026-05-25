"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RoboAllocationChart from "@/components/RoboAllocationChart";
import RoboResultCard from "@/components/RoboResultCard";
import {
  calculateRiskScore,
  getPortfolioAllocation,
  getRiskProfile,
  getRiskProfileDescription,
} from "@/lib/roboAdvisor";
import { useFinanceData } from "@/lib/useFinanceData";
import type { RoboAnswer, RoboQuestion } from "@/types/finance";

type RoboQuestionnaireProps = {
  questions: RoboQuestion[];
};

function formatDateTimeTR(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function RoboQuestionnaire({ questions }: RoboQuestionnaireProps) {
  const { lastRoboResult, saveRoboProfileResult } = useFinanceData();
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, RoboAnswer>>({});
  const savedSignatureRef = useRef("");

  function handleAnswerChange(questionId: string, selectedValue: string, score: 1 | 2 | 3) {
    setAnswersByQuestionId((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedValue,
        score,
      },
    }));
  }

  const allAnswered = questions.every((question) => Boolean(answersByQuestionId[question.id]));
  const answeredCount = Object.keys(answersByQuestionId).length;
  const answers = useMemo(
    () =>
      questions
        .map((question) => answersByQuestionId[question.id])
        .filter((answer): answer is RoboAnswer => Boolean(answer)),
    [answersByQuestionId, questions]
  );
  const answerSignature = useMemo(
    () => answers.map((answer) => `${answer.questionId}:${answer.selectedValue}`).join("|"),
    [answers]
  );

  const result = useMemo(() => {
    if (!allAnswered) {
      return null;
    }

    const score = calculateRiskScore(answers);
    const profile = getRiskProfile(score);
    const allocation = getPortfolioAllocation(profile);

    return {
      score,
      profile,
      allocation,
    };
  }, [allAnswered, answers]);

  useEffect(() => {
    if (!result || !answerSignature || savedSignatureRef.current === answerSignature) {
      return;
    }

    savedSignatureRef.current = answerSignature;
    saveRoboProfileResult({
      score: result.score,
      profile: result.profile,
      allocation: result.allocation,
      answers,
    });
  }, [answerSignature, answers, result, saveRoboProfileResult]);

  return (
    <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.72fr)]">
      <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
        <h3 className="text-base font-semibold text-white">Risk Profili Analizi</h3>
        <p className="mt-2 text-sm text-slate-300">
          Tüm soruları yanıtladığınızda risk profili ve önerilen dağılım otomatik oluşturulur.
        </p>

        <div className="mt-4 space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-slate-100">
                {index + 1}. {question.question}
              </p>

              <div className="mt-3 space-y-2">
                {question.options.map((option) => {
                  const inputId = `${question.id}-${option.value}`;

                  return (
                    <label
                      key={option.value}
                      htmlFor={inputId}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-cyan-400/60"
                    >
                      <input
                        id={inputId}
                        name={question.id}
                        type="radio"
                        value={option.value}
                        checked={answersByQuestionId[question.id]?.selectedValue === option.value}
                        onChange={() => handleAnswerChange(question.id, option.value, option.score)}
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </article>

      <aside className="space-y-4">
        {result ? (
          <>
            <RoboResultCard score={result.score} profile={result.profile} allocation={result.allocation} />
            <RoboAllocationChart data={result.allocation} />
          </>
        ) : (
          <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
            <h3 className="text-base font-semibold text-white">Canlı profil özeti</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Sorular yanıtlandıkça profil analizi hazırlanır. Sonuç panelinde skor ve önerilen dağılım birlikte gösterilir.
            </p>
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-4">
              <p className="text-sm text-slate-400">Yanıtlanan soru</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-200">
                {answeredCount}/{questions.length}
              </p>
              <div className="mt-4 h-2 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}
                />
              </div>
            </div>
          </article>
        )}

        {lastRoboResult ? (
          <article className="rounded-xl border border-white/10 bg-slate-950/45 p-5 shadow-xl shadow-black/10">
            <h3 className="text-base font-semibold text-white">Son profil sonucu</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <p>
                Profil: <span className="font-semibold text-white">{getRiskProfileDescription(lastRoboResult.profile)}</span>
              </p>
              <p>
                Skor: <span className="font-semibold text-white">{lastRoboResult.score}</span> / 15
              </p>
              <p>Analiz tarihi: {formatDateTimeTR(lastRoboResult.analyzedAt)}</p>
            </div>
          </article>
        ) : null}
      </aside>
    </div>
  );
}
