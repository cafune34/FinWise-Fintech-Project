# FinWise V2 - Akademik Rapor

## 1. Kapak Bilgileri
- **Ders**: Finansal Teknolojiler (Fintech)
- **Proje Adı**: FinWise V2 - Kişisel Finans ve Operasyon Yönetim Paneli
- **Dönem**: 2025-2026 Güz/Bahar Dönemi
- **Hazırlayan(lar)**: [Öğrenci Adı Soyadı]
- **Öğrenci Numarası**: [Öğrenci Numarası]
- **Teslim Tarihi**: 26 Mayıs 2026

---

## 2. Özet
FinWise V2, Finansal Teknolojiler dersi kapsamında geliştirilen; açık bankacılık standartları, kişisel finans yönetimi (PFM), RegTech (risk izleme) ve robo-danışmanlık (yatırım profili analizi) gibi fintech alanlarını bir araya getiren bütünsel bir finansal kontrol panelidir. V1 sürümünün ardından kullanıcı arayüzü kurumsal seviyeye getirilmiş, dinamik veri girişi sağlanmış ve tüm finansal veriler tarayıcı tabanlı `localStorage` üzerinden kalıcı hale getirilmiştir. Bu rapor, platformun akademik ve teknik temellerini, işlevsel modüllerini ve geliştirme sürecini özetlemektedir.

---

## 3. Projenin Amacı
Projenin temel amacı, modern finansal teknoloji konseptlerini kullanıcı dostu ve işlevsel bir web prototipinde görselleştirerek sunmaktır. Çevik (sprint tabanlı) ürün geliştirme disipliniyle yürütülen süreçte, ders müfredatında yer alan teorik açık bankacılık (AISP/PISP), RegTech ve robo-danışmanlık prensiplerinin çalışan bir sistem üzerinde somutlaştırılması hedeflenmiştir.

---

## 4. Problem Tanımı
Bireylerin ve işletmelerin finansal süreçlerini yönetirken karşılaştığı en büyük zorluk, farklı bankalarda bulunan varlıklarının, harcamalarının, yaklaşan ödeme talimatlarının ve bütçe limitlerinin dağınık yapılarda olmasıdır. Bu dağınıklık, nakit akışının doğru analiz edilmesini engellemekte, aşırı harcamalara yol açmakta ve şüpheli işlemlerin gözden kaçmasına sebep olmaktadır. FinWise V2, bu dağınık verileri birleştirerek analiz eden ve akıllı öneriler sunan bir yönetim paneli ihtiyacını karşılar.

---

## 5. Finansal Teknolojiler ile İlişki
FinWise V2, fintech sektörünün ana omurgasını oluşturan dört temel başlık ile doğrudan ilişkilidir:
- **Açık Bankacılık (Open Banking)**: Hesap bilgilerinin konsolidasyonu ve ödeme başlatılması.
- **Kişisel Finans Yönetimi (PFM - Personal Finance Management)**: Gelir-gider takibi, bütçe yönetimi ve harcama tahmini.
- **RegTech (Risk ve Mevzuat Teknolojileri)**: İşlem ve hesap güvenliğini sağlamak için kural tabanlı denetim.
- **Robo-Danışmanlık (WealthTech)**: Yatırımcı risk tercihine göre dijital portföy önerileri hazırlama.

---

## 6. Açık Bankacılık Yaklaşımı
Açık bankacılık, bankaların müşteri izinleri dahilinde veri tabanlarını API (Application Programming Interface) aracılığıyla üçüncü parti geliştiricilere açmasıdır. FinWise V2, kullanıcıya tüm bankalardaki bakiyelerini tek bir panelden izleme (AISP) ve bu panel üzerinden ödeme emri başlatma (PISP) deneyimi sunarak açık bankacılığın pratik değerini gösterir.

---

