# FinWise V2 - Final Sunum Planı

Bu döküman, FinWise V2 projesinin akademik jüriye / ders sorumlusuna sunulması için hazırlanan 14 slaytlık sunum taslağını ve konuşma notlarını içermektedir.

---

### Slayt 1: Kapak
* **Slayt Başlığı**: FinWise V2: Kişisel Finans ve Operasyon Yönetim Paneli
* **Slayt İçeriği**:
  * Finansal Teknolojiler (Fintech) Dersi Final Projesi
  * Proje Ekibi: [Öğrenci Adı Soyadı] - [Numara]
  * Dönem: 2025-2026
* **Konuşma Notu**: "Sayın hocam ve değerli jüri üyeleri, bugün sizlere Fintech dersi kapsamında geliştirdiğimiz FinWise V2 projesini sunacağım. FinWise V2, açık bankacılık ve kişisel finans yönetimi standartlarını tek bir masaüstü kontrol panelinde birleştiren bir fintech prototipidir."

---

### Slayt 2: Problem Tanımı
* **Slayt Başlığı**: Kişisel Finans Yönetimindeki Zorluklar
* **Slayt İçeriği**:
  * **Veri Dağınıklığı**: Birden fazla banka ve finans kuruluşunda bulunan hesapların ayrı ayrı takip edilmesi.
  * **Nakit Akışı Analiz Eksikliği**: Gelir ve giderlerin tek merkezden izlenememesi nedeniyle bütçe kontrolünün kaybolması.
  * **Güvenlik ve Risk Takibi**: Şüpheli para hareketlerinin veya limit aşımlarının zamanında fark edilememesi.
* **Konuşma Notu**: "Finansal dünyada kullanıcıların en büyük problemlerinden biri varlık ve harcama verilerinin dağınık olmasıdır. Bu durum, sağlıklı bir nakit akışı analizini engellemekte ve bütçe aşımı ile güvenlik risklerini artırmaktadır."

---

### Slayt 3: FinWise Çözüm Fikri
* **Slayt Başlığı**: Bütünleşik Finansal Kontrol Paneli
* **Slayt İçeriği**:
  * **Hesap Konsolidasyonu**: Tüm banka hesaplarının tek bir ekranda birleştirilmesi.
  * **Akıllı Bütçeleme & Tahminleme**: Harcama limitleri belirleme ve yapay zeka/analitik tabanlı bütçe tahminlemesi.
  * **RegTech & Risk Yönetimi**: Kural motoru ile işlem güvenliği analizi.
  * **Robo-Danışmanlık**: Kullanıcı risk analizine göre otomatik portföy önerileri.
* **Konuşma Notu**: "FinWise V2, bu sorunlara bütüncül bir fintech çözümü getiriyor. Kullanıcılara yalnızca hesaplarını tek ekranda toplama imkanı (AISP) sunmakla kalmıyor, aynı zamanda akıllı bütçeleme, RegTech risk denetimi ve yapay zeka destekli yatırım profili analizleri sunuyor."

---

### Slayt 4: Ders Konularıyla Bağlantı
* **Slayt Başlığı**: Fintech Teorisi ve FinWise V2 Entegrasyonu
* **Slayt İçeriği**:
  * **Açık Bankacılık**: AISP (Hesap Bilgileri) ve PISP (Ödeme Başlatma) entegrasyon mantığı.
  * **PFM (Kişisel Finans)**: Bütçe limitleri, harcama grafikleri ve veri görselleştirme.
  * **RegTech (Uyum Teknolojileri)**: Kara para aklama (AML) ve dolandırıcılık tespiti için kural tabanlı risk motoru.
  * **Robo-Advisor (WealthTech)**: Yatırımcı risk profili sınıflandırması ve portföy tahsisi.
* **Konuşma Notu**: "Projemiz, dönem boyunca ders kapsamında işlediğimiz açık bankacılık, RegTech, PFM ve WealthTech teorilerinin birebir pratik uygulamasıdır. Her teori, sistem üzerinde çalışan ayrı birer modüle dönüştürülmüştür."

---

### Slayt 5: Sistem Mimarisi
* **Slayt Başlığı**: Teknolojik Altyapı ve Mimari Tasarım
* **Slayt İçeriği**:
  * **Frontend**: Next.js 16.2 (App Router), React 19.2, TypeScript.
  * **Stil & Arayüz**: Tailwind CSS v4 (Karanlık tema öncelikli, profesyonel fintech renk paleti).
  * **Grafikler**: Recharts (Dinamik ve etkileşimli veri görselleştirme).
  * **Veri Depolama**: Tarayıcı tabanlı `localStorage` Snapshot yapısı (Sunucusuz çalışma kabiliyeti).
* **Konuşma Notu**: "Teknik altyapıda en güncel teknolojileri tercih ettik. Next.js 16 App Router mimarisi üzerinde, Tailwind CSS v4'ün modern renk paletlerini kullandık. Sunucu bağımsız çalışabilirlik ve verilerin sıfırlanabilmesi için yerel localStorage veri snapshot yapısını kurguladık."

