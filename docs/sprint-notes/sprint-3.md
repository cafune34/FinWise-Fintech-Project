# Sprint 3 - Tahminleme ve RegTech Modulu

## Sprint Amaci
FinWise uygulamasina egitim amacli tahminleme ve kural tabanli RegTech yaklasimini ekleyerek, gelecek ay butce risklerini ve supheli islem senaryolarini gorunur hale getmek.

## Yapilan Isler
- `src/lib/forecasting.ts` olusturuldu.
  - Son 3 ay gider ortalamasina dayali kategori bazli tahminleme fonksiyonlari eklendi.
  - Kategori bazli varsayilan mevsimsel katsayilar ve opsiyonel override destegi eklendi.
  - Gelecek ay butce asim riski olan kategorileri siralayan yardimci fonksiyon eklendi.
- `src/lib/regtech.ts` olusturuldu.
  - Kural tabanli RegTech uyari motoru eklendi.
  - Uyari seviye dagilimi (high/medium/low/total) ve yuksek riskli islem id yardimcilari eklendi.
  - Kurallar:
    - Tek islem 10.000 TL uzeri -> high
    - Aylik gider aylik gelirden fazla -> high
    - Butce asimi -> medium
    - Ayni gun 5'ten fazla transfer -> medium
    - 00:00-05:00 arasi 5.000 TL uzeri islem -> medium
    - Ayni aliciya 24 saatte 2 islem -> low, 3+ islem -> medium
- `types/finance.ts` kirici olmayan sekilde genisletildi.
  - `RegTechSeverity` ve `RegTechRuleCode` tipleri eklendi.
  - `RegTechAlert` tipine opsiyonel `severity`, `ruleCode`, `title` ve opsiyonel `transactionId` destegi eklendi.
- Yeni UI bilesenleri eklendi:
  - `RiskAlertCard`
  - `ForecastCard`
- Sayfa entegrasyonlari:
  - Dashboard: "Akilli Uyarilar" bolumu eklendi (onemli 3 RegTech uyarisi + riskli 3 kategori tahmini).
  - Budget: "Gelecek Ay Riskli Kategoriler" bolumu eklendi.
  - RegTech: toplam uyari, high/medium/low dagilimi ve uyari listesi eklendi.
  - Transactions: high-risk transaction id listesine gore "Riskli" etiketi eklendi.
- AppShell basligi "Sprint 3 Demo" olarak guncellendi.

## Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4

## Kabul Kriterleri
- [x] Forecasting helper fonksiyonlari mock verilerle calisiyor.
- [x] Dashboard'da 3 oncelikli RegTech uyarisi ve 3 riskli kategori gorunuyor.
- [x] Budget sayfasinda gelecek ay riskli kategoriler bolumu eklendi.
- [x] RegTech sayfasinda toplam + seviye dagilimi + uyari listesi gorunuyor.
- [x] Transactions tablosunda yuksek riskli islemler icin etiket var.
- [x] Build basarili.

## Sonraki Sprint Notlari
- Sprint 4: Odeme simulasyonu akislarini detaylandirma.
- Sprint 4: Robo Danisman sayfasinda risk anketi ve temel portfoy dagilimi.
- Sprint 4: RegTech kurallarini farkli senaryolar ve cozum akisiyla genisletme.