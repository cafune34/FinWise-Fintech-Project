# FinWise Test Senaryolari

## Dashboard

### Test Adi
Dashboard Ozet Kartlari Dogrulama

### Amac
Toplam bakiye, aylik gelir, aylik gider ve net nakit akisi kartlarinin mock veriden dogru uretildigini kontrol etmek.

### Adimlar
1. Uygulamayi acin ve `/dashboard` sayfasina gidin.
2. Ozet kartlarindaki degerleri not edin.
3. Hesaplar ve islemlerle uyumlu olup olmadigini karsilastirin.

### Beklenen Sonuc
Kartlar sayisal olarak tutarli gorunur ve sayfa hata vermeden yuklenir.

## Accounts

### Test Adi
Hesap Kartlari ve Maskeli Bilgi Gosterimi

### Amac
Mock banka hesaplarinin kartlar halinde listelendigini ve bilgilerinin dogru formatta gosterildigini dogrulamak.

### Adimlar
1. `/accounts` sayfasina gidin.
2. Hesap kartlarinda banka adi, hesap tipi, bakiye ve maskeli IBAN alanlarini kontrol edin.
3. Hesap bazli son islem ozetini inceleyin.

### Beklenen Sonuc
Tum hesap kartlari eksiksiz listelenir, formatlar dogrudur ve gercek banka baglantisi olmadigina dair not gorunur.

## Transactions

### Test Adi
Islem Filtreleme Kontrolu

### Amac
Kategori, islem tipi ve hesap filtrelerinin birlikte calistigini dogrulamak.

### Adimlar
1. `/transactions` sayfasina gidin.
2. Sirayla kategori, islem tipi ve hesap filtresi secin.
3. Filtreleri birlikte degistirerek tablodaki sonuclarin degisip degismedigini kontrol edin.

### Beklenen Sonuc
Tablo secilen filtrelere gore guncellenir ve beklenmeyen satirlar gorunmez.

## Budget

### Test Adi
Butce Asim ve Kullanim Yuzdesi Hesabi

### Amac
Kategori bazli harcama, limit, kalan tutar ve asim durumunun dogru hesaplandigini dogrulamak.

### Adimlar
1. `/budget` sayfasina gidin.
2. Her kategori icin limit ve harcama degerlerini kontrol edin.
3. Asim olan kategorilerde uyari durumunu inceleyin.

### Beklenen Sonuc
Kullanim yuzdesi ve asim durumu dogru gorunur, riskli kategoriler ayri olarak listelenir.

## Forecasting

### Test Adi
Tahminleme Ciktisi Dogrulama

### Amac
Tahminleme ciktisinin son 3 ay ortalamasi + kategori katsayisi yaklasimina uygun oldugunu kontrol etmek.

### Adimlar
1. Dashboard veya Budget ekranindaki tahmin kartlarini acin.
2. En az bir kategoride onceki ay trendi ile tahmin degerini karsilastirin.
3. Butce riski olan kategorilerin ustte listelendigini kontrol edin.

### Beklenen Sonuc
Tahmin degerleri tutarli gorunur ve riskli kategoriler oncelikli listelenir.

## RegTech

### Test Adi
Kural Tabanli Uyari Uretimi

### Amac
RegTech modulu tarafindan high/medium/low seviyeli uyarilarin uretildigini dogrulamak.

### Adimlar
1. `/regtech` sayfasina gidin.
2. Toplam uyari ve seviye dagilim kartlarini kontrol edin.
3. Uyari listesinde sebep aciklamalarini inceleyin.

### Beklenen Sonuc
Uyarilar sayfada listelenir, seviye dagilimi dogru gorunur ve egitim/simulasyon notu yer alir.

## Payments

### Test Adi
Odeme Emri Simulasyon Akisi

### Amac
Odeme formunun validasyonla calistigini ve sonucu simulasyon olarak dondugunu dogrulamak.

### Adimlar
1. `/payments` sayfasina gidin.
2. Kaynak hesap, alici, tutar ve aciklama alanlarini doldurun.
3. Formu gonderin ve sonuc kartini kontrol edin.

### Beklenen Sonuc
Odeme emri simulasyon sonucu uretilir, referans bilgisi gorunur ve gercek transfer yapilmadigi net sekilde belirtilir.

### Test Notu
Bu modulde gercek para transferi/fatura odemesi yapilmamasi zorunludur.

## Robo Advisor

### Test Adi
Risk Anketi ve Portfoy Sonucu

### Amac
Anket cevaplarina gore risk profilinin olustugunu ve portfoy dagiliminin guncellendigini dogrulamak.

### Adimlar
1. `/robo-advisor` sayfasina gidin.
2. 5 soruyu farkli kombinasyonlarla cevaplayin.
3. Sonucta risk profili ve portfoy dagilimini kontrol edin.

### Beklenen Sonuc
Cevaplara uygun risk profili uretilir, portfoy dagilimi gosterilir ve modulde yatirim tavsiyesi verilmedigi belirtilir.

### Test Notu
Bu modulde uretilen ciktinin gercek yatirim tavsiyesi olmadigi acikca gorunmelidir.
