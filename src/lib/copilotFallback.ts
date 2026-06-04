import { COPILOT_DISCLAIMER, type CopilotFinanceContext } from "@/lib/copilotTypes";
import { formatCurrencyTRY } from "@/lib/format";

function normalizeQuestion(question: string): string {
  return question.toLocaleLowerCase("tr-TR");
}

function withDisclaimer(answer: string): string {
  return answer.includes(COPILOT_DISCLAIMER) ? answer : `${answer}\n\n${COPILOT_DISCLAIMER}`;
}

function formatTopCategories(context: CopilotFinanceContext): string {
  if (context.topExpenseCategories.length === 0) {
    return "Bu ay gider kategorisi verisi bulunmuyor.";
  }

  return context.topExpenseCategories
    .slice(0, 3)
    .map((category, index) => `${index + 1}. ${category.label}: ${formatCurrencyTRY(category.amount)}`)
    .join("\n");
}

function formatBudgetRisks(context: CopilotFinanceContext): string {
  const riskyBudgets = [...context.exceededBudgets, ...context.nearLimitBudgets];

  if (riskyBudgets.length === 0) {
    return "Aktif bütçelerde aşım veya limite yakın kritik kategori görünmüyor.";
  }

  return riskyBudgets
    .slice(0, 4)
    .map((budget) => {
      const status = budget.status === "exceeded" ? "aşımda" : "limite yakın";
      return `${budget.label}: ${formatCurrencyTRY(budget.spent)} / ${formatCurrencyTRY(
        budget.limit
      )} (${budget.usagePercent}%, ${status})`;
    })
    .join("\n");
}

function buildSpendingAnswer(context: CopilotFinanceContext): string {
  const topCategory = context.topExpenseCategories[0];
  const intro = topCategory
    ? `Bu ay en yüksek harcama alanınız ${topCategory.label}: ${formatCurrencyTRY(topCategory.amount)}.`
    : "Bu ay harcama kategorisi kırılımı oluşturacak yeterli gider verisi yok.";

  return withDisclaimer(
    `${intro}\n\nÖne çıkan kategoriler:\n${formatTopCategories(
      context
    )}\n\nPratik öneri: İlk üç kategoride tekrar eden veya ertelenebilir harcamaları kontrol ederek kısa vadeli tasarruf alanı arayın.`
  );
}

function buildBudgetRiskAnswer(context: CopilotFinanceContext): string {
  const hasRisk = context.exceededBudgets.length > 0 || context.nearLimitBudgets.length > 0;
  const intro = hasRisk
    ? "Bütçenizde takip gerektiren kategoriler var."
    : "Bütçe tarafında genel görünüm dengeli.";

  return withDisclaimer(
    `${intro}\n\n${formatBudgetRisks(
      context
    )}\n\nPratik öneri: Aşımda olan kategorileri bu ay yeni harcamaya kapatın; limite yakın kategorilerde kalan tutarı günlük harcama sınırına bölün.`
  );
}

function buildSavingsAnswer(context: CopilotFinanceContext): string {
  const cashFlowStatus =
    context.netCashFlow >= 0
      ? `Net nakit akışınız pozitif: ${formatCurrencyTRY(context.netCashFlow)}.`
      : `Net nakit akışınız negatif: ${formatCurrencyTRY(context.netCashFlow)}.`;

  return withDisclaimer(
    `${cashFlowStatus}\n\nBu ay gelir ${formatCurrencyTRY(context.monthlyIncome)}, gider ${formatCurrencyTRY(
      context.monthlyExpense
    )} seviyesinde. Tasarrufu zorlayan ana alanlar:\n${formatTopCategories(
      context
    )}\n\nPratik öneri: Önce en büyük kategori için %10 azaltım hedefi koyun; ardından bütçe aşımı olan alanlarda yeni harcamaları durdurun.`
  );
}

function buildReductionAnswer(context: CopilotFinanceContext): string {
  const candidates = context.topExpenseCategories
    .filter((category) => category.category !== "kira")
    .slice(0, 3);

  const categories =
    candidates.length > 0
      ? candidates.map((category) => `- ${category.label}: ${formatCurrencyTRY(category.amount)}`).join("\n")
      : "Azaltım önerisi üretmek için yeterli değişken gider verisi bulunmuyor.";

  return withDisclaimer(
    `Azaltım için önce değişken giderleri hedeflemek daha uygulanabilir görünür.\n\n${categories}\n\nPratik öneri: Sabit giderleri ayrı tutup market, eğlence, ulaşım veya fatura kalemlerinde haftalık limit belirleyin.`
  );
}

function buildPaymentAnswer(context: CopilotFinanceContext): string {
  const paymentText =
    context.paymentOrders.pendingCount > 0
      ? `${context.paymentOrders.pendingCount} bekleyen talimat var; toplam tutar ${formatCurrencyTRY(
          context.paymentOrders.pendingTotal
        )}.`
      : "Bekleyen ödeme talimatı görünmüyor.";

  const upcoming = context.paymentOrders.upcomingPending
    .slice(0, 3)
    .map((order) => `- ${order.payee}: ${formatCurrencyTRY(order.amount)} (${order.dueDate})`)
    .join("\n");

  return withDisclaimer(
    `${paymentText}\n\n${
      upcoming || "Yaklaşan bekleyen ödeme listesi boş."
    }\n\nPratik öneri: Bekleyen talimatların toplamını mevcut nakit akışıyla karşılaştırın ve vadesi yakın olanları önceliklendirin.`
  );
}

function buildGeneralAnswer(context: CopilotFinanceContext): string {
  return withDisclaimer(
    `Finansal görünüm özeti:\n- Toplam bakiye: ${formatCurrencyTRY(context.totalBalance)}\n- Aylık gelir: ${formatCurrencyTRY(
      context.monthlyIncome
    )}\n- Aylık gider: ${formatCurrencyTRY(context.monthlyExpense)}\n- Net nakit akışı: ${formatCurrencyTRY(
      context.netCashFlow
    )}\n- Bekleyen ödeme talimatı: ${context.paymentOrders.pendingCount}\n\nÖne çıkan harcamalar:\n${formatTopCategories(
      context
    )}\n\nPratik öneri: Önce nakit akışını, ardından bütçe aşımı olan kategorileri kontrol edin.`
  );
}

export function generateCopilotFallbackAnswer(question: string, context: CopilotFinanceContext): string {
  const normalizedQuestion = normalizeQuestion(question);

  if (
    normalizedQuestion.includes("en çok") ||
    normalizedQuestion.includes("nereye") ||
    normalizedQuestion.includes("harcad")
  ) {
    return buildSpendingAnswer(context);
  }

  if (
    normalizedQuestion.includes("bütçe") ||
    normalizedQuestion.includes("risk") ||
    normalizedQuestion.includes("limit")
  ) {
    return buildBudgetRiskAnswer(context);
  }

  if (
    normalizedQuestion.includes("tasarruf") ||
    normalizedQuestion.includes("birikim") ||
    normalizedQuestion.includes("neden")
  ) {
    return buildSavingsAnswer(context);
  }

  if (
    normalizedQuestion.includes("azalt") ||
    normalizedQuestion.includes("kıs") ||
    normalizedQuestion.includes("düşür")
  ) {
    return buildReductionAnswer(context);
  }

  if (
    normalizedQuestion.includes("ödeme") ||
    normalizedQuestion.includes("talimat") ||
    normalizedQuestion.includes("bekleyen")
  ) {
    return buildPaymentAnswer(context);
  }

  return buildGeneralAnswer(context);
}
