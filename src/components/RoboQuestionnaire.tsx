"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RoboAllocationChart from "@/components/RoboAllocationChart";
import {
  calculateRiskScore,
  getPortfolioAllocation,
  getRiskProfile,
  getRiskProfileDescription,
  RISK_PROFILE_DETAILS,
} from "@/lib/roboAdvisor";
import { useFinanceData } from "@/lib/useFinanceData";
import type { RoboAnswer, RoboQuestion, RoboProfileResult } from "@/types/finance";
import { ClipboardList, Clock, RefreshCw, BarChart2, ShieldCheck } from "lucide-react";

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
  const { roboResults, saveRoboProfileResult } = useFinanceData();
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, RoboAnswer>>({});
  const [isClient, setIsClient] = useState(false);
  const savedSignatureRef = useRef("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  function handleReset() {
    setAnswersByQuestionId({});
    savedSignatureRef.current = "";
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

  const currentResult = useMemo(() => {
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

  // Auto-save result once completed
  useEffect(() => {
    if (!currentResult || !answerSignature || savedSignatureRef.current === answerSignature) {
      return;
    }

    savedSignatureRef.current = answerSignature;
    saveRoboProfileResult({
      score: currentResult.score,
      profile: currentResult.profile,
      allocation: currentResult.allocation,
      answers,
    });
  }, [answerSignature, answers, currentResult, saveRoboProfileResult]);

  // Determine the display result (current questionnaire result or last completed result from storage)
  const displayResult = useMemo(() => {
    if (currentResult) {
      return {
        score: currentResult.score,
        profile: currentResult.profile,
        allocation: currentResult.allocation,
        analyzedAt: new Date().toISOString(),
        isCurrent: true,
      };
    }
    if (roboResults && roboResults.length > 0) {
      const last = roboResults[0];
      return {
        score: last.score,
        profile: last.profile,
        allocation: last.allocation,
        analyzedAt: last.analyzedAt,
        isCurrent: false,
      };
    }
    return null;
  }, [currentResult, roboResults]);

  // Calculate Tercih Uyumu score dynamically based on risk score consistency
  const preferenceMatch = useMemo(() => {
    if (!displayResult) return null;
    const score = displayResult.score;
    // Calculate a percentage based on score positioning
    // Max score is 15, min is 5.
    if (score >= 13) return { text: "%98 Optimum Uyum", style: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" };
    if (score >= 10) return { text: "%95 Yüksek Uyum", style: "text-cyan-300 border-cyan-500/30 bg-cyan-500/10" };
    return { text: "%92 Dengeli Uyum", style: "text-amber-300 border-amber-500/30 bg-amber-500/10" };
  }, [displayResult]);

  return (
    <div className="space-y-6">
      {/* Top Grid: Form and Results */}
      <div className="grid w-full gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(480px,0.8fr)]">
        {/* Form Panel */}
        <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-cyan-300" />
              <h3 className="text-base font-semibold text-white">Risk Profili Analizi</h3>
            </div>
            {answeredCount > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300 hover:text-white transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Seçimleri Temizle
              </button>
            )}
          </div>
          <p className="text-sm text-slate-300 mb-5">
            Yatırım hedeflerinize ve risk toleransınıza en uygun portföy dağılımını belirlemek için aşağıdaki soruları yanıtlayın.
          </p>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold text-slate-100">
                  {index + 1}. {question.question}
                </p>

                <div className="mt-3 space-y-2">
                  {question.options.map((option) => {
                    const inputId = `${question.id}-${option.value}`;
                    const isChecked = answersByQuestionId[question.id]?.selectedValue === option.value;

                    return (
                      <label
                        key={option.value}
                        htmlFor={inputId}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm text-slate-200 transition ${
                          isChecked
                            ? "border-cyan-400 bg-cyan-950/10 text-white shadow-md shadow-cyan-400/5"
                            : "border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-slate-950/50"
                        }`}
                      >
                        <input
                          id={inputId}
                          name={question.id}
                          type="radio"
                          value={option.value}
                          checked={isChecked}
                          onChange={() => handleAnswerChange(question.id, option.value, option.score)}
                          className="h-4 w-4 accent-cyan-400 focus:outline-none"
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

        {/* Son Analiz / Result Panel */}
        <aside className="space-y-4">
          {displayResult ? (
            <div className="space-y-4">
              {/* Profile Result Card */}
              <article className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-xl shadow-black/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    <h3 className="text-base font-semibold text-emerald-200">
                      {displayResult.isCurrent ? "Yeni Analiz Sonucu" : "Son Analiz Sonucu"}
                    </h3>
                  </div>
                  {preferenceMatch && (
                    <span className={`rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${preferenceMatch.style}`}>
                      {preferenceMatch.text}
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 border-b border-white/5 pb-4 text-sm text-slate-200">
                  <div>
                    <span className="text-xs text-slate-400 block">Risk Profili:</span>
                    <span className="font-bold text-white text-lg">{getRiskProfileDescription(displayResult.profile)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Risk Skoru:</span>
                    <span className="font-bold text-white text-lg">{displayResult.score} <span className="text-xs font-normal text-slate-400">/ 15</span></span>
                  </div>
                </div>

                {/* Profil Açıklaması */}
                <div className="mt-4">
                  <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Profil Açıklaması</span>
                  <p className="mt-1.5 text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-white/5">
                    {RISK_PROFILE_DETAILS[displayResult.profile]}
                  </p>
                </div>

                {/* Önerilen Portföy Dağılımı List */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Önerilen Portföy Dağılımı</span>
                  <ul className="mt-2.5 space-y-2 text-xs">
                    {displayResult.allocation.map((item) => (
                      <li key={item.asset} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/40 px-3 py-2">
                        <span className="font-medium text-slate-200">{item.asset}</span>
                        <span className="font-bold text-cyan-300">%{item.percentage}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-4 text-[10px] text-slate-400 text-right">
                  Analiz Zamanı: {formatDateTimeTR(displayResult.analyzedAt)}
                </p>
              </article>

              {/* Chart Card */}
              {isClient && <RoboAllocationChart data={displayResult.allocation} />}
            </div>
          ) : (
            <article className="rounded-xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/10">
              <div className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-cyan-300" />
                <h3 className="text-base font-semibold text-white">Canlı Profil Özeti</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Soruları yanıtladıkça kişiselleştirilmiş risk profiliniz, portföy dağılım tavsiyesi ve tercih uyumu bu panelde anlık olarak hazırlanacaktır.
              </p>
              <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs text-slate-400">Yanıtlanan Soru</p>
                <p className="mt-1.5 text-2xl font-bold text-cyan-200">
                  {answeredCount} / {questions.length}
                </p>
                <div className="mt-3 h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-300 transition-all duration-300"
                    style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}
                  />
                </div>
              </div>
            </article>
          )}
        </aside>
      </div>

      {/* Profil Geçmişi Section */}
      <section className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-300" />
            <h3 className="text-base font-semibold text-white">Profil Geçmişi</h3>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
            {roboResults ? roboResults.length : 0} Kayıt
          </span>
        </div>

        {isClient && roboResults && roboResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Risk Skoru</th>
                  <th className="py-3 px-4">Risk Profili</th>
                  <th className="py-3 px-4">Dağılım Özeti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {roboResults.map((item: RoboProfileResult) => {
                  const summary = item.allocation
                    .filter((a) => a.percentage > 0)
                    .map((a) => `${a.asset} %${a.percentage}`)
                    .join(", ");

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDateTimeTR(item.analyzedAt)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{item.score} / 15</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-2xs font-semibold ${
                          item.profile === "yuksek"
                            ? "border-rose-500/30 bg-rose-500/5 text-rose-300"
                            : item.profile === "orta"
                            ? "border-cyan-500/30 bg-cyan-500/5 text-cyan-300"
                            : "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                        }`}>
                          {getRiskProfileDescription(item.profile)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300 max-w-[280px] md:max-w-xs xl:max-w-sm truncate" title={summary}>
                        {summary}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-white/10 p-5 text-center text-sm text-slate-400">
            Henüz tamamlanmış yatırım profili analizi bulunmuyor.
          </p>
        )}
      </section>
    </div>
  );
}
