# FinWise - Kişisel Finans ve Operasyon Yönetim Paneli (V2)

FinWise V2, bireysel ve kurumsal finansal durum takibini tek bir çatı altında toplayan, masaüstü odaklı, modern ve profesyonel bir finansal kontrol paneli (fintech) platformudur. Açık bankacılık standartları, kişisel finans yönetimi, risk izleme ve yatırım profili analizlerini kullanıcı dostu ve akıcı bir arayüzle sunar.

---

## 📖 Ders Bağlamı
Bu proje, üniversite düzeyindeki **Finansal Teknolojiler (Fintech)** dersi kapsamında, çevik ürün geliştirme yöntemleri (sprint tabanlı süreçler) takip edilerek tasarlanmış ve geliştirilmiştir. FinTech teorisindeki açık bankacılık (AISP/PISP), risk uyumluluğu (RegTech) ve dijital portföy yönetimi (Robo-danışmanlık) kavramlarının arayüz ve akış düzeyindeki pratik uygulamalarını sergilemek amacıyla hazırlanmıştır.

---

## 🎯 Proje Amacı
- **Entegre Finansal Görünüm**: Birden fazla banka hesabını, nakit akışını ve bütçe limitlerini tek ekrandan yönetmek.
- **Teorik Fintech Uygulamaları**: Açık bankacılık, ödeme hizmetleri ve yatırım analitiği teorisini çalışan bir prototipe dönüştürmek.
- **Yerel Veri Kalıcılığı**: Sunucu bağımlılığı olmadan, tüm kullanıcı girişlerini ve dinamik hesaplamaları tarayıcı belleğinde (localStorage) kalıcı hale getirmek.
- **Profesyonel Arayüz Standartları**: Modern UI prensipleriyle (Dark Mode, uyumlu renk paletleri, görsel grafikler) kurumsal fintech kalitesinde bir deneyim sağlamak.

---

## 🛠️ Ana Modüller

1. **Dashboard (Genel Bakış)**: Finansal sağlık skoru, toplam varlık, aylık gelir-gider ve net nakit akışı göstergeleri. Grafiklerle desteklenen kategori bazlı harcama dağılımı ve bekleyen işlemler/risk sinyalleri özeti.
2. **Accounts (Hesaplar)**: Farklı bankalardaki vadesiz ve vadeli mevduat hesaplarının bakiyeleri, hesap detayları ve yeni hesap ekleme imkanı.
3. **Transactions (İşlemler)**: Tüm hesap hareketlerinin listelendiği, tarih, kategori ve hesap bazlı filtreleme sunan, dinamik işlem ekleme/silme fonksiyonlarına sahip modül.
4. **Budget (Bütçe Planı)**: Kategori bazlı bütçe limiti belirleme, harcama oranlarının takibi, limit aşım uyarıları ve geçmiş harcamalara dayalı 3 aylık bütçe tahminleme motoru.
5. **Risk İzleme (RegTech)**: Şüpheli işlem hareketlerini, bütçe aşım uyarılarını ve yüksek tutarlı transferleri kural tabanlı analiz eden, risk seviyelerine göre aksiyon öneren denetim merkezi.
6. **Ödeme Talimatları (Payments)**: AISP/PISP standartlarında ödeme başlatma simülasyonu, bekleyen ve tamamlanan talimatların durum yönetimi, dinamik talimat iptali ve detay inceleme.
7. **Yatırım Profili (Investment Profile)**: Kullanıcının risk algısını belirleyen 5 adımlı yatırım anketi, kişiye özel oluşturulan varlık dağılım grafiği (fon, altın, hisse senedi vb.) ve analiz geçmişi takibi.

---

## 💻 Kullanılan Teknolojiler
- **Core Framework**: Next.js 16.2 (App Router) & React 19.2
- **Diller**: TypeScript & HTML5 / CSS3
- **Stil Yönetimi**: Tailwind CSS v4 (Modern HSL renk paleti ve özel animasyonlar)
- **Veri Görselleştirme**: Recharts (Duyarlı ve etkileşimli grafikler)
- **Form / Veri Doğrulama**: Zod
- **İkon Seti**: Lucide React
- **Veri Yönetimi**: Tarayıcı tabanlı `localStorage` Snapshot mimarisi

---

## ⚙️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri önerilir)
- npm veya yarn paket yöneticisi

### Kurulum
Proje dizininde bağımlılıkları yüklemek için:
```bash
npm install
```

### Çalıştırma (Geliştirme Modu)
Yerel geliştirme sunucusunu başlatmak için:
```bash
npm run dev
```
Uygulamaya tarayıcınızdan `http://localhost:3000` adresinden erişebilirsiniz.

### Derleme (Production Build)
Projeyi üretime hazır hale getirmek ve statik sayfaları optimize etmek için:
```bash
npm run build
```
Derlenmiş uygulamayı yerelde çalıştırmak için:
```bash
npm start
```

