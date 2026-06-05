export function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTR(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
