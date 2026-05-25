# Sprint 1 - UI Iskeleti ve Mock Veri

## Sprint Amaci
FinWise icin temel UI iskeleti, App Router tabanli sayfa rotalari, ortak tipler, mock veri katmani ve yardimci format fonksiyonlarini olusturmak.

## Yapilan Isler
- AppShell olusturuldu ve tum Sprint 1 sayfalarinda kullanildi.
- Dashboard, Hesaplar, Islemler, Butce, Odeme Simulasyonu, RegTech ve Robo Danisman route'lari eklendi.
- Landing sayfasi proje tanitimi, demo notu ve Dashboard yonlendirmesiyle guncellendi.
- `finance.ts` altinda User, BankAccount, Transaction, Budget, PaymentOrder, RegTechAlert tipleri eklendi.
- Mock veri katmani olusturuldu:
  - 1 kullanici
  - 3 banka hesabi (Akbank/Garanti/Ziraat Simulasyon)
  - 55 islem hareketi
  - Kategori bazli butceler
  - Odeme simulasyon kayitlari ve RegTech alarm ornekleri
- `format.ts` altinda TRY para, tarih ve yuzde format fonksiyonlari eklendi.

## Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4

## Kabul Kriterleri
- [x] Navigasyonlu temel UI iskeleti calisiyor.
- [x] Istenen tum Sprint 1 route'lari olusturuldu.
- [x] Mock veri 50+ islem ve tum istenen kategorileri kapsiyor.
- [x] Build basarili.

## Sonraki Sprint Notlari
- Sprint 2'de dashboard kartlari zenginlestirilecek.
- Butce/harcama analizleri ve basit trend gosterimleri eklenecek.
- RegTech ve Robo Danisman tarafinda kural tabanli ilk prototipler devreye alinacak.