---

## 🗺️ Sayfa ve Modül Haritası
- `/` - Landing Page (FinWise Tanıtım & Giriş Sayfası)
- `/dashboard` - Finansal Özet ve Operasyon Kontrol Paneli
- `/accounts` - Banka Hesapları Yönetimi
- `/transactions` - İşlem Geçmişi ve Kayıt Ekleme/Silme
- `/budget` - Bütçe Limitleri ve Harcama Tahminleme
- `/regtech` - Risk Sinyalleri ve RegTech İzleme Modülü
- `/payments` - Ödeme Talimatı Başlatma ve Durum Takibi
- `/robo-advisor` - Risk Anketi ve Yatırım Profili Analizi

---

## 🔄 Veri Yönetimi ve Kalıcılık
FinWise V2, backend bağlantısı gerektirmeksizin kullanıcı girdilerini tarayıcıda saklar:
- **Snapshot Yapısı**: İlk açılışta `src/data/mockData.ts` içerisindeki varsayılan veriler `localStorage` üzerine yüklenir.
- **Dinamik Güncelleme**: Eklenen hesaplar, silinen işlemler, düzenlenen bütçe limitleri, yeni ödeme talimatları ve yatırım profili anket sonuçları anında `localStorage` üzerinde güncellenir ve tüm sayfalar bu ortak state'ten beslenir.
- **Sıfırlama (Reset Data)**: AppShell altındaki "Başlangıç Verilerine Dön" butonu ile kullanıcı dilediği zaman tarayıcı belleğindeki verileri sıfırlayıp fabrika ayarlarına dönebilir.

---

## 🏗️ Teknik Mimari
```
┌────────────────────────────────────────────────────────┐
│                      Sunum Katmanı                     │
│      Next.js App Router Sayfaları (Dashboard vb.)     │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Bileşen Katmanı                    │
│    AppShell, Metrik Kartları, Recharts Grafikleri      │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                   İş Kuralları Katmanı                  │
│       src/lib (Tahminleme, Risk Kural Motoru)          │
└───────────────────────────┬────────────────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Veri Katmanı                       │
│     localStorage (Snapshot) <-> src/data/mockData.ts   │
└────────────────────────────────────────────────────────┘
```

---

## 📈 Final Demo Akışı
1. **Landing Page**: FinWise V2 tanıtım kartları ve özellik sunumunun incelenmesi.
2. **Dashboard**: Finansal durum, net nakit akışı ve kategori grafiklerinin gözlemlenmesi.
3. **Hesap Ekleme**: "Hesaplar" sayfasında yeni bir banka hesabı tanımlanması ve dashboard'a anlık yansıması.
4. **İşlem Ekleme / Silme**: Harcama veya gelir girişi yapılması, bakiyelerin otomatik güncellenmesi.
5. **Bütçe Yönetimi**: Bütçe limitlerinin güncellenmesi, limit aşım durumlarının izlenmesi.
6. **Risk Analizi**: Risk İzleme ekranında üretilen kritik sinyallerin ve çözüm önerilerinin incelenmesi.
7. **Ödeme Talimatı**: Yeni bir ödeme emri başlatılması, onay/iptal süreçlerinin yürütülmesi.
8. **Yatırım Profili**: Risk analizi anketinin çözülerek kişiselleştirilmiş portföy dağılımının ve geçmiş sonuçların incelenmesi.
9. **Sıfırlama**: Tüm işlemler bittikten sonra başlangıç verilerine dönülerek sistemin ilk haline getirilmesi.

---

## 🪵 GitHub Branch Yapısı
- `main` veya `master`: Kararlı ana sürüm (production).
- `develop`: Geliştirme çalışmalarının birleştiği entegrasyon dalı.
- `sprint-X-y-z`: Sprint bazlı özellik geliştirme ve revizyon dalları.
- `sprint-9-final-delivery-v2`: Final teslim paketinin hazırlandığı geçerli branch.

---

## ⚠️ Akademik Bağlam ve Sınırlar (Teknik Dürüstlük)
* **Banka API Entegrasyonu**: Uygulamada gerçek bankaların açık bankacılık servisleriyle (API) entegrasyon bulunmamaktadır; tüm banka verileri arayüz akışlarını simüle etmek amacıyla üretilmiştir.
* **Ödeme İşlemleri**: Ödeme modülü gerçek bir para transferi gerçekleştirmez, AISP/PISP altyapısındaki "Ödeme Başlatma ve Talimat Yönetimi" mantığını tasarımsal olarak gösterir.
* **Yatırım Profili**: Modüldeki risk anket soruları ve portföy dağılım önerileri finansal/yatırım danışmanlığı kapsamında olmayıp, akademik proje sınırları dahilinde tasarlanmış örnek senaryolardır.