---

### Slayt 6: Genel Bakış Ekranı
* **Slayt Başlığı**: Dashboard ve Finansal Sağlık Skoru
* **Slayt İçeriği**:
  * **Finansal Sağlık Skoru**: Bütçe ve risk durumuna göre dinamik puanlama.
  * **Gelir-Gider & Net Akış**: Temel finansal durum metrikleri.
  * **Operasyon Özeti Kartı**: Bekleyen talimatlar, kritik riskler ve yatırım profilinin tek ekranda birleşimi.
  * **Kategori Dağılımı & Çizgi Grafikler**: İnteraktif Recharts entegrasyonu.
* **Konuşma Notu**: "Ana sayfamız olan Dashboard, kullanıcının finansal durumunu tek bakışta özetler. Dinamik olarak hesaplanan Finansal Sağlık Skoru ve operasyonel özet kartı, kullanıcının o anki en kritik finansal aksiyonlarını önüne getirir."

---

### Slayt 7: Hesaplar ve İşlemler
* **Slayt Başlığı**: AISP Deneyimi: Hesaplar ve İşlemler Modülleri
* **Slayt İçeriği**:
  * **Hesap Yönetimi**: Banka bazında hesapların listelenmesi ve dinamik yeni hesap ekleme.
  * **İşlem Geçmişi**: Gelir-gider girişleri, çoklu filtreleme (tarih, kategori, hesap).
  * **Otomatik Senkronizasyon**: Ekleme ve silme işlemlerinin tüm bakiyelere anlık yansıması.
* **Konuşma Notu**: "Hesaplar ve İşlemler modülleri, açık bankacılıkta veri konsolidasyonunu simüle eder. Eklenen veya silinen işlemler, ilgili banka hesabının bakiyesini ve genel toplamları gerçek zamanlı olarak günceller."

---

### Slayt 8: Bütçe Planı ve Tahminleme
* **Slayt Başlığı**: Bütçe Planı ve Gelecek Dönem Tahminleme
* **Slayt İçeriği**:
  * **Limit Yönetimi**: Kategori bazlı harcama limitleri tanımlama ve aşım uyarıları.
  * **Tahminleme Algoritması**: Son 3 aylık harcama ortalaması + kategori katsayılı gelecek dönem projeksiyonu.
  * **Akıllı Bildirim**: Gelecek ay limit aşımı öngörülen kategorilerde kullanıcıyı uyarma.
* **Konuşma Notu**: "Bütçe modülü, harcamaların sınırlandırılmasını sağlar. Burada geliştirdiğimiz tahminleme motoru, kullanıcının geçmiş harcama alışkanlıklarını analiz ederek bir sonraki aya dair öngörüde bulunur ve potansiyel limit aşımlarını önceden bildirir."

---

### Slayt 9: Risk İzleme
* **Slayt Başlığı**: RegTech Uyum Kontrolü ve Risk İzleme Modülü
* **Slayt İçeriği**:
  * **Kural Motoru**: Şüpheli işlem ve olağandışı transfer tespiti.
  * **Sinyal Detayları**: Risk seviyesi (Düşük/Orta/Yüksek), etki analizi ve önerilen aksiyonlar.
  * **Risk İstatistikleri**: Toplam aktif uyarı ve çözüme kavuşturulma oranları.
* **Konuşma Notu**: "RegTech modülümüz, finansal uyumluluğu ve işlem güvenliğini simüle eder. Belirlediğimiz kurallar çerçevesinde üretilen risk sinyalleri, kullanıcıya veya uyum denetçisine detaylı etki analizi ve net aksiyon önerileri sunar."

---

### Slayt 10: Ödeme Talimatları
* **Slayt Başlığı**: PISP Rolü: Ödeme Başlatma ve Durum Takibi
* **Slayt İçeriği**:
  * **Kolay Talimat Girişi**: Banka hesabı seçimi, alıcı IBAN ve tutar doğrulamaları (Zod).
  * **Durum Yönetimi**: Bekleyen, onaylanan ve iptal edilen talimatların listelenmesi.
  * **İşlem Aksiyonları**: Bekleyen bir talimatı tek tıkla onaylama veya iptal etme.
* **Konuşma Notu**: "Ödeme modülü, PISP altyapısını canlandırır. Kullanıcı bir ödeme emri başlattığında, bu emir hemen işleme alınmaz; 'bekliyor' durumunda listelenir. Kullanıcı bu ekran üzerinden talimatları onaylayabilir veya iptal edebilir."

---