## 7. AISP ve PISP Bağlantısı
- **Hesap Bilgisi Hizmeti Sağlayıcısı (AISP - Account Information Service Provider)**: FinWise V2, kullanıcının farklı finansal kuruluşlardaki (örn. bankalar) hesap verilerini güvenli bir şekilde birleştirerek "Hesaplar" modülünde tek bir çatı altında sunar.
- **Ödeme Başlatma Hizmeti Sağlayıcısı (PISP - Payment Initiation Service Provider)**: "Ödeme Talimatları" modülü aracılığıyla kullanıcı, platform dışına çıkmadan doğrudan mevcut banka hesaplarından üçüncü kişilere ödeme emri gönderebilmektedir.

---

## 8. Kişisel Finans Yönetimi Modülü
Kişisel finans yönetimi (PFM), bireysel kullanıcıların harcamalarını analiz etmelerini ve bütçe kontrolü sağlamalarını destekler. FinWise V2 bünyesindeki Genel Bakış, Hesaplar, İşlemler ve Bütçe Planı modülleri entegre çalışarak kullanıcılara bütçe disiplini kazandırır ve nakit akışını kontrol altında tutmalarına yardımcı olur.

---

## 9. Veri Girişi ve Yerel Veri Yönetimi
Uygulamada veri kalıcılığı `localStorage` Snapshot mimarisi ile sağlanmıştır:
- İlk kurulumda `mockData.ts` içerisindeki varsayılan veriler yüklenir.
- Kullanıcı tarafından yapılan her işlem ekleme/silme, hesap ekleme, bütçe limiti güncelleme, ödeme talimatı oluşturma veya yatırım profili anket çözümü, tarayıcının yerel belleğine yazılır.
- "Başlangıç Verilerine Dön" özelliği ile veriler istenildiği zaman sıfırlanabilir.

---

## 10. Dashboard / Genel Bakış
Dashboard, platformun ana yönetim panelidir. Bu ekranda:
- **Finansal Sağlık Skoru**: Gelir/gider dengesi, bütçe aşım oranları ve risk seviyelerine göre dinamik hesaplanan performans notu.
- **Metrik Kartları**: Toplam bakiye, aylık gelir, aylık gider ve net nakit akışı verileri.
- **Görsel Analitik**: Recharts kütüphanesi kullanılarak oluşturulan kategori bazlı harcama dağılım grafiği (pasta grafik) ve son 6 aylık nakit akış trendi (çizgi grafik).
- **Operasyon Özeti**: Son eklenen işlemler, yüksek riskli uyarılar, aktif yatırım profili ve bekleyen ödeme talimatları tek bir noktada özetlenir.

---

## 11. Hesaplar Modülü
Hesaplar modülü, kullanıcının sisteme kayıtlı banka hesaplarını listeler. Kullanıcılar hesap adı, banka adı, hesap türü (vadesiz/vadeli), para birimi ve güncel bakiye bilgilerini görebilirler. Modül, dinamik "Yeni Hesap Ekleme" formu ile yeni hesap girişlerini kabul eder ve toplam bakiyeyi anlık günceller.

---

## 12. İşlemler Modülü
İşlemler modülü, tüm hesap hareketlerinin kronolojik listesidir. 
- **Filtreleme**: Kategori, hesap ve tarih aralığına göre arama ve filtreleme.
- **İşlem Ekleme**: Gelir veya gider türünde dinamik işlem kaydı oluşturma.
- **İşlem Silme**: Hatalı veya güncelliğini yitirmiş işlemleri listeden çıkarma. Yapılan her ekleme/silme işlemi bağlı olduğu hesabın bakiyesini ve genel dashboard metriklerini anlık etkiler.

---

## 13. Bütçe Planı Modülü
Bütçe Planı modülü, kullanıcıların harcama disiplini kurmasını hedefler. Kategori bazında (Örn: Gıda, Ulaşım, Eğlence, Fatura) aylık bütçe limitleri tanımlanır. Mevcut harcama tutarları belirlenen limitler ile karşılaştırılarak doluluk oranları bar grafiklerle görselleştirilir.

---

## 14. Tahminleme ve Akıllı Uyarılar
Bütçe Planı altında çalışan akıllı tahminleme motoru; kullanıcının ilgili kategorideki son 3 aylık harcama ortalamasını alır ve kategoriye özel belirlenmiş mevsimsel/trend katsayılarını kullanarak bir sonraki ayın tahmini harcama tutarını hesaplar. Tahmini harcama belirlenen limiti aşıyorsa arayüzde akıllı uyarı gösterilir.

