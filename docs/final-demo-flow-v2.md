# FinWise V2 - Canlı Gösterim (Demo) Akışı

Bu döküman, jüriye yapılacak canlı uygulama gösteriminin (demo) adım adım takibini ve her adımda söylenecek konuşma metinlerini içerir.

---

### Adım 1: Landing Page (Açılış Sayfası)
* **Yapılacak İşlem**: Uygulamanın root URL (`/`) adresini açın. Başlığı ve altındaki modül tanıtım kartlarını gösterin.
* **Konuşma Metni**: "FinWise platformuna giriş yaptığımızda bizi karşılayan bu modern landing sayfasında platformun ana modüllerini ve sunduğumuz değer tekliflerini jüriye özetliyoruz. 'Sisteme Giriş Yap' butonu ile doğrudan ana kontrol panelimize geçiyoruz."

---

### Adım 2: Genel Bakış (Dashboard)
* **Yapılacak İşlem**: "Sisteme Giriş Yap" butonuna tıklayıp `/dashboard` sayfasına gidin.
* **Konuşma Metni**: "Kontrol panelimizde finansal sağlık skorumuzu, toplam varlıklarımızı ve nakit akışı trendlerimizi tek ekrandan izleyebiliyoruz. Sayfanın alt kısmındaki operasyonel özet bölümünde bekleyen ödeme talimatları ve yüksek riskli işlemler gibi anlık aksiyon gerektiren durumları topluca görüyoruz."

---

### Adım 3: Hesap Ekleme
* **Yapılacak İşlem**: Yan menüden "Hesaplar" (`/accounts`) sayfasına gidin. "Yeni Hesap Ekle" butonuna tıklayın, formu doldurun (Örn: İş Bankası, Vadesiz, TL, 25.000 TL) ve ekleyin.
* **Konuşma Metni**: "Hesaplar sayfamız, kullanıcının açık bankacılık kapsamında konsolide ettiği tüm hesaplarını listeler. Buradan sisteme dinamik olarak yeni bir İş Bankası hesabı eklediğimizde, toplam varlık miktarımızın anında güncellendiğini görüyoruz."

---

### Adım 4: İşlem Ekleme
* **Yapılacak İşlem**: Yan menüden "İşlemler" (`/transactions`) sayfasına gidin. "Yeni İşlem Ekle" butonuna basın. Az önce eklediğiniz hesabı seçerek bir harcama girişi yapın (Örn: Gıda kategorisinde 1.500 TL).
* **Konuşma Metni**: "İşlemler modülünde gelir ve gider kayıtlarını dinamik olarak ekleyebiliyoruz. Gıda kategorisinde yaptığımız bu 1.500 TL'lik harcama girişiyle birlikte, ilgili banka hesabımızın bakiyesi anında düşürülüyor."

---

### Adım 5: İşlem Silme
* **Yapılacak İşlem**: İşlem listesinde bulunan herhangi bir işlemin yanındaki "Sil" butonuna basın.
* **Konuşma Metni**: "Hatalı bir giriş yapılması durumunda, işlem listesindeki silme butonunu kullanabiliyoruz. Bir işlemi sildiğimizde, banka hesabı bakiyemiz eski durumuna otomatik olarak geri döner ve veri tutarlılığı korunur."

---