### Slayt 11: Yatırım Profili
* **Slayt Başlığı**: Robo-Danışmanlık ve Yatırım Profili Modülü
* **Slayt İçeriği**:
  * **Yatırımcı Anketi**: Yaş, gelir ve risk algısını ölçen 5 adımlı interaktif anket süreci.
  * **Varlık Dağılım Grafiği**: Profil tipine göre (Muhafazakar, Dengeli, Agresif) dinamik donat grafik önerisi.
  * **Analiz Geçmişi**: Kullanıcının zaman içindeki risk profil değişimlerinin kaydedilmesi.
* **Konuşma Notu**: "Yatırım modülü, bireysel yatırımcılara portföy önerisi sunan bir robo-danışman gibi çalışır. Anket sonucuna göre üretilen varlık dağılım grafiği ve analiz geçmişi, kullanıcının yatırım kararlarını destekler."

---

### Slayt 12: Veri Yönetimi ve LocalStorage
* **Slayt Başlığı**: Yerel Veri Yönetimi ve Bağımsızlık
* **Slayt İçeriği**:
  * **Veri Depolama**: `localStorage` üzerinde JSON formatında tutulan veriler.
  * **Dinamik State**: React state'leri ile localStorage senkronizasyonu.
  * **Reset (Fabrika Ayarları)**: Verileri silerek başlangıç durumuna dönebilme.
  * **Güvenlik Sınırı**: Verilerin sadece kullanıcının kendi tarayıcısında barındırılması.
* **Konuşma Notu**: "Platformumuz tamamen sunucusuz çalışmaktadır. Tüm kullanıcı verileri ve işlemler localStorage üzerinde tutulduğu için internet bağlantısı kopsa dahi sistem stabil çalışır. Ayrıca tek tuşla başlangıç verilerine dönülerek demo kolaylığı sağlanmıştır."

---

### Slayt 13: Testler ve Demo Akışı
* **Slayt Başlığı**: Doğrulama ve Canlı Demo Akışı
* **Slayt İçeriği**:
  * **Test Senaryoları**: 10 modül başlığında, 30+ adımda kurgulanmış manuel entegrasyon testleri.
  * **Demo Sırası**: Giriş ekranı -> Hesap ekleme -> İşlem girişi -> Bütçe aşımı -> Risk uyarısı -> Ödeme onaylama -> Yatırım anketi çözümü.
  * **Build Sonucu**: Sıfır hata ve sıfır Recharts warning ile başarılı build çıktıları.
* **Konuşma Notu**: "Geliştirdiğimiz sistemi, her modülün sınırlarını test eden kapsamlı senaryolarla doğruladık. Birazdan gerçekleştireceğim canlı demoda, sisteme hesap ekleme, işlem silme, bütçe tahminleme, ödeme talimatı ve yatırım anketini sırasıyla uygulayarak kararlılığı göstereceğim."

---

### Slayt 14: Karar Destek Yeteneği (Fark Yaratan Özellikler)
* **Slayt Başlığı**: FinWise Karar Destek Gücü ve Fark Yaratan Özellikler
* **Slayt İçeriği**:
  * **Finansal Aksiyon Merkezi**: Bütçe, risk ve ödeme verilerinden otomatik eyleme geçirilebilir aksiyonlar üretme.
  * **Açıklanabilir Sağlık Skoru**: 5 boyutta dinamik puanlama ve iyileştirme önerileri.
  * **Akıllı Bütçe İçgörüleri**: Limit doluluk oranlarına göre değişen karar destek yönlendirmeleri.
  * **Ödeme Güven Skoru**: Kaynak hesap bakiyesi ve IBAN doğruluğunu denetleyen risk analizi.
  * **Sunum Modu**: Jüri sunumu için 8 adımlı interaktif demo rehberi.
* **Konuşma Notu**: "FinWise'ı sıradan bir bütçe izleme panelinden ayıran en önemli yönü, kullanıcılara sunduğu bu Karar Destek mekanizmalarıdır. Sistem sadece veri göstermekle kalmaz; Güven Skoru, Aksiyon Önerileri ve Bütçe İçgörüleri ile kullanıcıya rehberlik eder."

---

### Slayt 15: Sonuç ve Gelecek Geliştirmeler
* **Slayt Başlığı**: Sonuç ve Gelecek Vizyonu
* **Slayt İçeriği**:
  * **Kazanımlar**: Fintech dersi teorik kazanımlarının profesyonel UI ve çalışan kod ile pratikleştirilmesi.
  * **Gelecek Çalışmalar**:
    * Gerçek API entegrasyonları (TCMB / BKM standartları).
    * Backend veritabanı ve güvenli kullanıcı girişi.
    * Gelişmiş makine öğrenmesi modelleriyle anomali tespiti.
* **Konuşma Notu**: "Sonuç olarak FinWise V2, akademik beklentileri aşan, modern fintech standartlarında bir prototip olmuştur. Gelecekte gerçek banka API entegrasyonları ve veritabanı desteği ile ticari bir ürüne dönüştürülmeye hazırdır. Dinlediğiniz için teşekkür ederim, sorularınızı yanıtlamaktan memnuniyet duyarım."
