"use client";

import { Sparkles } from "lucide-react";

type CopilotSuggestionCardProps = {
  question: string;
  disabled?: boolean;
  onSelect: (question: string) => void;
};

export default function CopilotSuggestionCard({
  question,
  disabled = false,
  onSelect,
}: CopilotSuggestionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(question)}
      className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-300/10 text-cyan-300 transition group-hover:bg-cyan-300/20">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="min-w-0 leading-5">{question}</span>
    </button>
  );
}
