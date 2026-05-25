import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/10">
      <header className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </header>
      <div className="h-[340px] min-h-[340px] w-full min-w-[280px]">{children}</div>
    </article>
  );
}
