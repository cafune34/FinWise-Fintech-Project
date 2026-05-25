"use client";

import { useMemo, useState } from "react";
import RoboAllocationChart from "@/components/RoboAllocationChart";
import RoboResultCard from "@/components/RoboResultCard";
import {
  calculateRiskScore,
  getPortfolioAllocation,
  getRiskProfile,
} from "@/lib/roboAdvisor";
import type { RoboAnswer, RoboQuestion } from "@/types/finance";

type RoboQuestionnaireProps = {
  questions: RoboQuestion[];
};

export default function RoboQuestionnaire({ questions }: RoboQuestionnaireProps) {
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, RoboAnswer>>({});

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

  const result = useMemo(() => {
    if (!allAnswered) {
      return null;
    }

    const answers = questions
      .map((question) => answersByQuestionId[question.id])
      .filter((answer): answer is RoboAnswer => Boolean(answer));

    const score = calculateRiskScore(answers);
    const profile = getRiskProfile(score);
    const allocation = getPortfolioAllocation(profile);

    return {
      score,
      profile,
      allocation,
    };
  }, [allAnswered, answersByQuestionId, questions]);

  return (
    <div className="space-y-4">
      <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h3 className="text-base font-semibold text-white">Risk Anketi</h3>
        <p className="mt-2 text-sm text-slate-300">
          Tüm soruları yanıtladığınızda risk profili ve önerilen dağılım otomatik oluşturulur.
        </p>

        <div className="mt-4 space-y-4">
          {questions.map((question, index) => (
            <div key={question.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
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
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-400/60"
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

      {result ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <RoboResultCard score={result.score} profile={result.profile} allocation={result.allocation} />
          <RoboAllocationChart data={result.allocation} />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-400">
          Sonucu görmek için 5 sorunun tamamını yanıtlayın.
        </p>
      )}
    </div>
  );
}

