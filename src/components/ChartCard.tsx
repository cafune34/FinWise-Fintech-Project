import type { ReactNode } from "react";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <header className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </header>
      <div className="h-72 w-full">{children}</div>
    </article>
  );
}
