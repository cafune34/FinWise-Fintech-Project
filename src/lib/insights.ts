import type { PaymentOrder, Transaction, TransactionCategory } from "@/types/finance";

export type SubscriptionData = {
  id: string;
  name: string;
  estimatedAmount: number;
  category: TransactionCategory;
  dueDateStr?: string;
};

export type SmartInsight = {
  id: string;
  title: string;
  description: string;
  type: "warning" | "info" | "success";
};

const SUBSCRIPTION_KEYWORDS = ["netflix", "spotify", "youtube", "internet", "telefon", "aidat", "fatura", "elektrik", "su", "doğalgaz", "dogalgaz"];

/**
 * Mevcut işlemler ve bekleyen ödeme talimatlarından tekrarlayan giderleri/abonelikleri bulur.
 */
export function detectSubscriptions(transactions: Transaction[], paymentOrders: PaymentOrder[]): SubscriptionData[] {
  const subscriptions: SubscriptionData[] = [];
  const foundNames = new Set<string>();

  // Payment orders check (usually these are bills or regular transfers)
  paymentOrders.forEach((order) => {
    const isSubscription = SUBSCRIPTION_KEYWORDS.some((kw) => order.payee.toLowerCase().includes(kw));
    if (isSubscription || order.paymentType === "fatura") {
      const name = order.payee;
      if (!foundNames.has(name)) {
        foundNames.add(name);
        subscriptions.push({
          id: `sub-po-${order.id}`,
          name,
          estimatedAmount: order.amount,
          category: order.paymentType === "fatura" ? "fatura" : "diger",
          dueDateStr: order.dueDate,
        });
      }
    }
  });

  // Recent transactions check
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).getTime();
  const recentTxns = transactions.filter((t) => t.type === "gider" && new Date(t.occurredAt).getTime() > thirtyDaysAgo);

  recentTxns.forEach((txn) => {
    const isSubscription = SUBSCRIPTION_KEYWORDS.some((kw) => txn.title.toLowerCase().includes(kw));
    if (isSubscription) {
      const name = txn.title;
      // Basit bir dedekşin algoritması, birebir isimleri gruplar
      if (!foundNames.has(name)) {
        foundNames.add(name);
        subscriptions.push({
          id: `sub-tx-${txn.id}`,
          name,
          estimatedAmount: txn.amount,
          category: txn.category,
        });
      }
    }
  });

  return subscriptions;
}

/**
 * Önümüzdeki X gün içerisindeki bekleyen ödeme talimatlarının toplam çıkışını hesaplar.
 */
export function calculateUpcomingCashOutflow(paymentOrders: PaymentOrder[], days: number = 7): number {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfTargetDate = new Date();
  endOfTargetDate.setDate(startOfToday.getDate() + days);
  endOfTargetDate.setHours(23, 59, 59, 999);

  return paymentOrders
    .filter((order) => order.status === "beklemede" || order.status === "isleme_alindi")
    .filter((order) => {
      const orderDate = new Date(order.dueDate);
      return orderDate >= startOfToday && orderDate <= endOfTargetDate;
    })
    .reduce((sum, order) => sum + order.amount, 0);
}

/**
 * İşlemler ve ödeme emirlerinden genel "akıllı" içgörüler türetir.
 */
export function getSmartInsights(transactions: Transaction[], paymentOrders: PaymentOrder[]): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const outflow = calculateUpcomingCashOutflow(paymentOrders, 7);
  
  if (outflow > 0) {
    insights.push({
      id: "insight-upcoming-outflow",
      title: "Yaklaşan Ödeme Yoğunluğu",
      description: `Önümüzdeki 7 gün içinde toplam ₺${outflow.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ödeme bekleniyor.`,
      type: outflow > 5000 ? "warning" : "info",
    });
  }

  const subs = detectSubscriptions(transactions, paymentOrders);
  if (subs.length > 0) {
    const totalSubs = subs.reduce((acc, sub) => acc + sub.estimatedAmount, 0);
    insights.push({
      id: "insight-subs",
      title: "Düzenli Ödeme Yükü",
      description: `Aylık düzenli abonelik ve fatura yükünüz tahmini ₺${totalSubs.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} seviyesinde.`,
      type: "info",
    });
  }

  const recentEntertainment = transactions
    .filter((t) => t.category === "eglence" && t.type === "gider")
    .filter((t) => new Date(t.occurredAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000)
    .reduce((acc, t) => acc + t.amount, 0);

  if (recentEntertainment > 3000) {
    insights.push({
      id: "insight-entertainment",
      title: "Harcama Eğilimi",
      description: "Bu ay eğlence kategorisindeki harcamalarınız ortalamanın üzerinde seyrediyor.",
      type: "warning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "insight-stable",
      title: "Dengeli Seyir",
      description: "Nakit akışınızda ve harcama eğilimlerinizde olağandışı bir hareket tespit edilmedi.",
      type: "success",
    });
  }

  return insights.slice(0, 3);
}
