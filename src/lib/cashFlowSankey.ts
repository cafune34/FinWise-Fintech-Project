import { FinanceSnapshot } from "@/lib/storage";
import { categoryLabels } from "@/lib/labels";
import { TransactionCategory } from "@/types/finance";

export type CashFlowNodeType = "income" | "expense" | "investment" | "transfer" | "remaining" | "shortfall";

export type CashFlowNode = {
  id: string;
  label: string;
  type: CashFlowNodeType;
  amount: number;
  percentage: number;
};

export type CashFlowLink = {
  source: string;
  target: string;
  value: number;
  percentage: number;
};

export type CashFlowSankeyResult = {
  totalIncome: number;
  totalOutflow: number;
  remainingCash: number;
  savingsRate: number;
  nodes: CashFlowNode[];
  links: CashFlowLink[];
  topOutflowCategory?: CashFlowNode;
  summary: string;
  insights: string[];
  recommendations: string[];
  periodLabel: string;
  disclaimer: string;
};

function isSameMonth(dateValue: string, referenceDate: Date): boolean {
  const date = new Date(dateValue);
  return date.getFullYear() === referenceDate.getFullYear() && date.getMonth() === referenceDate.getMonth();
}

export function formatCurrencyTRY(value: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(value);
}

export function formatPercent(value: number): string {
  return `%${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)}`;
}

