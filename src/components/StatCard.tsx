type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  tone?: "neutral" | "positive" | "negative";
  eyebrow?: string;
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
  eyebrow,
  tone = "neutral",
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10">
      {eyebrow ? <p className="mb-2 text-xs uppercase tracking-[0.16em] text-cyan-300">{eyebrow}</p> : null}
      <p className="text-sm text-slate-400">{title}</p>
      <p className={`mt-2 text-2xl font-semibold ${valueToneClass[tone]}`}>{value}</p>
      {description ? <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p> : null}
    </article>
  );
}
