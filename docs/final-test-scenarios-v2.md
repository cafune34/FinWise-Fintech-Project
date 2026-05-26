# FinWise V2 - Final Test Senaryoları

Bu döküman, FinWise V2 platformundaki tüm modüllerin kararlılığını ve işlevselliğini doğrulamak amacıyla hazırlanan entegrasyon ve kullanıcı kabul test senaryolarını içermektedir.

---

## 1. Landing (Tanıtım Sayfası) Testleri

### Test L-01: Landing Sayfası Tasarım ve Yönlendirme Kontrolü
* **Amaç**: Root path (`/`) açıldığında landing bileşenlerinin doğru yüklenmesi ve dashboard'a yönlendirilmesi.
* **Adımlar**:
  1. Tarayıcıda uygulamayı başlatın (`http://localhost:3000/`).
  2. Sayfa içeriğindeki başlık, açıklama metinleri ve modül kartlarını kontrol edin.
  3. "Sisteme Giriş Yap" butonuna tıklayın.
* **Beklenen Sonuç**: Sayfa hatasız yüklenir, "Sisteme Giriş Yap" butonu kullanıcıyı `/dashboard` sayfasına yönlendirir.
* **Durum**: Başarılı

---

## 2. Genel Bakış (Dashboard) Testleri

### Test D-01: Finansal Sağlık Skoru ve Metriklerin Yüklenmesi
* **Amaç**: Kontrol panelinde yer alan finansal sağlık skoru, toplam bakiye ve gelir-gider metriklerinin doğru yüklenmesi.
* **Adımlar**:
  1. `/dashboard` adresine gidin.
  2. Finansal Sağlık Skoru dairesel grafiğini ve güncel puanı inceleyin.
  3. Toplam Bakiye kartındaki verinin diğer hesapların toplamıyla uyuştuğunu kontrol edin.
* **Beklenen Sonuç**: Tüm metrik kartları ve grafikler hatasız yüklenir, veri hesaplamaları tutarlıdır.
* **Durum**: Başarılı

### Test D-02: Operasyon Özeti Kartı Kontrolleri
* **Amaç**: Dashboard'da yer alan aktif yatırım profili, bekleyen talimatlar ve yüksek riskli uyarıların listelenmesi.
* **Adımlar**:
  1. Dashboard sayfasının en altına kaydırın.
  2. "Operasyon Özeti" başlığı altındaki 3 kartı kontrol edin.
* **Beklenen Sonuç**: Aktif yatırım profili, bekleyen talimat sayısı ve riskli uyarı sayısı doğru şekilde özetlenir.
* **Durum**: Başarılı

---

## 3. Hesaplar Modülü Testleri

### Test A-01: Dinamik Yeni Hesap Ekleme
* **Amaç**: Kullanıcının banka hesap listesine yeni bir hesap ekleyebilmesi.
* **Adımlar**:
  1. `/accounts` sayfasına gidin.
  2. "Yeni Hesap Ekle" formunda Banka Adı, Hesap Adı, Hesap Türü (Vadesiz/Vadeli), Para Birimi (TL/USD/EUR) ve Başlangıç Bakiyesi girin.
  3. "Hesap Ekle" butonuna tıklayın.
* **Beklenen Sonuç**: Yeni hesap listeye eklenir, bakiye toplamı güncellenir ve veri localStorage'a kaydedilir.
* **Durum**: Başarılı

---

## 4. İşlemler Modülü Testleri

### Test T-01: Dinamik İşlem Ekleme ve Bakiye Senkronizasyonu
* **Amaç**: İşlem geçmişine yeni bir gelir/gider ekleme ve ilgili banka hesabının bakiyesinin güncellenmesi.
* **Adımlar**:
  1. `/transactions` sayfasına gidin.
  2. "Yeni İşlem Ekle" formuna girin: Tür (Gider), İlgili Hesap (İş Bankası), Kategori (Ulaşım), Tutar (500 TL), Açıklama (Metro biletleri).
  3. "İşlem Ekle" butonuna tıklayın.
* **Beklenen Sonuç**: İşlem geçmişinde yeni kayıt görünür, İş Bankası hesabının bakiyesi 500 TL düşer.
* **Durum**: Başarılı

