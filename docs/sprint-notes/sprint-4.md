# Sprint 4 - Odeme Simulasyonu ve Robo Danismanlik

## Sprint Amaci
FinWise uygulamasina egitim amacli PISP/odeme emri simulasyonu ile robo-danismanlik risk anketi ve portfoy dagilimi mantigini eklemek.

## Yapilan Isler
- `src/lib/roboAdvisor.ts` olusturuldu.
  - `calculateRiskScore`, `getRiskProfile`, `getPortfolioAllocation`, `getRiskProfileDescription` fonksiyonlari eklendi.
  - 5 soruluk ankette 1-3 puan modeli (toplam 5-15) uygulandi.
- `src/types/finance.ts` kirici olmayan sekilde genisletildi.
  - `RiskProfile`, `RoboQuestion`, `RoboAnswer`, `PortfolioAllocation`, `PaymentType` tipleri eklendi.
- Robo advisor bilesenleri eklendi:
  - `RoboQuestionnaire`
  - `RoboResultCard`
  - `RoboAllocationChart` (Recharts)
- `src/app/robo-advisor/page.tsx` guncellendi.
  - 5 soruluk risk anketi eklendi.
  - Form tamamlandiginda risk profili, skor ve portfoy dagilimi gosterimi eklendi.
  - Zorunlu yasal/egitim uyarisi eklendi.
- `src/lib/payments.ts` olusturuldu.
  - `validatePaymentOrder`, `simulatePaymentOrder`, `getPaymentTypeLabel` fonksiyonlari eklendi.
  - Gercek odeme yerine referans no ureten simulasyon ciktisi eklendi.
- Odeme bilesenleri eklendi:
  - `PaymentSimulationForm`
  - `PaymentResultCard`
- `src/app/payments/page.tsx` guncellendi.
  - PISP aciklamasi ve odeme emri simulasyon formu eklendi.
  - "Gercek para transferi veya fatura odemesi yapilmaz" notu eklendi.
- `src/app/dashboard/page.tsx` icine kucuk Sprint 4 CTA kartlari eklendi.
  - Odeme Simulasyonunu Dene
  - Robo Danismanlik Anketini Dene

## Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Recharts

## Kabul Kriterleri
- [x] Robo advisor helper fonksiyonlari eklendi ve anket akisina baglandi.
- [x] 5 soru tamamlandiginda skor, profil ve portfoy dagilimi gorunuyor.
- [x] Odeme simulasyon formunda kaynak hesap, alici, tutar ve aciklama alanlari var.
- [x] Validasyonlar ve bakiye asimi uyarisi uygulandi.
- [x] Odeme sonucu "simule edildi" olarak gosteriliyor.
- [x] Gercek odeme/yatirim tavsiyesi olmadigi acikca belirtiliyor.
- [x] Dashboard'a Sprint 4 ozet linkleri eklendi.
- [ ] Build basarisi (`npm run build`) kontrolu.

## Sonraki Sprint Notlari
- Sprint 5: Robo profil gecmisi ve anket sonuc kayit simulasyonu.
- Sprint 5: Odeme simulasyon senaryolarina coklu durum (beklemede, basarisiz vb.) ekleme.
- Sprint 5: RegTech + odeme + robo modullerinde capraz risk/uyari paneli.

