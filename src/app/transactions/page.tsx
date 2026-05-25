import AppShell from "@/components/AppShell";
import TransactionFilters from "@/components/TransactionFilters";
import { mockAccounts, mockTransactions } from "@/data/mockData";

export default function TransactionsPage() {
  const sortedTransactions = [...mockTransactions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <AppShell
      title="Islemler"
      description="Tum mock islem hareketleri tablo halinde sunulur. Kategori, islem tipi ve hesap bazli filtreleme desteklenir."
    >
      <p className="text-sm text-slate-400">
        Islem tipi filtresinde gelir/gider secilebilir. Transfer kayitlari kategori filtresi ile ayristirilabilir.
      </p>

      <TransactionFilters transactions={sortedTransactions} accounts={mockAccounts} />
    </AppShell>
  );
}