---

## 15. Risk İzleme Modülü
Risk İzleme (RegTech) modülü, işlem güvenliğini denetleyen kural tabanlı bir risk motorudur. Belirlenen kurallar (Tek seferde >15.000 TL transfer, aylık bütçenin %90'ının aşılması, kısa sürede yüksek frekanslı işlemler vb.) doğrultusunda sistem dinamik olarak risk sinyalleri üretir. Her sinyal; risk seviyesi (Düşük, Orta, Yüksek), tespit sebebi, finansal etki analizi ve önerilen aksiyon planı ile birlikte sunulur.

---

## 16. Ödeme Talimatları Modülü
Ödeme Talimatları modülü, PISP rolünü simüle eder. Kullanıcı; alıcı adı, IBAN, gönderilecek hesap, tutar ve açıklama girerek yeni bir ödeme talimatı oluşturur. Oluşturulan talimatlar durumlarına göre (Bekliyor, Tamamlandı, İptal Edildi) gruplanır. Kullanıcı talimatları onaylayabilir, iptal edebilir veya geçmiş detaylarını inceleyebilir.

---

## 17. Yatırım Profili Modülü
Yatırım Profili (Robo-Danışmanlık) modülü, kullanıcıların yatırım kararlarını destekler.
- **Risk Anketi**: Kullanıcının yaş, gelir ve risk algısını ölçen 5 adımlı interaktif anket.
- **Profil Sınıflandırması**: Anket puanına göre Muhafazakar, Dengeli veya Agresif profil ataması.
- **Portföy Önerisi**: Profil türüne uygun varlık dağılımı (Mevduat, Altin, Hisse Senedi, Eurobond) dinamik halka (donut) grafik ile sunulur.
- **Analiz Geçmişi**: Geçmiş anket sonuçlarının tarih bazlı takibi sağlanır.

---

## 18. Sistem Mimarisi
Uygulama, modüler ve temiz kod prensiplerine uygun olarak üç katmanlı bir mimariyle tasarlanmıştır:
1. **Sunum Katmanı (UI/Client)**: Tailwind CSS v4 ile stilize edilmiş, React bileşenlerinden oluşan Next.js sayfaları.
2. **İş Mantığı Katmanı (Business Logic)**: Risk kurallarının işletildiği, bütçe tahminlemesinin hesaplandığı ve veri kalıcılığının koordine edildiği `src/lib` fonksiyonları.
3. **Veri Erişim Katmanı (Data Layer)**: İlk veri yüklemesinden sorumlu `src/data/mockData.ts` ve çalışma zamanı güncellemelerini üstlenen `localStorage` snapshot mekanizması.

---

## 19. Kullanılan Teknolojiler
- **Framework**: Next.js 16.2.6 (App Router)
- **Kütüphaneler**: React 19.2.4, Lucide React (İkonlar), Recharts (Grafikler), Tailwind CSS v4 (Arayüz tasarımı), Zod (Şema doğrulama)
- **Geliştirme Araçları**: TypeScript, ESLint

---

## 20. Test Yaklaşımı
Uygulamanın kararlılığı ve veri tutarlılığı için modül bazlı manuel entegrasyon test senaryoları tasarlanmıştır. Bu senaryolar; hesap ekleme, işlem ekleme/silme, bütçe güncellemeleri, risk motorunun tepki süresi, ödeme talimatlarının durum geçişleri ve yatırım anketi sonuçlarının `localStorage` üzerinde doğru şekilde saklanıp güncellenmesini doğrulamaktadır.

---

## 21. Ekran Görüntüsü Yer Tutucuları
Dokümantasyonun görselleştirilmesi amacıyla aşağıdaki ekran görüntüleri teslim paketine dahil edilmiştir:
- **Şekil 1**: Landing Page (Giriş ve özellik tanıtım ekranı)
- **Şekil 2**: Genel Bakış (Dashboard ana kontrol paneli ve grafikler)
- **Şekil 3**: Hesaplar (Banka hesap listesi ve ekleme formu)
- **Şekil 4**: İşlemler (Kronolojik işlemler listesi ve filtreleme)
- **Şekil 5**: Bütçe Planı (Bütçe limitleri, doluluk oranları ve tahminleme)
- **Şekil 6**: Risk İzleme (RegTech paneli, sinyaller ve detay analizler)
- **Şekil 7**: Ödeme Talimatları (Yeni talimat başlatma ve işlem geçmişi)
- **Şekil 8**: Yatırım Profili (Risk anket ekranı ve portföy dağılım önerileri)

---

## 22. Sınırlılıklar
* **Gerçek Banka API Entegrasyonu**: Uygulamada gerçek bankaların açık bankacılık servisleriyle (API) entegrasyon bulunmamaktadır; tüm veriler arayüz akışlarını simüle etmek amacıyla üretilmiştir.
* **Veri Depolama**: Veriler sadece tarayıcı tabanlı `localStorage` üzerinde yönetilir; sunucu tabanlı kalıcı veri tabanı entegrasyonu yoktur.
* **Ödeme Modülü**: Ödeme modülü gerçek bir para transferi gerçekleştirmez, AISP/PISP altyapısındaki "Ödeme Başlatma ve Talimat Yönetimi" mantığını göstermek amacıyla tasarlanmıştır.
* **Risk Analizi**: Risk motoru yapay zekaya dayalı anomali tespiti yerine kural tabanlı (rule-based) çalışmaktadır.
* **Tahminleme Modeli**: Basit geçmiş veri ortalaması ve kategori katsayısı yaklaşımıyla gelecek tahminlemesi yapar.
* **Yatırım Profili**: Modüldeki risk anket soruları ve portföy dağılım önerileri finansal/yatırım danışmanlığı kapsamında olmayıp, akademik proje sınırları dahilinde tasarlanmıştır.

---

## 23. Gelecek Geliştirmeler
- **Gerçek Açık Bankacılık API Entegrasyonu**: Türkiye Cumhuriyeti Merkez Bankası (TCMB) veya BKM standartlarındaki açık bankacılık API'lerinin entegrasyonu.
- **Kullanıcı Hesabı / Kimlik Doğrulama**: OAuth2 ve çift faktörlü kimlik doğrulama (2FA) altyapısının kurulması.
- **Backend Veritabanı**: SQL veya NoSQL veritabanı entegrasyonu ile verilerin bulut ortamında güvenli saklanması.
- **Rol Bazlı Yetkilendirme**: Standart kullanıcı ve uyum denetçisi (RegTech) rolleri için yetkilendirme altyapısı.
- **Gelişmiş Yapay Zeka/ML**: Bütçe tahminleme ve şüpheli işlem tespiti için makine öğrenmesi modelleri.
- **Bildirim Sistemi**: Limit aşımlarında ve yüksek riskli işlemlerde anlık SMS/E-posta veya push bildirim sistemi.
- **PDF Rapor Export**: Aylık finansal sağlık raporunun PDF olarak indirilebilmesi.

---

## 24. Sonuç
FinWise V2; açık bankacılık, kişisel finans yönetimi, RegTech ve WealthTech gibi temel finansal teknoloji konularını tek bir çatı altında başarılı bir şekilde entegre etmiştir. V2 sürümünde yapılan UI yenilikleri, veri kalıcılığı katmanı ve geliştirilen profesyonel modüller sayesinde, teorik ders konuları çalışan ve test edilebilir bir fintech ürün prototipine dönüştürülmüştür.

---

## 25. Kaynakça
1. Türkiye Cumhuriyet Merkez Bankası (TCMB) - Açık Bankacılık Standartları ve Rehberleri.
2. PSD2 (Payment Services Directive 2) - European Union Directive for Payment Services.
3. RegTech Association - Regulatory Technology and AML Compliance Standards.
4. Next.js & React Official Documentation - Next.js App Router and React 19 APIs.
5. Recharts & Tailwind CSS Documentation - Data Visualization and Utility-First Styling Guides.
