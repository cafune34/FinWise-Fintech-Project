# FinWise Akademik Rapor Taslagi

## 1. Kapak Bilgileri
- Ders: Finansal Teknolojiler
- Proje Adi: FinWise
- Donem: 2025-2026
- Hazirlayan(lar): [Ogrenci Adi Soyadi]
- Numara: [Ogrenci Numarasi]
- Teslim Tarihi: [Tarih]

## 2. Ozet
FinWise, acik bankacilik yaklasimini egitim ortamina tasiyan, kisisel finans yonetimi ve fintech modullerini bir arada gosteren bir demo uygulamadir. Uygulama dashboard, hesaplar, islemler, butce, tahminleme, RegTech, odeme emri simulasyonu ve robo-danismanlik alanlarini kapsar. Proje, gercek finansal altyapiya baglanmadan fintech urun akislarini anlasilir bir prototipte toplar.

## 3. Projenin Amaci
Bu projenin amaci, Finansal Teknolojiler dersi kapsamindaki temel kavramlari tek bir web uygulamasi uzerinden gostermek, sprint tabanli urun gelistirme disiplinini uygulamak ve final teslimine uygun dokumantasyon ciktisi uretmektir.

## 4. Finansal Teknolojiler Ile Iliskisi
FinWise; acik bankacilik, odeme hizmetleri, dijital kisisel finans, uyum teknolojileri (RegTech) ve robo-danismanlik gibi fintech alanlarini kapsamaktadir. Moduller arasi iliski, ders teorisinin pratik akislarla gosterilmesini saglar.

## 5. Acik Bankacilik ve AISP/PISP Baglantisi
- AISP bakis acisi: farkli hesap verilerinin tek panelde goruntulenmesi
- PISP bakis acisi: odeme emri baslatma surecinin simulasyonu
- Uygulama, bu iki kavrami egitim amacli arayuz akislarinda canlandirir.

## 6. Kisisel Finans Yonetimi Modulu
Dashboard, accounts, transactions ve budget sayfalari birlikte calisarak kullaniciya su ciktilari sunar:
- Toplam bakiye ve nakit akisi
- Kategori bazli gider dagilimi
- Butce limitleri ve asim uyarilari

## 7. Yapay Zeka / Tahminleme Yaklasimi
Tahminleme modeli, son 3 ay ortalamasi + kategori katsayisi uzerine kuruludur. Bu yaklasim, kategori bazli sonraki donem harcamasina yonelik basit bir ongoru ciktisi verir.

## 8. RegTech ve Guvenlik Yaklasimi
RegTech modulu; tutar esigi, butce asimi, transfer yogunlugu ve benzeri kurallarla uyari uretir. Bu modulde uretilen uyarilar, riskli senaryolari egitim amacli gostermek icindir.

## 9. Odeme Emri Simulasyonu
Payments modulu, kullanicinin kaynak hesap secip alici, tutar ve aciklama girerek odeme emri simulasyonu yapmasini saglar. Cikti, referans numarali simulasyon sonucudur.

## 10. Robo-Danismanlik Modulu
Robo Advisor modulu, 5 soruluk risk anketi ile kullaniciyi dusuk/orta/yuksek risk profiline yerlestirir. Sonuc ekraninda ornek portfoy dagilimi (mevduat, altin, fon/hisse, dijital varlik) gosterilir.

## 11. Sistem Mimarisi
- Sunum katmani: Next.js App Router sayfalari
- Bilesen katmani: tekrar kullanilabilir React bilesenleri
- Is kurali katmani: `src/lib` altindaki helper ve kural fonksiyonlari
- Veri katmani: `src/data/mockData.ts` ile mock veri

## 12. Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Recharts
- Zod

## 13. Ekran Goruntuleri Icin Yer Tutucular
- Sekil 1: Ana sayfa
- Sekil 2: Dashboard
- Sekil 3: Accounts
- Sekil 4: Transactions
- Sekil 5: Budget ve tahminleme
- Sekil 6: RegTech
- Sekil 7: Payments
- Sekil 8: Robo Advisor

## 14. Test Senaryolari
Test senaryolari `docs/test-scenarios.md` dokumaninda modul bazli olarak tanimlanmistir. Senaryolar; dashboard, hesaplar, islemler, butce, tahminleme, RegTech, payments ve robo advisor kapsamini icerir.

## 15. Sinirliliklar
- Proje egitim amaclidir.
- Gercek finansal islem yapmaz.
- Gercek banka API baglantisi yoktur.
- Gercek yatirim tavsiyesi uretmez.
- Tahminleme modeli basit son 3 ay ortalamasi + kategori katsayisi yaklasimidir.
- RegTech modulu gercek AML sistemi degil, kural tabanli simulasyondur.

## 16. Gelecek Gelistirmeler
- Gercek acik bankacilik API entegrasyonu
- Kullanici hesabi ve kimlik dogrulama
- Veritabani entegrasyonu
- Daha gelismis ML modeli
- Bildirim sistemi
- Raporlama ve PDF export
- Mobil uyumluluk iyilestirmeleri

## 17. Sonuc
FinWise, ders kapsamindaki temel fintech kavramlarini tek bir uygulamada birlestirerek hem teknik hem de kavramsal bir ogrenme ortami sunmustur. Sprint tabanli ilerleme ve final dokumantasyon ile proje, teslime uygun bir duruma getirilmistir.

## 18. Kaynakca Icin Yer Tutucu
1. [Kaynak 1 - Ders materyali]
2. [Kaynak 2 - Acik bankacilik/PSD2 referansi]
3. [Kaynak 3 - RegTech/AML literaturu]
4. [Kaynak 4 - Next.js resmi dokumantasyonu]

## Kritik Notlar
- Proje egitim amaclidir.
- Gercek finansal islem yapmaz.
- Gercek banka API baglantisi yoktur.
- Gercek yatirim tavsiyesi uretmez.
- Tahminleme modeli: son 3 ay ortalamasi + kategori katsayisi.
- RegTech yaklasimi: gercek AML degil, kural tabanli simulasyon.
