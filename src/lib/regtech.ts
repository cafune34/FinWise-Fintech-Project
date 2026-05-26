import { calculateMonthlyExpense, calculateMonthlyIncome, isBudgetExceeded } from "@/lib/finance";
import { categoryLabels } from "@/lib/labels";
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
    impact?: string;
    recommendedAction?: string;
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
    impact: input.impact,
    recommendedAction: input.recommendedAction,
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
      let reason = `Tek işlem tutarı 10.000 TL eşiğini aştı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
      let impact = "Büyük miktarda nakit çıkışı veya bütçe dengesinin bozulması.";
      let recommendedAction = "İşlemin kaynağı ve açıklaması kontrol edilmeli.";

      if (transaction.category === "kira") {
        reason = `Aylık ortalamanın üzerinde yüksek tutarlı kira ödemesi tespit edildi (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Nakit akışı kısa vadede baskılanabilir ve likidite seviyeniz etkilenebilir.";
        recommendedAction = "Sabit gider bütçeniz ve kira ödeme takviminiz gözden geçirilmeli.";
      } else if (transaction.category === "yatirim") {
        reason = `Yatırım kategorisinde olağan dışı büyüklükte tekil işlem algılandı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Kullanılabilir nakit bakiyeniz azalabilir ve kısa vadeli ödemeler zorlaşabilir.";
        recommendedAction = "Yatırım sonrası kalan serbest nakit seviyesi kontrol edilerek portföy dengelenmeli.";
      } else if (transaction.category === "market") {
        reason = `Tek seferlik yüksek tutarlı market harcaması saptandı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Aylık temel yaşam giderleri bütçeniz öngörülen limitlerin çok üzerine çıkabilir.";
        recommendedAction = "Sepet içeriği doğrulanmalı ve gıda/tedarik harcamaları izlemeye alınmalı.";
      } else if (transaction.category === "fatura") {
        reason = `Yüksek tutarlı fatura ödemesi saptandı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Kurumsal veya dönemsel hizmet giderlerinde bütçe payı aşırı artabilir.";
        recommendedAction = "Fatura detayları ve tarifeler incelenmeli, gereksiz abonelikler sonlandırılmalı.";
      } else if (transaction.category === "maas") {
        reason = `Portföyünüze olağan dışı yüksek tutarlı bir maaş girişi yansıdı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Yatırıma yönlendirilebilir likit fon seviyeniz ciddi oranda arttı.";
        recommendedAction = "FinWise kontrol panelinden güncel bir risk/getiri profili anketi doldurulması önerilir.";
      } else {
        const hash = transaction.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variant = hash % 3;
        if (variant === 0) {
          reason = `Hesap hareketlerinde limit üzeri tekil işlem saptandı: ${transaction.title} (${transaction.amount.toLocaleString("tr-TR")} TL).`;
          impact = "Kısa vadede finansal planlama dışı harcama yapılması nakit rezervini azaltabilir.";
          recommendedAction = "İşlemin doğruluğu ve faturası kontrol edilmeli.";
        } else if (variant === 1) {
          reason = `${transaction.title} açıklamasıyla 10.000 TL sınırını aşan finansal hareket gerçekleşti (${transaction.amount.toLocaleString("tr-TR")} TL).`;
          impact = "Bütçe hedeflerinin gerisinde kalınması riski ve gereksiz maliyet birikimi.";
          recommendedAction = "Harcamanın aciliyeti ve alternatif tedarikçiler analiz edilmeli.";
        } else {
          reason = `Finansal izleme sistemimiz limit dışı yüksek tutarlı işlem kaydetti (${transaction.amount.toLocaleString("tr-TR")} TL).`;
          impact = "Portföy genel dengesinde ani bir sapma veya nakit akış baskısı.";
          recommendedAction = "İşlemin güvenliği ve alıcı bilgileri kontrol edilmeli.";
        }
      }

      alerts.push(
        createAlert({
          id: `alert-large-${transaction.id}`,
          userId,
          severity: "high",
          ruleCode: "LARGE_TRANSACTION",
          title: "Yüksek Tutarlı İşlem",
          reason,
          impact,
          recommendedAction,
          transactionId: transaction.id,
          createdAt: transaction.occurredAt,
        })
      );
    }
  });

  const monthlyIncome = calculateMonthlyIncome(transactions, referenceDate);
  const monthlyExpense = calculateMonthlyExpense(transactions, referenceDate);

  if (monthlyExpense > monthlyIncome) {
    const diff = monthlyExpense - monthlyIncome;
    const hash = referenceDate.getFullYear() + referenceDate.getMonth();
    const variant = hash % 3;
    let reason = `Aylık gider (${monthlyExpense.toLocaleString("tr-TR")} TL), aylık geliri (${monthlyIncome.toLocaleString("tr-TR")} TL) aştı.`;
    let impact = "Birikim hedeflerine ulaşılamaması veya kısa vadeli nakit açığı oluşması.";
    let recommendedAction = "Aylık harcama planı ve bütçe limitleri yeniden değerlendirilmeli.";

    if (variant === 0) {
      reason = `Bu ay giderleriniz gelirlerinizin önüne geçti. Net açık: ${diff.toLocaleString("tr-TR")} TL.`;
      impact = "Acil durum fonlarından harcama yapılması veya borçlanma ihtiyacı doğması.";
      recommendedAction = "Hayati olmayan harcamaları ve abonelikleri geçici olarak dondurun.";
    } else if (variant === 1) {
      reason = `Aylık bütçe dengesi negatif nakit akışı veriyor. Toplam gider: ${monthlyExpense.toLocaleString("tr-TR")} TL.`;
      impact = "Portföy değerinde erime ve gelecek dönem sabit ödemelerinde sıkışıklık.";
      recommendedAction = "Gelecek ayın bütçe limitlerini daha sıkı tutarak tasarruf önlemleri alın.";
    } else {
      reason = `Nakit akış analizinde negatif denge tespit edildi (Gelir: ${monthlyIncome.toLocaleString("tr-TR")} TL, Gider: ${monthlyExpense.toLocaleString("tr-TR")} TL).`;
      impact = "Finansal sağlık skorunun düşmesi ve uzun vadeli birikim planlarının aksaması.";
      recommendedAction = "Harcamalarınızı kategorilere göre filtreleyerek en çok sapan kalemleri kısıtlayın.";
    }

    alerts.push(
      createAlert({
        id: `alert-cashflow-${referenceDate.getFullYear()}-${referenceDate.getMonth() + 1}`,
        userId,
        severity: "high",
        ruleCode: "MONTHLY_EXPENSE_OVER_INCOME",
        title: "Nakit Akışı Riski",
        reason,
        impact,
        recommendedAction,
        createdAt: referenceDate.toISOString(),
      })
    );
  }

  budgets.forEach((budget) => {
    if (isBudgetExceeded(budget)) {
      const excess = budget.spent - budget.limit;
      const categoryLabel = categoryLabels[budget.category];
      let reason = `${categoryLabel} kategorisinde harcama limiti aşıldı.`;
      let impact = "İlgili kategori bütçesinde kontrol kaybı ve genel tasarruf oranının düşmesi.";
      let recommendedAction = "Kategori limiti veya harcama alışkanlığı gözden geçirilmeli.";

      if (budget.category === "market") {
        reason = `Market harcamalarınız bütçe sınırını ${excess.toLocaleString("tr-TR")} TL aştı.`;
        impact = "Mutfak ve gıda giderlerinin genel nakit akışı üzerindeki payının artması.";
        recommendedAction = "Alışveriş öncesi liste yapın ve lüks tüketim yerine temel ihtiyaçlara yönelin.";
      } else if (budget.category === "eglence") {
        reason = `Sosyal aktiviteler ve eğlence bütçeniz aşıldı (Aşım: ${excess.toLocaleString("tr-TR")} TL).`;
        impact = "Finansal hedeflerden sapma ve bütçe disiplininde zafiyet oluşması.";
        recommendedAction = "Bu ayki dışarıda yeme-içme ve eğlence aktivitelerinizi kısıtlayın.";
      } else if (budget.category === "fatura") {
        reason = `Sabit ve değişken fatura ödemeleriniz bütçe sınırını geçti (${excess.toLocaleString("tr-TR")} TL).`;
        impact = "Dönemsel enerji veya hizmet maliyetlerinin tahminlerin üzerinde gerçekleşmesi.";
        recommendedAction = "Kullanım alışkanlıklarını gözden geçirin veya tasarruf modellerine geçin.";
      } else {
        const hash = budget.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variant = hash % 2;
        if (variant === 0) {
          reason = `${categoryLabel} kategorisindeki toplam harcamanız limiti ${excess.toLocaleString("tr-TR")} TL aştı.`;
          impact = "Genel portföy birikim hızı yavaşlayabilir ve aylık hedefler ertelenebilir.";
          recommendedAction = "Bu kategoriye bağlı harcamaları durdurun veya limitinizi revize edin.";
        } else {
          reason = `${categoryLabel} harcama kalemi için ayrılan bütçe sınırının dışına çıkıldı (Aşım: ${excess.toLocaleString("tr-TR")} TL).`;
          impact = "Kategori özelinde kontrol kaybı ve genel aylık nakit dengesinde bozulma.";
          recommendedAction = "Kayıtlı son işlemleri gözden geçirerek bütçeyi neyin bozduğunu analiz edin.";
        }
      }

      alerts.push(
        createAlert({
          id: `alert-budget-${budget.id}`,
          userId,
          severity: "medium",
          ruleCode: "BUDGET_EXCEEDED",
          title: "Bütçe Aşımı",
          reason,
          impact,
          recommendedAction,
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
      const count = dayTransfers.length;
      const totalAmount = dayTransfers.reduce((s, t) => s + t.amount, 0);
      const hash = dateKey.split("-").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const variant = hash % 3;

      let reason = `Aynı gün içinde ${count} transfer kaydı oluştu.`;
      let impact = "Hesap hareketlerinde olağandışı artış.";
      let recommendedAction = "Gönderilen hesaplar ve transfer nedenleri doğrulanmalı.";

      if (variant === 0) {
        reason = `${dateKey} tarihinde kısa sürede ${count} adet transfer işlemi gerçekleşti (Toplam: ${totalAmount.toLocaleString("tr-TR")} TL).`;
        impact = "Hesap güvenliği açığı veya yetkisiz işlem riski.";
        recommendedAction = "Transferlerin alıcı listesini ve işlem gerekçelerini acilen kontrol edin.";
      } else if (variant === 1) {
        reason = `Aynı iş gününde olağan dışı transfer sıklığı saptandı (${count} adet işlem).`;
        impact = "Likit varlıkların kontrolsüz dağılması ve takip zorluğu.";
        recommendedAction = "Transfer yapılan hesapların güvenilirliğini ve tutar doğruluğunu kontrol edin.";
      } else {
        reason = `Sistemimiz aynı gün içinde yoğun para transferi gerçekleştirdiğinizi tespit etti (${count} adet).`;
        impact = "Hesap limitlerinin dolması veya yüksek işlem komisyonu maliyetleri.";
        recommendedAction = "Transfer masraflarından tasarruf etmek için toplu transfer seçeneğini değerlendirin.";
      }

      alerts.push(
        createAlert({
          id: `alert-transfer-density-${dateKey}`,
          userId,
          severity: "medium",
          ruleCode: "TRANSFER_DENSITY",
          title: "Yüksek Transfer Yoğunluğu",
          reason,
          impact,
          recommendedAction,
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
      const hash = transaction.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const variant = hash % 3;
      let reason = `00:00-05:00 aralığında 5.000 TL üzeri işlem tespit edildi (${transaction.amount.toFixed(0)} TL).`;
      let impact = "Yetkisiz veya şüpheli işlem riski.";
      let recommendedAction = "İşlem zamanı ve alıcı bilgisi doğrulanmalı.";

      if (variant === 0) {
        reason = `Gece saatlerinde (saat ${hour}:00 civarı) 5.000 TL üzerinde finansal hareket gerçekleşti: ${transaction.title} (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Kart kopyalanması, şifre çalınması veya yetkisiz erişim riski.";
        recommendedAction = "Eğer bu işlem bilginiz dışındaysa kartınızı veya hesabınızı hemen geçici olarak kapatın.";
      } else if (variant === 1) {
        reason = `Şüpheli saat diliminde (gece yarısı ve sabaha karşı) yüksek tutarlı harcama/para çıkışı yapıldı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Finansal güvenlik ihlali veya dolandırıcılık riski.";
        recommendedAction = "Hesap şifrelerinizi güncelleyin ve mobil bankacılık giriş geçmişini denetleyin.";
      } else {
        reason = `Gece 00:00-05:00 arasında gerçekleşen limit üstü işlem güvenlik radarına takıldı (${transaction.amount.toLocaleString("tr-TR")} TL).`;
        impact = "Hesap bakiyesinin aniden yetkisiz kişilerce çekilmesi.";
        recommendedAction = "Alıcı hesap IBAN bilgisini kontrol edin ve işlemi acilen teyit edin.";
      }

      alerts.push(
        createAlert({
          id: `alert-night-${transaction.id}`,
          userId,
          severity: "medium",
          ruleCode: "NIGHT_HIGH_AMOUNT",
          title: "Riskli Saatte Yüksek İşlem",
          reason,
          impact,
          recommendedAction,
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
        const hash = firstTransaction.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variant = hash % 3;

        let reason = `${merchantName} alıcısına 24 saat içinde ${clusterSize} ödeme yapıldı.`;
        let impact = "Mükerrer çekim veya hatalı transfer riski.";
        let recommendedAction = "Aynı alıcıya yapılan tekrar eden ödemeler kontrol edilmeli.";

        if (variant === 0) {
          reason = `Aynı alıcıya (${merchantName}) 24 saatlik süre içinde ${clusterSize} kez ödeme gönderildi.`;
          impact = "Sistem hatası veya çift ödeme (mükerrer işlem) sebebiyle finansal kayıp.";
          recommendedAction = "Alıcıdan tahsilat durumunu sorgulayın veya ilgili banka dekontlarını karşılaştırın.";
        } else if (variant === 1) {
          reason = `24 saat içinde tekrarlayan alıcı hareketi tespit edildi: ${merchantName} (${clusterSize} işlem).`;
          impact = "Yetkisiz art arda çekimler veya pos cihazı teknik aksaklıkları.";
          recommendedAction = "Harcamaların tutarlarını kontrol ederek hatalı veya fazla çekilen miktarları iptal ettirin.";
        } else {
          reason = `Sistemimiz ${merchantName} alıcısına yapılan transferlerde yüksek sıklık algıladı (${clusterSize} adet).`;
          impact = "Bütçenin kontrol dışı hızlı tüketimi veya hatalı transferler.";
          recommendedAction = "Ödeme talimatlarınızı kontrol edin, varsa bekleyen siparişlerinizi iptal edin.";
        }

        alerts.push(
          createAlert({
            id: `alert-repeat-${firstTransaction.id}`,
            userId,
            severity,
            ruleCode: "REPEATING_MERCHANT",
            title: "Tekrarlayan Alıcı Ödemesi",
            reason,
            impact,
            recommendedAction,
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