export function buildCashFlowSankey(snapshot: FinanceSnapshot): CashFlowSankeyResult {
  const transactions = snapshot.transactions;
  
  // Bulunduğumuz ayı belirlemek için son işlem tarihini alalım
  let referenceDate = new Date();
  if (transactions.length > 0) {
    const validDates = transactions.map(t => new Date(t.occurredAt)).filter(d => !isNaN(d.getTime()));
    if (validDates.length > 0) {
      validDates.sort((a, b) => b.getTime() - a.getTime());
      referenceDate = validDates[0];
    }
  }

  // İşlemleri filtrele
  let relevantTransactions = transactions.filter(t => isSameMonth(t.occurredAt, referenceDate));
  if (relevantTransactions.length === 0) {
    relevantTransactions = transactions; // fallback
  }

  const periodLabel = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(referenceDate);

  let totalIncome = 0;
  let totalOutflow = 0;
  const categoryTotals: Record<string, number> = {};

  relevantTransactions.forEach(t => {
    const isIncome = t.direction === "in" || t.type === "gelir" || t.category === "maas";
    const isOutflow = t.direction === "out" || t.type === "gider" || t.type === "transfer";

    if (isIncome && !isOutflow) {
      totalIncome += t.amount;
    } else if (isOutflow) {
      totalOutflow += t.amount;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    }
  });

  const remainingCash = totalIncome - totalOutflow;
  const savingsRate = totalIncome > 0 && remainingCash > 0 ? (remainingCash / totalIncome) * 100 : 0;

  const nodes: CashFlowNode[] = [];
  const links: CashFlowLink[] = [];

  // Gelir Node'u
  nodes.push({
    id: "income",
    label: "Gelir",
    type: "income",
    amount: totalIncome,
    percentage: 100
  });

  // Kategori Node'ları ve Link'leri
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);

  sortedCategories.forEach(([cat, amount]) => {
    let type: CashFlowNodeType = "expense";
    if (cat === "yatirim") type = "investment";
    if (cat === "transfer") type = "transfer";

    const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
    
    nodes.push({
      id: cat,
      label: categoryLabels[cat as TransactionCategory] || cat,
      type,
      amount,
      percentage
    });

    links.push({
      source: "income",
      target: cat,
      value: amount,
      percentage
    });
  });

  let topOutflowCategory: CashFlowNode | undefined;
  if (sortedCategories.length > 0) {
    topOutflowCategory = nodes.find(n => n.id === sortedCategories[0][0]);
  }

  // Kalan Nakit Node'u
  if (remainingCash > 0) {
    const remainingPct = (remainingCash / totalIncome) * 100;
    nodes.push({
      id: "remaining",
      label: "Kalan Nakit",
      type: "remaining",
      amount: remainingCash,
      percentage: remainingPct
    });
    links.push({
      source: "income",
      target: "remaining",
      value: remainingCash,
      percentage: remainingPct
    });
  } else if (remainingCash < 0) {
    const shortfallAmt = Math.abs(remainingCash);
    nodes.push({
      id: "shortfall",
      label: "Nakit Açığı",
      type: "shortfall",
      amount: shortfallAmt,
      percentage: totalIncome > 0 ? (shortfallAmt / totalIncome) * 100 : 0
    });
  }

  let summary = `Bu dönem gelirinizin büyük kısmı giderlere ayrılmıştır.`;
  if (totalIncome === 0) {
    summary = "Bu dönem gelir verisi bulunamadı; harcama dağılımı gösteriliyor.";
  } else if (remainingCash > 0) {
    summary = `Gelirinizin ${formatPercent(savingsRate)}'sini nakit veya tasarruf olarak ayırdınız.`;
  } else if (remainingCash < 0) {
    summary = "Giderleriniz gelirlerinizi aştı. Nakit açığı oluştu.";
  }

  const insights: string[] = [];
  const recommendations: string[] = [];

  if (topOutflowCategory) {
    insights.push(`En büyük para çıkışı ${topOutflowCategory.label} kategorisinde (${formatPercent(topOutflowCategory.percentage)}) gerçekleşti.`);
  }

  if (remainingCash < 0) {
    insights.push("Nakit akışı negatif yönde ilerliyor, borçlanma veya birikimden harcama söz konusu.");
    recommendations.push("Zorunlu olmayan (Eğlence, vs.) giderleri kısarak nakit açığını kapatmaya odaklanın.");
    recommendations.push("Bütçe planınızı gözden geçirin ve limitleri daraltın.");
  } else if (savingsRate >= 20) {
    insights.push("Tasarruf oranınız ideal seviyenin (%20) üzerinde seyrediyor.");
    recommendations.push("Artan nakdi değerlendirmek için Robo-Advisor yatırım araçlarını kullanabilirsiniz.");
    recommendations.push("Acil durum fonunuz henüz dolmadıysa kalan nakdi fona aktarabilirsiniz.");
  } else if (savingsRate > 0) {
    insights.push("Tasarruf oranınız pozitif ancak artırılma potansiyeli taşıyor.");
    recommendations.push("Sabit gider aboneliklerinizi kontrol ederek tasarruf alanları yaratın.");
    recommendations.push("Yatırım hedeflerinize ulaşmak için 'önce öde' kuralını uygulayın.");
  }

  if (categoryTotals["kira"] && totalIncome > 0) {
    if (categoryTotals["kira"] / totalIncome > 0.35) {
      recommendations.push("Kira/Barınma giderleriniz gelirinizin %35'ini aşıyor; bütçenizi dikkatli yönetin.");
    }
  }

  if (recommendations.length < 3) {
    recommendations.push("Ay sonu kalan nakdi boşta bekletmek yerine kısa vadeli mevduat veya para piyasası fonunda değerlendirin.");
  }

  return {
    totalIncome,
    totalOutflow,
    remainingCash,
    savingsRate,
    nodes,
    links,
    topOutflowCategory,
    summary,
    insights,
    recommendations,
    periodLabel,
    disclaimer: "Bu görselleştirme eğitim amaçlı finansal analizdir; yatırım tavsiyesi değildir."
  };
}

export function summarizeCashFlowForCopilot(result: CashFlowSankeyResult) {
  return {
    available: true,
    totalIncome: result.totalIncome,
    totalOutflow: result.totalOutflow,
    remainingCash: result.remainingCash,
    savingsRate: result.savingsRate,
    topOutflowCategory: result.topOutflowCategory?.label,
    route: "/cash-flow-map" as const,
    summary: result.summary,
  };
}
