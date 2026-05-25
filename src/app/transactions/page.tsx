import AppShell from "@/components/AppShell";
import TransactionFilters from "@/components/TransactionFilters";
import StatCard from "@/components/StatCard";
import { mockAccounts, mockBudgets, mockTransactions, mockUser } from "@/data/mockData";
import { formatCurrencyTRY } from "@/lib/format";
import { generateRegTechAlerts, getHighRiskTransactions } from "@/lib/regtech";

export default function TransactionsPage() {
  const sortedTransactions = [...mockTransactions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
  const alerts = generateRegTechAlerts({
    transactions: mockTransactions,
    budgets: mockBudgets,
    userId: mockUser.id,
  });
  const highRiskTransactionIds = getHighRiskTransactions(alerts);
  const income = mockTransactions.filter((txn) => txn.direction === "in").reduce((sum, txn) => sum + txn.amount, 0);
  const expense = mockTransactions.filter((txn) => txn.direction === "out").reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <AppShell
      title="İşlemler"
      description="Gelir, gider ve transfer hareketlerini kategori, hesap ve işlem tipine göre inceleyin."
    >
      <div className="grid w-full gap-4 md:grid-cols-3">
        <StatCard title="Toplam İşlem" value={String(mockTransactions.length)} description="Listelenen finans hareketi" />
        <StatCard title="Gelir Toplamı" value={formatCurrencyTRY(income)} tone="positive" description="Tüm gelir kayıtları" />
        <StatCard title="Gider Toplamı" value={formatCurrencyTRY(expense)} tone="negative" description="Tüm gider kayıtları" />
      </div>

      <TransactionFilters
        transactions={sortedTransactions}
        accounts={mockAccounts}
        highRiskTransactionIds={highRiskTransactionIds}
      />
    </AppShell>
  );
}