### Test T-02: İşlem Filtreleme
* **Amaç**: İşlemler listesinin kategori, hesap ve arama metnine göre süzülmesi.
* **Adımlar**:
  1. `/transactions` sayfasında filtreleme çubuğuna gidin.
  2. Kategori filtresini "Gıda" olarak seçin veya Arama kutusuna "Abonelik" yazın.
* **Beklenen Sonuç**: Liste sadece kriterlere uyan işlemleri gösterecek şekilde daralır.
* **Durum**: Başarılı

### Test T-03: İşlem Silme ve Bakiye İadesi
* **Amaç**: Mevcut bir işlemin silinmesi ve bakiyenin eski haline dönmesi.
* **Adımlar**:
  1. `/transactions` sayfasında en son eklediğiniz 500 TL'lik gider işleminin yanındaki "Sil" butonuna tıklayın.
* **Beklenen Sonuç**: İşlem listeden kalkar, İş Bankası hesabının bakiyesine 500 TL geri yüklenir.
* **Durum**: Başarılı

---

## 5. Bütçe Planı Testleri

### Test B-01: Bütçe Limiti Güncelleme
* **Amaç**: Kategori bazlı bütçe limitinin kullanıcı tarafından düzenlenmesi.
* **Adımlar**:
  1. `/budget` sayfasına gidin.
  2. "Eğlence" kategorisinin yanındaki "Limiti Düzenle" butonuna tıklayın.
  3. Limit değerini 3.000 TL olarak güncelleyin ve kaydedin.
* **Beklenen Sonuç**: Eğlence kategorisinin bütçe limiti ve doluluk bar grafik oranı güncellenir.
* **Durum**: Başarılı

### Test B-02: Bütçe Harcama Tahmini ve Akıllı Uyarı
* **Amaç**: Gelecek dönem harcama tahmininin çalışması ve potansiyel limit aşımında uyarı verilmesi.
* **Adımlar**:
  1. Bütçe Planı sayfasındaki "Gelecek Dönem Harcama Tahminleri" tablosunu inceleyin.
  2. Tahmin edilen tutarın, belirlenen limitin üzerinde olduğu bir kategori için akıllı uyarı simgesinin çıkıp çıkmadığını kontrol edin.
* **Beklenen Sonuç**: Sistem geçmiş 3 aylık verilere göre tahmini harcamayı hesaplar ve limiti aşan kalemlerde kırmızı uyarı gösterir.
* **Durum**: Başarılı

---

## 6. Risk İzleme (RegTech) Testleri

### Test R-01: Risk Sinyali Üretilmesi
* **Amaç**: Belirli kurallar ihlal edildiğinde RegTech motorunun dinamik risk sinyali üretmesi.
* **Adımlar**:
  1. `/transactions` sayfasında 20.000 TL tutarında yüksek bir harcama ekleyin (Limit aşımı kuralı tetiklenmesi için).
  2. `/regtech` sayfasına gidin ve üretilen sinyalleri kontrol edin.
* **Beklenen Sonuç**: Risk İzleme ekranında "Yüksek Tutarlı Transfer" veya ilgili bütçe aşımı uyarısı Düşük/Orta/Yüksek risk kategorisinde listelenir.
* **Durum**: Başarılı

### Test R-02: Risk Detayı ve Aksiyon Planı İnceleme
* **Amaç**: Risk uyarı detaylarının (Sebep, etki analizi, aksiyon önerisi) görüntülenmesi.
* **Adımlar**:
  1. `/regtech` sayfasında yer alan bir uyarı kartına tıklayın veya detay alanını inceleyin.
* **Beklenen Sonuç**: Risk uyarısının nedeni, finansal sisteme olan olası etkisi ve atılması gereken adımlar net şekilde listelenir.
* **Durum**: Başarılı

---

## 7. Ödeme Talimatları Testleri

