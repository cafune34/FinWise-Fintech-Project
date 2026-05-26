# FinWise V2 - Sınırlılıklar ve Gelecek Geliştirmeler

Bu döküman, FinWise V2 projesinin mevcut işlevsel sınırlarını, teknik ve akademik kısıtlarını ve gelecekte yapılabilecek geliştirmeleri (yol haritası) açıklamaktadır.

---

## 1. Mevcut Kapsam
FinWise V2; Next.js 16.2 App Router mimarisi ve React 19.2 üzerinde inşa edilmiş, Tailwind CSS v4 ile tasarlanmış masaüstü finansal yönetim paneli prototipidir. Kullanıcıya hesap konsolidasyonu (AISP), ödeme başlatma (PISP), risk denetimi (RegTech), bütçeleme ve robo-danışmanlık (WealthTech) deneyimlerini tarayıcı tabanlı `localStorage` veri kalıcılığı ve dinamik grafiklerle sunar.

---

## 2. Teknik Sınırlılıklar
* **Veri Depolama Kısıtları**: Uygulama bir veritabanı sunucusu barındırmaz. Tüm işlemler, hesaplar, bütçe sınırları ve yatırım analiz geçmişi kullanıcının kendi tarayıcısındaki `localStorage` alanında saklanır. Tarayıcı önbelleğinin temizlenmesi durumunda veriler kaybolur.
* **Kural Tabanlı Motor (Rule-based Engine)**: RegTech risk izleme modülü, makine öğrenmesi veya yapay zeka tabanlı anomali tespiti yerine, statik kurallar (örn. belirli tutar limitleri veya bütçe doluluk oranları) üzerinden sinyal üretir.
* **Basit Tahminleme Formülü**: Bütçe tahmin motoru, karmaşık zaman serisi analizleri yerine, son 3 aylık geçmiş harcama ortalamasını temel alan ve kategori katsayıları ekleyen doğrusal bir algoritma kullanır.
* **Masaüstü Odaklı Arayüz**: Arayüz 1366px ve 1440px masaüstü ekranlar hedeflenerek tasarlanmıştır, mobil duyarlılık (responsive) seviyesi temel düzeydedir.

---

## 3. Finansal ve Akademik Sınırlılıklar
* **Banka API Entegrasyonu Yok**: Gerçek bankaların açık bankacılık servisleriyle (API) entegrasyon bulunmamaktadır; tüm veriler arayüz akışlarını simüle etmek amacıyla üretilmiştir.
* **Gerçek İşlem Yapılmaması**: Ödeme başlatma modülü gerçek bir para transferi gerçekleştirmez, AISP/PISP altyapısındaki "Ödeme Başlatma ve Talimat Yönetimi" mantığını tasarımsal olarak gösterir.
* **Yatırım Danışmanlığı Sınırı**: Modüldeki risk anket soruları ve portföy dağılım önerileri finansal/yatırım danışmanlığı kapsamında olmayıp, akademik proje sınırları dahilinde tasarlanmış örnek senaryolardır.

---

## 4. Güvenlik ve Veri Saklama Notları
* Uygulama tamamen "client-side" (istemci tarafında) çalıştığı için kullanıcı verileri herhangi bir harici sunucuya iletilmez veya kaydedilmez.
* Gerçek finansal veriler, kimlik bilgileri veya şifreler sistemde kesinlikle saklanmamalıdır. Demo verileri ve simülasyon amaçlı girdiler kullanılmalıdır.
* Prototip düzeyinde bir kullanıcı kimlik doğrulama (Authentication) veya rol bazlı yetkilendirme (Authorization) mekanizması bulunmamaktadır.

---

## 5. Gelecek Geliştirmeler (Yol Haritası)

### A. Altyapı ve Veri Entegrasyonu
1. **Gerçek Açık Bankacılık API Entegrasyonu**: Türkiye Cumhuriyet Merkez Bankası (TCMB) veya BKM standartlarındaki açık bankacılık API'lerinin entegrasyonu sağlanarak gerçek hesap verilerinin çekilebilmesi ve ödeme başlatılabilmesi.
2. **Backend Veritabanı**: Node.js/Express veya Next.js Server Actions kullanarak SQL (PostgreSQL) veya NoSQL (MongoDB) veritabanı entegrasyonu ile verilerin bulut ortamında güvenli saklanması.
3. **Kullanıcı Hesabı / Kimlik Doğrulama**: OAuth2, JWT ve çok faktörlü kimlik doğrulama (2FA) altyapısının kurulması.
4. **Rol Bazlı Yetkilendirme (RBAC)**: Standart kullanıcı, finansal danışman ve uyum denetçisi (RegTech) rolleri için yetkilendirme altyapısı.

### B. Akıllı Özellikler ve Analitik
5. **Gelişmiş Yapay Zeka / ML**: Bütçe tahminleme, harcama davranışı analizi ve şüpheli işlem tespiti için derin öğrenme ve zaman serisi modellerinin (LSTM vb.) entegre edilmesi.
6. **Gerçek Robo-Danışmanlık Entegrasyonu**: Yatırım profiline göre gerçek aracı kurum API'leri üzerinden fon/hisse senedi alım-satım emirlerinin tetiklenmesi.

### C. Kullanıcı Deneyimi ve Raporlama
7. **PDF Rapor Export**: Aylık finansal sağlık ve harcama raporunun profesyonel grafiklerle PDF olarak indirilebilmesi.
8. **Anlık Bildirim Sistemi**: Bütçe aşımlarında, yaklaşan ödeme talimatlarında ve yüksek riskli işlemlerde anlık SMS, e-posta veya tarayıcı bildirimlerinin gönderilmesi.
9. **Mobil Tasarım İyileştirmesi**: Tailwind CSS v4 ile tam uyumlu, React Native veya PWA (Progressive Web App) destekli mobil öncelikli arayüz tasarımı.
10. **Test Otomasyonu**: Playwright veya Cypress entegrasyonu ile arayüz akışlarının otomatik test edilmesi.
