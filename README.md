# FinWise - Kişisel Finans ve Operasyon Yönetim Paneli

FinWise, Finansal Teknolojiler dersi kapsamında geliştirilen eğitim amaçlı bir kişisel finans ve bütçe yönetim prototipidir. Uygulama; hesap takibi, bütçe analizi, ödeme talimatları, RegTech risk izleme, AI destekli finansal yorumlama, acil durum fonu analizi, harcama davranışı profili ve finansal rapor üretimi özelliklerini tek panelde birleştirir.

## 1. Proje Özeti
FinWise, kullanıcıların bireysel veya küçük ölçekli operasyonel bütçelerini tek bir merkezden izlemesini, analiz etmesini ve yönetmesini amaçlar. Tarayıcı tabanlı `localStorage` snapshot mimarisi sayesinde tüm veriler yerel olarak saklanır ve güvenli bir şekilde yönetilir. Proje, modern fintech gereksinimlerini pratik ve görsel bir kontrol paneli (dashboard) üzerinden simüle eder.

## 2. Öne Çıkan Özellikler
* **Dashboard / Finansal Sağlık Skoru:** Kullanıcının genel bakiye durumunu, gelir-gider dengesini ve finansal sağlık skorunu gösteren dinamik özet paneli.
* **Live Market Ticker:** BIST100, Dolar, Euro, GBP ve Altın fiyatlarını (Frankfurter ve Yahoo Finance API'leri üzerinden) simüle eden ve güncel tutan kayan fiyat bandı.
* **Hesaplar ve İşlem Takibi:** Farklı banka hesapları tanımlama, gelir ve gider ekleme/silme ile tüm hesap hareketlerinin senkronize izlenmesi.
* **Bütçe Planı ve Senaryo Analizi:** Kategori bazlı bütçe limitleri, bütçe aşım uyarıları ve geçmiş harcamalara dayalı 3 aylık bütçe projeksiyonu/senaryoları.
* **Ödeme Talimatları:** PISP/AISP standartlarında yeni ödeme talimatı oluşturma, bekleme, onaylama ve iptal yönetimi.
* **Risk İzleme / RegTech:** Şüpheli işlem hareketlerini, bütçe aşımlarını ve yüksek tutarlı transferleri anlık analiz eden ve risk seviyelerine göre uyarı üreten kural motoru.
* **Gemini API Destekli Copilot & Yerel Fallback:** Finansal verilerin durumuna göre AI destekli kişiselleştirilmiş yorumlar ve öneriler sunan sohbet botu. Gemini API çalışmadığında kural tabanlı yerel analiz fallback mekanizması devreye girer.
* **Acil Durum Fonu:** 3 veya 6 aylık giderleri karşılamayı hedefleyen acil durum fonu hedefi ve tamamlanma yüzdesi takibi.
* **Harcama DNA’sı:** Yatırım ve tüketim davranışlarına göre dinamik olarak hesaplanan finansal kişilik profili (Dengeli Planlayıcı vb.).
* **Satın Alma Gücü:** Enflasyon oranlarının ve zamanın nakit birikimler üzerindeki aşındırıcı etkisini görselleştiren simülasyon paneli.
* **Para Akış Haritası:** Gelir akışlarının hesaplara ve bütçe kategorilerine dağılımını gösteren görsel akış haritası.
* **Harcama Isı Haritası:** Haftalık ve günlük harcama yoğunluğunu gösteren matris görselleştirmesi.
* **Finansal Analiz PDF Raporu:** jsPDF ve html2canvas kütüphaneleriyle oluşturulan, tüm grafik ve verileri içeren indirilebilir finansal analiz raporu.
* **JSON Export/Import:** localStorage verilerini yedekleme ve geri yükleme imkanı.

## 3. Kullanılan Teknolojiler
* **Core:** Next.js 16.2 & React 19.2 (TypeScript)
* **Styling:** Tailwind CSS v4 & Vanilla CSS
* **Grafikler & Görselleştirme:** Recharts
* **Veri Yedekleme:** Tarayıcı tabanlı `localStorage` Snapshot mimarisi
* **Yapay Zeka:** Gemini API (Google Generative AI REST API)
* **Raporlama:** jsPDF, html2canvas
* **Sürüm Kontrolü:** GitHub

## 4. Demo Veri Seti
Projede, gerçekçi bir devlet memurunun bütçesini simüle eden varsayılan veri seti yüklü gelmektedir:
* **Portföy (Toplam Varlık):** 148.100 TL
* **Aylık Gelir:** 48.500 TL
* **Aylık Gider:** 30.520 TL
* **Net Nakit Akışı:** 17.980 TL
* **RegTech Sinyali/Uyarısı:** 2 aktif uyarı
* **Acil Durum Fonu Tamamlanma Oranı:** %61,1
* **Harcama DNA'sı:** Dengeli Planlayıcı / Orta Risk

## 5. Gemini Copilot
FinWise Copilot, kullanıcının güncel finansal profilini (bakiye, işlemler, bütçe limitleri, risk durumları) analiz ederek anlamlı finansal tavsiyeler üretir.
* **REST API Yapısı:** API istekleri en güncel Google AI endpoint standartlarına uygundur.
* **Güvenli Fallback:** API anahtarı girilmemişse veya kota dolmuşsa, yerel kural motoru devreye girerek kullanıcının sorusuna uygun statik finansal analiz çıktılarını anında üretir.

## 6. Kurulum
Bağımlılıkları yüklemek için:
```bash
npm install
```

## 7. Ortam Değişkenleri
AI özelliklerinin çalışabilmesi için projenin kök dizininde bir `.env.local` dosyası oluşturup aşağıdaki değişkeni tanımlayabilirsiniz:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```
*Not: API anahtarı girilmediğinde sistem otomatik olarak yerel analiz motoru (fallback) modunda çalışacaktır.*

## 8. Çalıştırma Komutları
Yerel geliştirme sunucusunu başlatmak için:
```bash
npm run dev
```
Uygulamayı derlemek ve optimize etmek için:
```bash
npm run build
npm run start
```

## 9. Test Durumu
* **Linter Kontrolleri:** `npm run lint` komutuyla tüm ESLint kuralları kontrol edilmiş ve sıfır hata ile doğrulanmıştır.
* **Derleme Testi:** `npm run build` komutuyla Next.js derleme süreci test edilmiş ve statik sayfalar ile dinamik yollar hatasız bir şekilde oluşturulmuştur.

## 10. Sınırlılıklar
* **Açık Bankacılık API'leri:** Gerçek banka API entegrasyonu bulunmamakta, işlemler ve hesaplar simüle edilmektedir.
* **Ödeme Sistemleri:** Gerçek bir para transferi veya ödeme geçidi bulunmaz, PISP mekanizmasının UI seviyesindeki durum yönetimi gösterilmektedir.
* **Finansal Öneriler:** Yapay zeka veya yerel analiz çıktısı olarak verilen öneriler eğitim amaçlıdır, kesinlikle yatırım tavsiyesi niteliği taşımaz.
