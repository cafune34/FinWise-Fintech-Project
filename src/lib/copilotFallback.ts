import { COPILOT_DISCLAIMER, type CopilotFinanceContext } from "@/lib/copilotTypes";
import { formatCurrencyTRY } from "@/lib/format";

function normalizeQuestion(question: string): string {
  return question
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u");
}

function withDisclaimer(answer: string): string {
  return answer.includes(COPILOT_DISCLAIMER) ? answer : `${answer}\n\n${COPILOT_DISCLAIMER}`;
}

function formatMoneyPlain(value: number): string {
  return `${Math.round(value).toLocaleString("tr-TR")} TL`;
}

function formatPercentPlain(value: number): string {
  return `%${Math.round(value)}`;
}

function formatRiskLevel(value: CopilotFinanceContext["spendingDna"]["riskLevel"]): string {
  if (value === "yuksek") return "yüksek";
  if (value === "orta") return "orta";
  return "düşük";
}

function getPrimaryBudgetSignal(context: CopilotFinanceContext): string {
  const riskyBudget = [...context.exceededBudgets, ...context.nearLimitBudgets][0];

  if (riskyBudget) {
    const status = riskyBudget.status === "exceeded" ? "limiti aşmış" : "limite yaklaşıyor";
    return `${riskyBudget.label} bütçesi ${status} (${formatMoneyPlain(riskyBudget.spent)} / ${formatMoneyPlain(
      riskyBudget.limit
    )}, %${riskyBudget.usagePercent}).`;
  }

  const budgetAlert = context.regTech.topAlerts.find((alert) => {
    const text = `${alert.title} ${alert.reason}`.toLocaleLowerCase("tr-TR");
    return text.includes("bütçe") || text.includes("butce") || text.includes("limit") || text.includes("market");
  });

  if (budgetAlert) {
    const text = `${budgetAlert.title} ${budgetAlert.reason}`.toLocaleLowerCase("tr-TR");

    if (text.includes("market")) {
      return `Market bütçesi limite yaklaşıyor: ${budgetAlert.reason}`;
    }

    return `${budgetAlert.title}: ${budgetAlert.reason}`;
  }

  return "Aktif bütçelerde kritik aşım görünmüyor.";
}

function buildMonthlyBudgetOverview(context: CopilotFinanceContext): string {
  const cashFlowTone = context.netCashFlow >= 0 ? "pozitif" : "negatif";
  const riskLevel = formatRiskLevel(context.spendingDna.riskLevel);
  const emergencyPercent = formatPercentPlain(context.emergencyFund.completionPercentage);
  const mainRecommendation =
    context.netCashFlow >= 0
      ? "Ekstra harcamaları sınırlayıp düzenli acil fon katkısını koruman mantıklı olur."
      : "Önce zorunlu olmayan harcamaları kısıp nakit akışını pozitife çekmen gerekir.";

  return withDisclaimer(
    `${context.currentMonthLabel} bütçe görünümün genel olarak ${cashFlowTone}. Bu ay ${formatMoneyPlain(
      context.monthlyIncome
    )} gelir, ${formatMoneyPlain(context.monthlyExpense)} gider ve ${formatMoneyPlain(
      context.netCashFlow
    )} net nakit akışı görünüyorsun. Portföy toplamın ${formatMoneyPlain(
      context.portfolioTotal
    )}; acil fonun 3 aylık hedefin yaklaşık ${emergencyPercent} seviyesinde. Risk genel olarak ${riskLevel} görünüyor.\n\n- ${getPrimaryBudgetSignal(
      context
    )}\n- RegTech tarafında ${context.regTech.total} sinyal var; yüksek öncelikli sinyal sayısı ${
      context.regTech.highSeverityCount
    }.\n- ${mainRecommendation}`
  );
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
  if (context.currentMonthLabel) {
    return buildMonthlyBudgetOverview(context);
  }

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

  // Check if it's a general greeting / chat question
  const greetings = ["selam", "merhaba", "nasilsin", "tunaydin", "gunaydin", "mrb", "slm", "nasi gidiyor", "merhabalar", "hello", "hi", "hey"];
  const isGreeting = greetings.some(g => normalizedQuestion === g || normalizedQuestion.startsWith(g + " ") || normalizedQuestion.includes(" " + g));
  
  // Financial keywords to ensure we don't accidentally intercept a financial query
  const financialKeywords = [
    "butce", "gelir", "gider", "harcama", "nakit", "akis", "tasarruf", "birikim",
    "kart", "borc", "limit", "kategori", "analiz", "risk", "yatirim", "fon",
    "acil", "regtech", "sinyal", "fatura", "odeme", "talimat", "nereye", "kac",
    "ne kadar", "kanal", "kira", "market", "portfoy", "bakiye", "para", "durum"
  ];
  const hasFinancial = financialKeywords.some(keyword => normalizedQuestion.includes(keyword));

  if (isGreeting && !hasFinancial) {
    return withDisclaimer(
      "Merhaba, iyiyim. FinWise Copilot olarak bütçe, nakit akışı, risk sinyalleri ve harcama kategorilerin hakkında yardımcı olabilirim."
    );
  }

  if (normalizedQuestion.includes("en cok") || normalizedQuestion.includes("nereye") || normalizedQuestion.includes("harcad")) {
    return buildSpendingAnswer(context);
  }

  if (normalizedQuestion.includes("butce") || normalizedQuestion.includes("risk") || normalizedQuestion.includes("limit")) {
    return buildBudgetRiskAnswer(context);
  }

  if (normalizedQuestion.includes("tasarruf") || normalizedQuestion.includes("birikim") || normalizedQuestion.includes("neden")) {
    return buildSavingsAnswer(context);
  }

  if (normalizedQuestion.includes("azalt") || normalizedQuestion.includes("kis") || normalizedQuestion.includes("dusur")) {
    return buildReductionAnswer(context);
  }

  if (normalizedQuestion.includes("odeme") || normalizedQuestion.includes("talimat") || normalizedQuestion.includes("bekleyen")) {
    return buildPaymentAnswer(context);
  }

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
