import {
  readFinanceSnapshot,
  writeFinanceSnapshot,
  type FinanceSnapshot,
} from "@/lib/storage";

export const INVALID_JSON_BACKUP_MESSAGE =
  "Geçersiz JSON dosyası. Lütfen FinWise yedek dosyası yükleyin.";
export const INVALID_FINWISE_BACKUP_MESSAGE =
  "Bu dosya geçerli bir FinWise yedeği değil.";

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || typeof value === "string";
}

function isUser(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.fullName) &&
    isString(value.email) &&
    ["dusuk", "orta", "yuksek"].includes(String(value.riskProfile)) &&
    isString(value.createdAt)
  );
}

function isAccount(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.bankName) &&
    isOptionalString(value.accountName) &&
    isString(value.iban) &&
    isNumber(value.balance) &&
    value.currency === "TRY" &&
    ["vadesiz", "birikim"].includes(String(value.type))
  );
}

function isTransaction(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.accountId) &&
    isString(value.title) &&
    isNumber(value.amount) &&
    isString(value.category) &&
    ["in", "out"].includes(String(value.direction)) &&
    isOptionalString(value.type) &&
    isString(value.occurredAt)
  );
}

function isBudget(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.category) &&
    isNumber(value.limit) &&
    isNumber(value.spent) &&
    value.period === "aylik"
  );
}

function isPaymentOrder(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.payee) &&
    isNumber(value.amount) &&
    isString(value.dueDate) &&
    ["planlandi", "isleme_alindi", "beklemede", "tamamlandi", "reddedildi"].includes(
      String(value.status)
    ) &&
    isOptionalString(value.paymentType) &&
    isOptionalString(value.sourceAccountId) &&
    isOptionalString(value.referenceNumber) &&
    isOptionalString(value.referenceNo) &&
    isOptionalString(value.createdAt)
  );
}

function isRoboResult(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isNumber(value.score) &&
    ["dusuk", "orta", "yuksek"].includes(String(value.profile)) &&
    Array.isArray(value.allocation) &&
    Array.isArray(value.answers) &&
    isString(value.analyzedAt)
  );
}

export function validateFinanceSnapshotJson(value: unknown): value is FinanceSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNumber(value.version) &&
    isUser(value.user) &&
    Array.isArray(value.accounts) &&
    value.accounts.every(isAccount) &&
    Array.isArray(value.transactions) &&
    value.transactions.every(isTransaction) &&
    Array.isArray(value.budgets) &&
    value.budgets.every(isBudget) &&
    Array.isArray(value.paymentOrders) &&
    value.paymentOrders.every(isPaymentOrder) &&
    Array.isArray(value.roboResults) &&
    value.roboResults.every(isRoboResult) &&
    isString(value.updatedAt)
  );
}

function getBackupFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());

  return `finwise-snapshot-${year}-${month}-${day}-${hour}-${minute}.json`;
}

export function downloadJsonFile(snapshot: FinanceSnapshot): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = getBackupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function exportFinanceSnapshotAsJson(): void {
  downloadJsonFile(readFinanceSnapshot());
}

async function readTextFile(file: File): Promise<string> {
  if ("text" in file && typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error(INVALID_JSON_BACKUP_MESSAGE));
    reader.readAsText(file);
  });
}

export async function readFinanceSnapshotFromJsonFile(file: File): Promise<FinanceSnapshot> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(await readTextFile(file));
  } catch {
    throw new Error(INVALID_JSON_BACKUP_MESSAGE);
  }

  if (!validateFinanceSnapshotJson(parsed)) {
    throw new Error(INVALID_FINWISE_BACKUP_MESSAGE);
  }

  return parsed;
}

export async function importFinanceSnapshotFromJson(file: File): Promise<FinanceSnapshot> {
  const snapshot = await readFinanceSnapshotFromJsonFile(file);
  return writeFinanceSnapshot(snapshot);
}
