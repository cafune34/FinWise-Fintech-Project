import AppShell from "@/components/AppShell";
import TransactionFilters from "@/components/TransactionFilters";
import { mockAccounts, mockBudgets, mockTransactions, mockUser } from "@/data/mockData";
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

  return (
    <AppShell
      title="Islemler"
      description="Tum mock islem hareketleri tablo halinde sunulur. Kategori, islem tipi ve hesap bazli filtreleme desteklenir."
    >
      <p className="text-sm text-slate-400">
        Islem tipi filtresinde gelir/gider secilebilir. Transfer kayitlari kategori filtresi ile ayristirilabilir.
      </p>

      <TransactionFilters
        transactions={sortedTransactions}
        accounts={mockAccounts}
        highRiskTransactionIds={highRiskTransactionIds}
      />
    </AppShell>
  );
}