### Adım 6: Bütçe Limiti Düzenleme
* **Yapılacak İşlem**: Yan menüden "Bütçe Planı" (`/budget`) sayfasına gidin. Herhangi bir kategorinin (Örn: Eğlence) yanındaki "Limiti Düzenle" butonuna basın ve limiti düşürün (Örn: 2.000 TL'ye).
* **Konuşma Metni**: "Bütçe Planı sayfasında, harcamalarımızı kontrol etmek için limitler tanımlıyoruz. Eğlence limitini düşürdüğümüzde, harcama barımızın doluluk oranının değiştiğini ve eğer aşım gerçekleştiyse sistemin kırmızı uyarı durumuna geçtiğini görüyoruz."

---

### Adım 7: Risk İzleme Uyarıları
* **Yapılacak İşlem**: Yan menüden "Risk İzleme" (`/regtech`) sayfasına gidin. Listelenen risk sinyallerini ve bunların detay aksiyonlarını inceleyin.
* **Konuşma Metni**: "Risk İzleme modülü, RegTech ilkelerine uygun olarak kural tabanlı bir denetim yapar. Belirlenen bütçe aşımları ve yüksek tutarlı işlemler gibi risk sinyalleri, sistem tarafından otomatik yakalanarak etki analizleri ve çözüm önerileriyle birlikte sunulur."

---

### Adım 8: Ödeme Talimatı Oluşturma
* **Yapılacak İşlem**: Yan menüden "Ödeme Talimatları" (`/payments`) sayfasına gidin. Yeni ödeme emri formunu doldurun (Alıcı: Ahmet Yılmaz, IBAN girin, Gönderen Hesap seçin, Tutar: 4.500 TL).
* **Konuşma Metni**: "Ödeme Talimatları ekranında PISP yapısını simüle ediyoruz. Gerekli alıcı bilgilerini ve tutarı girerek yeni bir ödeme talimatı oluşturduğumuzda, bu emir 'Bekleyen Talimatlar' listesine ekleniyor ve henüz bakiyemizden düşülmüyor."

---

### Adım 9: Talimat Durumu Değiştirme
* **Yapılacak İşlem**: Eklediğiniz talimatın yanındaki "Onayla" veya "İptal Et" butonuna tıklayarak durumunu güncelleyin.
* **Konuşma Metni**: "Bekleyen talimatı onayladığımızda veya iptal ettiğimizde durum anında güncellenir. Eğer onaylarsak transfer tutarı ilgili hesaptan düşülür, iptal edersek işlem gerçekleşmeden arşive kaldırılır."

---

### Adım 10: Yatırım Profili Anketi
* **Yapılacak İşlem**: Yan menüden "Yatırım Profili" (`/robo-advisor`) sayfasına gidin. "Anketi Başlat" veya "Yeniden Çöz" butonuna basarak 5 soruluk anketi hızlıca çözün (Agresif tercihler yapın).
* **Konuşma Metni**: "Robo-danışmanlık modülümüzde, kullanıcının risk profilini belirlemek için bir anket sunuyoruz. Anketi çözdüğümüzde, kullanıcının risk puanına göre varlık dağılımı halka grafik ile dinamik olarak oluşturulur."

---

### Adım 11: Profil Geçmişi
* **Yapılacak İşlem**: Yatırım Profili sayfasındaki "Analiz Geçmişi" bölümünü gösterin.
* **Konuşma Metni**: "Sistem, kullanıcının anket geçmişini saklar. Böylece yatırımcının risk algısının zaman içindeki değişimini tarih bazlı olarak takip edebiliyoruz."

---

### Adım 12: Başlangıç Verilerine Dönme
* **Yapılacak İşlem**: AppShell'in (sol menü veya üst bar) altındaki "Verileri Sıfırla" veya "Başlangıç Verilerine Dön" butonuna tıklayın ve onaylayın.
* **Konuşma Metni**: "Demomuzun sonunda, sistemin ilk durumuna dönmek için 'Verileri Sıfırla' özelliğini kullanıyoruz. Bu işlem localStorage üzerindeki tüm değişiklikleri temizler ve varsayılan mock verileri yeniden yükler."

---

### Adım 13: Final Değerlendirme
* **Yapılacak İşlem**: Yeniden Dashboard'u açarak verilerin başarıyla sıfırlandığını gösterin ve demoyu bitirin.
* **Konuşma Metni**: "Gördüğünüz gibi, sıfırlama işlemi sonrası tüm verilerimiz ilk haline geri döndü. FinWise V2, masaüstü finansal yönetim deneyimini tüm modülleriyle başarıyla sergilemiştir. Dinlediğiniz için teşekkür ederim."
