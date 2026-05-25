import { calculateMonthlyExpense, calculateMonthlyIncome, isBudgetExceeded } from "@/lib/finance";
import type { Budget, RegTechAlert, RegTechSeverity, Transaction } from "@/types/finance";

type GenerateRegTechAlertsInput = {
  transactions: Transaction[];
  budgets: Budget[];
  userId: string;
  referenceDate?: Date;
};

type SeverityCounts = {
  high: number;
  medium: number;
  low: number;
  total: number;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function severityToLevel(severity: RegTechSeverity): RegTechAlert["level"] {
  if (severity === "high") {
    return "yuksek";
  }

  if (severity === "medium") {
    return "orta";
  }

  return "dusuk";
}

function levelToSeverity(level: RegTechAlert["level"]): RegTechSeverity {
  if (level === "yuksek") {
    return "high";
  }

  if (level === "orta") {
    return "medium";
  }

  return "low";
}

function severityWeight(severity: RegTechSeverity): number {
  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

function createAlert(
  input: Pick<GenerateRegTechAlertsInput, "userId"> & {
    id: string;
    severity: RegTechSeverity;
    title: string;
    reason: string;
    ruleCode: NonNullable<RegTechAlert["ruleCode"]>;
    createdAt: string;
    transactionId?: string;
  }
): RegTechAlert {
  return {
    id: input.id,
    userId: input.userId,
    transactionId: input.transactionId,
    level: severityToLevel(input.severity),
    severity: input.severity,
    ruleCode: input.ruleCode,
    title: input.title,
    reason: input.reason,
    createdAt: input.createdAt,
    resolved: false,
  };
}

export function generateRegTechAlerts({
  transactions,
  budgets,
  userId,
  referenceDate = new Date(),
}: GenerateRegTechAlertsInput): RegTechAlert[] {
  const alerts: RegTechAlert[] = [];

  transactions.forEach((transaction) => {
    if (transaction.amount > 10000) {
      alerts.push(
        createAlert({
          id: `alert-large-${transaction.id}`,
          userId,
          severity: "high",
          ruleCode: "LARGE_TRANSACTION",
          title: "Yüksek Tutarlı İşlem",
          reason: `Tek işlem tutarı 10.000 TL eşiğini aştı (${transaction.amount.toFixed(0)} TL).`,
          transactionId: transaction.id,
          createdAt: transaction.occurredAt,
        })
      );
    }
  });

  const monthlyIncome = calculateMonthlyIncome(transactions, referenceDate);
  const monthlyExpense = calculateMonthlyExpense(transactions, referenceDate);

  if (monthlyExpense > monthlyIncome) {
    alerts.push(
      createAlert({
        id: `alert-cashflow-${referenceDate.getFullYear()}-${referenceDate.getMonth() + 1}`,
        userId,
        severity: "high",
        ruleCode: "MONTHLY_EXPENSE_OVER_INCOME",
        title: "Nakit Akışı Riski",
        reason: `Aylık gider (${monthlyExpense.toFixed(0)} TL), aylık geliri (${monthlyIncome.toFixed(0)} TL) aştı.`,
        createdAt: referenceDate.toISOString(),
      })
    );
  }

  budgets.forEach((budget) => {
    if (isBudgetExceeded(budget)) {
      alerts.push(
        createAlert({
          id: `alert-budget-${budget.id}`,
          userId,
          severity: "medium",
          ruleCode: "BUDGET_EXCEEDED",
          title: "Bütçe Aşımı",
          reason: `${budget.category} kategorisinde harcama limiti aşıldı.`,
          createdAt: referenceDate.toISOString(),
        })
      );
    }
  });

  const transferByDate = new Map<string, Transaction[]>();
  transactions
    .filter((transaction) => transaction.category === "transfer")
    .forEach((transaction) => {
      const dateKey = transaction.occurredAt.slice(0, 10);
      const list = transferByDate.get(dateKey) ?? [];
      list.push(transaction);
      transferByDate.set(dateKey, list);
    });

  transferByDate.forEach((dayTransfers, dateKey) => {
    if (dayTransfers.length > 5) {
      const sample = dayTransfers[0];
      alerts.push(
        createAlert({
          id: `alert-transfer-density-${dateKey}`,
          userId,
          severity: "medium",
          ruleCode: "TRANSFER_DENSITY",
          title: "Yüksek Transfer Yoğunluğu",
          reason: `Aynı gün içinde ${dayTransfers.length} transfer kaydı oluştu.`,
          transactionId: sample?.id,
          createdAt: sample?.occurredAt ?? `${dateKey}T00:00:00.000Z`,
        })
      );
    }
  });

  transactions.forEach((transaction) => {
    const occurredAt = new Date(transaction.occurredAt);
    const hour = occurredAt.getHours();

    if (hour >= 0 && hour < 5 && transaction.amount > 5000) {
      alerts.push(
        createAlert({
          id: `alert-night-${transaction.id}`,
          userId,
          severity: "medium",
          ruleCode: "NIGHT_HIGH_AMOUNT",
          title: "Riskli Saatte Yüksek İşlem",
          reason: `00:00-05:00 aralığında 5.000 TL üzeri işlem tespit edildi (${transaction.amount.toFixed(0)} TL).`,
          transactionId: transaction.id,
          createdAt: transaction.occurredAt,
        })
      );
    }
  });

  const merchantGroups = new Map<string, Transaction[]>();
  transactions.forEach((transaction) => {
    const list = merchantGroups.get(transaction.title) ?? [];
    list.push(transaction);
    merchantGroups.set(transaction.title, list);
  });

  merchantGroups.forEach((merchantTransactions, merchantName) => {
    const ordered = [...merchantTransactions].sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );

    let startIndex = 0;
    while (startIndex < ordered.length) {
      let endIndex = startIndex + 1;
      const startTime = new Date(ordered[startIndex].occurredAt).getTime();

      while (
        endIndex < ordered.length &&
        new Date(ordered[endIndex].occurredAt).getTime() - startTime <= DAY_IN_MS
      ) {
        endIndex += 1;
      }

      const clusterSize = endIndex - startIndex;
      if (clusterSize >= 2) {
        const severity: RegTechSeverity = clusterSize >= 3 ? "medium" : "low";
        const firstTransaction = ordered[startIndex];

        alerts.push(
          createAlert({
            id: `alert-repeat-${firstTransaction.id}`,
            userId,
            severity,
            ruleCode: "REPEATING_MERCHANT",
            title: "Tekrarlayan Alıcı Ödemesi",
            reason: `${merchantName} alıcısına 24 saat içinde ${clusterSize} ödeme yapıldı.`,
            transactionId: firstTransaction.id,
            createdAt: firstTransaction.occurredAt,
          })
        );
      }

      startIndex = endIndex;
    }
  });

  return alerts.sort((a, b) => {
    const severityDiff = severityWeight(b.severity ?? levelToSeverity(b.level)) - severityWeight(a.severity ?? levelToSeverity(a.level));

    if (severityDiff !== 0) {
      return severityDiff;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getAlertSeverityCounts(alerts: RegTechAlert[]): SeverityCounts {
  return alerts.reduce<SeverityCounts>(
    (counts, alert) => {
      const severity = alert.severity ?? levelToSeverity(alert.level);

      if (severity === "high") {
        counts.high += 1;
      } else if (severity === "medium") {
        counts.medium += 1;
      } else {
        counts.low += 1;
      }

      counts.total += 1;

      return counts;
    },
    { high: 0, medium: 0, low: 0, total: 0 }
  );
}

export function getHighRiskTransactions(alerts: RegTechAlert[]): string[] {
  return Array.from(
    new Set(
      alerts
        .filter((alert) => (alert.severity ?? levelToSeverity(alert.level)) === "high")
        .map((alert) => alert.transactionId)
        .filter((transactionId): transactionId is string => Boolean(transactionId))
    )
  );
}