### Test P-01: Yeni Ödeme Talimatı Oluşturma
* **Amaç**: Kullanıcının yeni bir PISP ödeme emri başlatabilmesi.
* **Adımlar**:
  1. `/payments` sayfasına gidin.
  2. Formda Alıcı Adı (Örn: Mehmet Can), Alıcı IBAN, Gönderilecek Hesap ve Tutar (2.000 TL) girip "Talimat Oluştur"a tıklayın.
* **Beklenen Sonuç**: Talimat başarıyla oluşturulur ve "Bekleyen Talimatlar" listesinde görünür. Bakiye henüz düşmez.
* **Durum**: Başarılı

### Test P-02: Talimat Onaylama ve Bakiye Düşümü
* **Amaç**: Bekleyen bir talimatın onaylanarak tamamlanması ve tutarın hesaptan düşülmesi.
* **Adımlar**:
  1. `/payments` sayfasında bekleyen talimatın yanındaki "Onayla" butonuna tıklayın.
* **Beklenen Sonuç**: Talimat "Tamamlandı" statüsüne geçer, ilgili banka hesabından 2.000 TL düşülür.
* **Durum**: Başarılı

### Test P-03: Talimat İptali
* **Amaç**: Bekleyen bir talimatın hesaptan para düşmeden iptal edilmesi.
* **Adımlar**:
  1. Yeni bir talimat oluşturun (1.000 TL).
  2. Bu talimatın yanındaki "İptal Et" butonuna tıklayın.
* **Beklenen Sonuç**: Talimat "İptal Edildi" statüsüne geçer, ilgili hesap bakiyesinde herhangi bir azalma olmaz.
* **Durum**: Başarılı

---

## 8. Yatırım Profili (Robo-Danışmanlık) Testleri

### Test I-01: Risk Profili Belirleme Anketi
* **Amaç**: Risk anketinin tamamlanarak risk kategorisinin dinamik hesaplanması.
* **Adımlar**:
  1. `/robo-advisor` sayfasına gidin.
  2. "Risk Profili Analiz Anketi"ni başlatın.
  3. 5 adet sorunun cevaplarını seçerek anketi tamamlayın.
* **Beklenen Sonuç**: Kullanıcının verdiği cevapların puan toplamına göre risk profili (Dengeli, Agresif veya Muhafazakar) belirlenir.
* **Durum**: Başarılı

### Test I-02: Portföy Önerisi ve Geçmiş Kayıt Takibi
* **Amaç**: Risk profilinin portföy dağılımına yansıması ve geçmiş analizlere kaydedilmesi.
* **Adımlar**:
  1. Anket sonucundaki varlık dağılım grafiğini (Donut grafik) inceleyin.
  2. "Analiz Geçmişi" tablosunda yeni anketin tarih ve sonuç bilgisini kontrol edin.
* **Beklenen Sonuç**: Portföy grafiği profile göre güncellenir, geçmişe yeni analiz kaydı eklenir.
* **Durum**: Başarılı

---

## 9. LocalStorage Kalıcılığı Testi

### Test S-01: Tarayıcı Yenileme Sonrası Veri Kontrolü
* **Amaç**: Sayfa yenilendiğinde verilerin kaybolmamasının doğrulanması.
* **Adımlar**:
  1. `/accounts` sayfasında yeni bir hesap ekleyin.
  2. Tarayıcıda F5 tuşuna basarak sayfayı yenileyin.
  3. Eklenen hesabın listede kalıp kalmadığını kontrol edin.
* **Beklenen Sonuç**: Eklenen hesap yenileme sonrasında da listede görünür, veri kalıcıdır.
* **Durum**: Başarılı

---

## 10. Reset Data (Verileri Sıfırlama) Testi

### Test R-03: Sistem Ayarlarını Sıfırlama
* **Amaç**: Tüm kullanıcı verilerini silerek fabrika ayarlarına (ilk mock verilere) dönülmesi.
* **Adımlar**:
  1. Yan menünün altındaki "Başlangıç Verilerine Dön" butonuna tıklayın.
  2. Çıkan onay penceresinde "Sıfırla" butonuna basarak onaylayın.
* **Beklenen Sonuç**: Tüm dinamik veriler silinir, sistem ilk mock veri setini yükler ve ana sayfaya yönlendirilir.
* **Durum**: Başarılı
