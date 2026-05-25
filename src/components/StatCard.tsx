type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  tone?: "neutral" | "positive" | "negative";
};

const valueToneClass: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "text-white",
  positive: "text-emerald-300",
  negative: "text-rose-300",
};

export default function StatCard({
  title,
  value,
  description,
  tone = "neutral",
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${valueToneClass[tone]}`}>{value}</p>
      {description ? <p className="mt-2 text-xs text-slate-400">{description}</p> : null}
    </article>
  );
}
