# Sprint 2 - Dashboard ve Butce Modulu

## Sprint Amaci
Mock data uzerinden calisan kisisel finans dashboard'unu gelistirmek; butce takibi, hesap ozeti, islem listesi ve temel grafik ekranlarini Sprint 2 kapsaminda kullanilabilir hale getirmek.

## Yapilan Isler
- `src/lib/finance.ts` olusturuldu ve finans helper fonksiyonlari eklendi:
  - toplam bakiye
  - aylik gelir
  - aylik gider
  - net nakit akisi
  - kategori bazli gider toplamý
  - hesap bazli islem filtreleme
  - son islemler
  - butce kullanim yuzdesi
  - butce asim kontrolu
- Ortak UI bilesenleri eklendi:
  - `StatCard`
  - `ChartCard`
  - `TransactionTable`
  - `BudgetProgress`
- Dashboard sayfasi gelistirildi:
  - Toplam bakiye, aylik gelir, aylik gider, net nakit akisi kartlari
  - Banka hesap ozet kartlari
  - Son 8 islem tablosu
  - Kategori bazli harcama grafigi (Recharts)
  - Aylik gelir-gider grafigi (Recharts)
- Accounts sayfasi gelistirildi:
  - 3 banka hesabi detay kartlari
  - maskeli IBAN, bakiye/para birimi bilgisi
  - hesap bazli son islem ozetleri
  - gercek banka baglantisi olmadigina dair net not
- Transactions sayfasi gelistirildi:
  - tum islemler tablo halinde sunuldu
  - kategori / islem tipi (gelir-gider) / hesap filtreleri eklendi
- Budget sayfasi gelistirildi:
  - kategori bazli limit, harcanan, kalan, kullanim yuzdesi, asim durumu
  - butce asimi oldugunda uyari karti
- Payments, RegTech ve Robo Danisman sayfalari Sprint kapsamina uygun placeholder metinleriyle sade hale getirildi.

## Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Recharts

## Kabul Kriterleri
- [x] Finans helper fonksiyonlari mock veriyle calisiyor.
- [x] Dashboard kartlari ve grafikleri stabil calisiyor.
- [x] Accounts detay kartlari ve son islem listeleri hazir.
- [x] Transactions filtreleri kategori / tip / hesap bazinda calisiyor.
- [x] Budget sayfasinda asim kontrolu ve uyari mekanizmasi var.
- [x] Payments/RegTech/Robo sayfalari sprint disi ozellik eklemeden placeholder durumunda.
- [x] Build basarili.

## Sonraki Sprint Notlari
- Sprint 3: RegTech islem takibi, daha kapsamli uyari senaryolari.
- Sprint 3: Robo Danisman tarafinda kural tabanli ilk yonlendirme prototipi.
- Sprint 4: Odeme modulunun daha detayli akislari.
