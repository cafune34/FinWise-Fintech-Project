# FinWise Proje Yol Haritası — Finansal Teknolojiler Dersi

> Proje adı: **FinWise: Açık Bankacılık Tabanlı Akıllı Kişisel Finans ve Bütçe Yönetim Sistemi**  
> Proje türü: Eğitim amaçlı fintech demo uygulaması  
> Ana hedef: Açık bankacılık mantığını, kişisel finans yönetimini, ödeme simülasyonunu, RegTech kontrollerini ve mini robo-danışmanlığı tek bir basit web uygulamasında göstermek.  
> Kritik not: Bu proje **gerçek banka bağlantısı, gerçek ödeme, gerçek yatırım tavsiyesi ve gerçek müşteri verisi kullanmaz**. Tüm veriler mock/simülasyon verisidir.

---

## 1. Proje Mantığı

FinWise, kullanıcının farklı bankalardaki hesaplarını tek panelde görüyormuş gibi simüle eden, harcamaları kategorilere ayıran, bütçe aşımı uyarısı veren, gelecek ay harcama tahmini yapan, fatura/para transferi emri simülasyonu oluşturan ve risk profiline göre basit portföy önerisi sunan bir fintech demo uygulamasıdır.

Bu proje şu ders başlıklarına bağlanacaktır:

- Açık bankacılık
- AISP / Hesap Bilgisi Hizmeti
- PISP / Ödeme Emri Başlatma Hizmeti
- Kişisel finans yönetimi
- Yapay zeka ve makine öğrenmesi destekli bütçeleme
- RegTech / uyum / işlem takibi
- Ödeme sistemleri
- Dijital cüzdan ve ödeme emri simülasyonu
- Robo-danışmanlık
- Veri analizi ve finansal tahminleme

---

## 2. Proje Kapsamı

### Yapılacaklar

- Mock kullanıcı girişi
- Mock rıza/onay ekranı
- Dashboard
- Çoklu banka hesapları
- Mock banka işlem hareketleri
- Gelir-gider toplamları
- Harcama kategorileri
- Aylık bütçe takibi
- Bütçe aşımı uyarıları
- Gelecek ay harcama tahmini
- RegTech şüpheli işlem uyarıları
- Ödeme emri / fatura ödeme simülasyonu
- Mini robo-danışmanlık anketi
- Risk profiline göre portföy önerisi
- Ekran görüntüleri
- Proje raporu
- Sunum

### Yapılmayacaklar

- Gerçek banka API bağlantısı
- Gerçek ödeme alma/gönderme
- Gerçek kredi kartı saklama
- Gerçek yatırım tavsiyesi
- Gerçek kullanıcı finansal verisi
- Canlı TCMB/BKM entegrasyonu
- Lisans gerektiren ödeme hizmeti

---

## 3. Önerilen Teknoloji Stack

### Ana Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- better-sqlite3 veya başlangıç için JSON seed data
- Zod
- ESLint
- GitHub

### Basit ve Güvenli Yaklaşım

Başlangıçta verileri `src/data/mockData.ts` içinde tutmak daha hızlıdır. Proje yetişirse Sprint 3 veya Sprint 4'te SQLite'a geçilebilir.

Önerilen yol:

1. Önce mock data ile hızlı çalışan demo çıkar.
2. Sonra ihtiyaç olursa SQLite ekle.
3. Final teslimde çalışan uygulama ve rapor daha önemlidir.

---

## 4. GitHub Repo Planı

### Repo Adı

Önerilen repo adı:

```txt
finwise-fintech-project
```

Alternatif:

```txt
finwise-open-banking-demo
```

### GitHub Açma Adımları

1. GitHub'a gir.
2. Sağ üstten `New repository` tıkla.
3. Repository name: `finwise-fintech-project`
4. Description:
   ```txt
   FinWise - Open banking based personal finance and budgeting system demo for Financial Technologies course.
   ```
5. Public veya Private seçilebilir.
   - Hocaya link gösterilecekse Public daha rahat.
   - Sadece teslim dosyası verilecekse Private da olur.
6. `Add README` işaretlenebilir.
7. `.gitignore`: Node seçilebilir.
8. License şart değil.

### Branch Stratejisi

```txt
main       -> Final ve stabil sürüm
develop    -> Aktif geliştirme ana dalı
sprint-0   -> Proje kurulum ve planlama
sprint-1   -> UI iskeleti ve mock veri
sprint-2   -> Dashboard ve kişisel finans modülleri
sprint-3   -> Tahminleme ve RegTech kontrolleri
sprint-4   -> Ödeme simülasyonu ve robo-danışmanlık
sprint-5   -> Rapor, sunum, final temizlik
```

### Commit Formatı

```txt
feat: dashboard cards eklendi
feat: mock banka hesapları eklendi
feat: harcama kategorileri grafiği eklendi
fix: toplam bakiye hesaplama hatası düzeltildi
docs: sprint planı güncellendi
docs: rapor taslağı eklendi
style: dashboard responsive düzenlendi
refactor: finance helper fonksiyonları ayrıldı
```

### Her Sprint Sonunda GitHub'a Yükleme

Her sprint sonunda:

```bash
git status
git add .
git commit -m "feat: sprint X tamamlandı"
git push origin sprint-X
```

Sonra GitHub üzerinden:

```txt
sprint-X -> develop Pull Request aç
```

Kontrol ettikten sonra merge et.

Finalde:

```txt
develop -> main Pull Request aç
```

---

## 5. Kurulum Komutları

### Yerel Proje Oluşturma

```bash
npx create-next-app@latest finwise-fintech-project
```

Sorulara önerilen cevaplar:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src directory: Yes
App Router: Yes
Turbopack: Yes
Import alias: Yes
Alias: @/*
```

### Projeye Girme

```bash
cd finwise-fintech-project
```

### Paket Kurulumu

```bash
npm install recharts lucide-react zod clsx tailwind-merge
```

SQLite kullanılacaksa:

```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### Çalıştırma

```bash
npm run dev
```

Tarayıcı:

```txt
http://localhost:3000
```

### Build Kontrolü

```bash
npm run lint
npm run build
```

---

## 6. Önerilen Klasör Yapısı

```txt
finwise-fintech-project/
├─ docs/
│  ├─ project-plan.md
│  ├─ report-draft.md
│  ├─ presentation-outline.md
│  ├─ screenshots/
│  └─ sprint-notes/
│     ├─ sprint-0.md
│     ├─ sprint-1.md
│     ├─ sprint-2.md
│     ├─ sprint-3.md
│     ├─ sprint-4.md
│     └─ sprint-5.md
├─ public/
│  └─ logo.svg
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ globals.css
│  │  ├─ dashboard/
│  │  │  └─ page.tsx
│  │  ├─ accounts/
│  │  │  └─ page.tsx
│  │  ├─ transactions/
│  │  │  └─ page.tsx
│  │  ├─ budget/
│  │  │  └─ page.tsx
│  │  ├─ payments/
│  │  │  └─ page.tsx
│  │  ├─ regtech/
│  │  │  └─ page.tsx
│  │  └─ robo-advisor/
│  │     └─ page.tsx
│  ├─ components/
│  │  ├─ AppShell.tsx
│  │  ├─ StatCard.tsx
│  │  ├─ ChartCard.tsx
│  │  ├─ TransactionTable.tsx
│  │  ├─ BudgetProgress.tsx
│  │  ├─ RiskAlertCard.tsx
│  │  └─ RoboAllocationChart.tsx
│  ├─ data/
│  │  └─ mockData.ts
│  ├─ lib/
│  │  ├─ finance.ts
│  │  ├─ forecasting.ts
│  │  ├─ regtech.ts
│  │  ├─ roboAdvisor.ts
│  │  └─ format.ts
│  └─ types/
│     └─ finance.ts
├─ README.md
└─ package.json
```

---

## 7. Veri Modeli

### User

```ts
type User = {
  id: string
  name: string
  email: string
  monthlyIncome: number
}
```

### BankAccount

```ts
type BankAccount = {
  id: string
  bankName: string
  accountName: string
  ibanMasked: string
  balance: number
  currency: "TRY" | "USD" | "EUR"
}
```

### Transaction

```ts
type Transaction = {
  id: string
  accountId: string
  date: string
  merchant: string
  description: string
  amount: number
  type: "income" | "expense" | "transfer"
  category:
    | "market"
    | "ulasim"
    | "fatura"
    | "egitim"
    | "eglence"
    | "saglik"
    | "kira"
    | "maas"
    | "transfer"
    | "yatirim"
    | "diger"
}
```

### Budget

```ts
type Budget = {
  id: string
  category: Transaction["category"]
  monthlyLimit: number
}
```

### PaymentOrder

```ts
type PaymentOrder = {
  id: string
  fromAccountId: string
  receiverName: string
  amount: number
  description: string
  status: "draft" | "approved" | "simulated"
  createdAt: string
}
```

### RegTechAlert

```ts
type RegTechAlert = {
  id: string
  severity: "low" | "medium" | "high"
  title: string
  description: string
  relatedTransactionId?: string
}
```

---

## 8. Finansal Hesaplama Fonksiyonları

### Toplam Bakiye

```ts
totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)
```

### Aylık Gelir

```ts
monthlyIncome = transactions
  .filter(t => t.type === "income")
  .reduce((sum, t) => sum + t.amount, 0)
```

### Aylık Gider

```ts
monthlyExpense = transactions
  .filter(t => t.type === "expense")
  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
```

### Net Nakit Akışı

```ts
netCashFlow = monthlyIncome - monthlyExpense
```

### Kategori Giderleri

```ts
categoryExpense = expenseTransactions grouped by category
```

### Bütçe Aşımı

```ts
spentAmount > monthlyLimit
```

### Basit Gelecek Ay Tahmini

```ts
forecast = lastThreeMonthsAverage * seasonalFactor
```

Örnek:

```txt
Son 3 ay market gideri:
Ocak: 4200 TL
Şubat: 4800 TL
Mart: 5100 TL

Tahmin:
(4200 + 4800 + 5100) / 3 = 4700 TL
Mevsimsel katsayı 1.08 ise:
4700 * 1.08 = 5076 TL
```

---

## 9. RegTech Kural Seti

FinWise içindeki RegTech modülü gerçek AML sistemi değildir. Eğitim amaçlı basit kural motorudur.

### Kurallar

| Kural | Uyarı Seviyesi | Açıklama |
|---|---|---|
| Tek işlem 10.000 TL üzerindeyse | High | Yüksek tutarlı işlem |
| Aynı gün 5'ten fazla transfer varsa | Medium | Olağan dışı transfer yoğunluğu |
| Gece 00:00-05:00 arasında 5.000 TL üzeri işlem varsa | Medium | Riskli saat işlemi |
| Kategori bütçesi %100 aşılmışsa | Medium | Bütçe aşımı |
| Aylık gider gelirden fazlaysa | High | Negatif nakit akışı |
| Aynı alıcıya kısa sürede tekrar eden ödeme varsa | Low/Medium | Tekrarlı ödeme kontrolü |

### RegTech Sayfasında Gösterilecekler

- Toplam uyarı sayısı
- High / Medium / Low dağılımı
- Uyarı kartları
- İlgili işlem bağlantısı
- Eğitim notu:
  ```txt
  Bu modül gerçek finansal uyum sistemi değildir. RegTech yaklaşımını göstermek için kural tabanlı simülasyon yapılmıştır.
  ```

---

## 10. Mini Robo-Danışmanlık Mantığı

### Risk Anketi

Sorular:

1. Yatırım vadeniz nedir?
   - Kısa
   - Orta
   - Uzun

2. Risk tercihiniz nedir?
   - Düşük
   - Orta
   - Yüksek

3. Aylık gelirinizin ne kadarını birikime ayırabilirsiniz?
   - %5
   - %10
   - %20+

4. Piyasa düşerse ne yaparsınız?
   - Hemen satarım
   - Beklerim
   - Alım fırsatı görürüm

5. Acil nakit ihtiyacınız var mı?
   - Evet
   - Hayır

### Skor

```txt
0-6 puan: Düşük risk
7-12 puan: Orta risk
13+ puan: Yüksek risk
```

### Önerilen Portföyler

| Risk | Mevduat | Altın | Fon/Hisse | Kripto/Dijital Varlık |
|---|---:|---:|---:|---:|
| Düşük | %70 | %20 | %10 | %0 |
| Orta | %40 | %30 | %20 | %10 |
| Yüksek | %20 | %20 | %40 | %20 |

### Zorunlu Uyarı

```txt
Bu ekran eğitim amaçlı robo-danışmanlık simülasyonudur. Gerçek yatırım tavsiyesi değildir.
```

---

# 11. Scrum Planı

## Sprint 0 — Proje Hazırlık ve GitHub Kurulumu

### Amaç

Projenin temel planını, repo yapısını ve geliştirme kurallarını oluşturmak.

### Görevler

- GitHub repo aç.
- Local Next.js projesi oluştur.
- Tailwind ve temel paketleri kur.
- `docs/` klasörünü oluştur.
- Bu MD dosyasını `docs/project-plan.md` olarak ekle.
- README oluştur.
- Branch stratejisini başlat.
- İlk commit ve push işlemini yap.

### Codex Komutu

Codex'e verilecek komut:

```txt
Bu repoda Finansal Teknolojiler dersi için FinWise adında bir fintech demo projesi geliştireceğiz. 
Next.js App Router, TypeScript ve Tailwind kullanıyoruz. 
Önce proje klasör yapısını düzenle, docs klasörünü oluştur, README.md dosyasını proje tanımıyla güncelle ve src altında app, components, data, lib, types klasörlerini hazırla. 
Bu sprintte uygulama ekranlarını tam geliştirme; sadece sağlam proje iskeleti, temiz README ve plan dosyaları oluştur.
```

### Hakan'ın Yapması Gerekenler

- GitHub repo açmak.
- Projeyi localde oluşturmak.
- Codex'i repo klasöründe başlatmak.
- Codex değişikliklerinden sonra `npm run build` çalıştırmak.
- Git commit ve push yapmak.

### Kabul Kriterleri

- Repo GitHub'da var.
- Proje localde açılıyor.
- `npm run dev` çalışıyor.
- `docs/project-plan.md` mevcut.
- README açıklayıcı.
- İlk sprint branch'i GitHub'a pushlandı.

### Git Komutları

```bash
git checkout -b sprint-0
git add .
git commit -m "docs: sprint 0 proje planı ve iskelet eklendi"
git push origin sprint-0
```

---

## Sprint 1 — UI İskeleti, Mock Veri ve Navigasyon

### Amaç

Uygulamanın temel görsel iskeletini ve mock verisini oluşturmak.

### Görevler

- AppShell layout oluştur.
- Sidebar / üst menü oluştur.
- Dashboard route oluştur.
- Accounts route oluştur.
- Transactions route oluştur.
- Budget route oluştur.
- Payments route oluştur.
- RegTech route oluştur.
- Robo Advisor route oluştur.
- Mock kullanıcı, hesap ve işlem verilerini oluştur.
- Para formatlama helper fonksiyonu yaz.
- Tarih formatlama helper fonksiyonu yaz.

### Sayfalar

```txt
/
 /dashboard
 /accounts
 /transactions
 /budget
 /payments
 /regtech
 /robo-advisor
```

### Codex Komutu

```txt
Sprint 1 görevlerini uygula. 
Next.js App Router yapısında FinWise için modern, finansal teknoloji hissi veren, responsive bir AppShell oluştur. 
Sidebar veya üst navigasyon kullan. 
Dashboard, accounts, transactions, budget, payments, regtech ve robo-advisor route'larını oluştur. 
src/data/mockData.ts içinde mock kullanıcı, 3 banka hesabı, 50 işlem hareketi ve kategori bütçeleri oluştur. 
src/types/finance.ts içinde tipleri tanımla. 
src/lib/format.ts içinde TL para formatlama ve tarih formatlama fonksiyonları yaz. 
Bu sprintte karmaşık hesaplama yapma; sadece iskelet, mock data ve navigasyon çalışsın.
```

### Hakan'ın Yapması Gerekenler

- Codex'in oluşturduğu ekranları tarayıcıda tek tek aç.
- Menü linkleri çalışıyor mu kontrol et.
- Görsel tasarım çok bozuksa ekran görüntüsü al.
- Hata varsa bana gönder.
- Build al.

### Test Komutları

```bash
npm run dev
npm run lint
npm run build
```

### Kabul Kriterleri

- Tüm route'lar açılıyor.
- Menüden tüm sayfalara geçiliyor.
- Mock data TypeScript hatası vermiyor.
- Dashboard boş da olsa çalışıyor.
- Build başarılı.

### Git Komutları

```bash
git checkout develop
git pull
git checkout -b sprint-1
git add .
git commit -m "feat: sprint 1 ui iskeleti ve mock veri eklendi"
git push origin sprint-1
```

---

## Sprint 2 — Dashboard ve Kişisel Finans Yönetimi

### Amaç

Kullanıcının finansal durumunu tek ekranda görmesini sağlamak.

### Görevler

- Dashboard kartları:
  - Toplam bakiye
  - Aylık gelir
  - Aylık gider
  - Net nakit akışı
- Banka hesapları kartları
- Son işlemler tablosu
- Kategori bazlı harcama grafiği
- Aylık gelir-gider grafiği
- Budget sayfasında kategori limitleri
- Bütçe kullanım yüzdesi
- Aşım uyarıları
- Transactions sayfasında filtreleme:
  - Kategori
  - İşlem tipi
  - Banka hesabı

### Codex Komutu

```txt
Sprint 2 görevlerini uygula. 
Mock data üzerinden çalışan kişisel finans dashboard'u geliştir. 
Toplam bakiye, aylık gelir, aylık gider ve net nakit akışı kartları oluştur. 
Banka hesaplarını kartlar halinde göster. 
Son işlemler tablosunu oluştur. 
Recharts ile kategori bazlı harcama grafiği ve aylık gelir-gider grafiği ekle. 
Budget sayfasında her kategori için limit, harcanan tutar, kalan tutar ve kullanım yüzdesi göster. 
Bütçe aşımı varsa uyarı kartı çıkar. 
Transactions sayfasına kategori, işlem tipi ve hesap filtresi ekle. 
Tüm hesaplamaları src/lib/finance.ts içinde helper fonksiyonlar olarak yaz.
```

### Hakan'ın Yapması Gerekenler

- Dashboard'daki tutarlar mantıklı mı kontrol et.
- İşlem tablosunda giderler eksi, gelirler artı görünüyor mu bak.
- Grafikler düzgün görünüyor mu kontrol et.
- Mobil görünüm çok bozuluyor mu bak.
- Build al.
- Ekran görüntülerini `docs/screenshots/sprint-2/` içine koy.

### Kabul Kriterleri

- Dashboard finansal özet gösteriyor.
- Grafikler çalışıyor.
- Budget sayfası limitleri gösteriyor.
- Aşım uyarıları çıkıyor.
- Transactions filtreleri çalışıyor.
- Build başarılı.

### Git Komutları

```bash
git checkout develop
git pull
git checkout -b sprint-2
git add .
git commit -m "feat: sprint 2 dashboard ve bütçe modülü eklendi"
git push origin sprint-2
```

---

## Sprint 3 — Tahminleme, Akıllı Uyarılar ve RegTech

### Amaç

Uygulamaya fintech dersindeki yapay zeka, tahminleme ve RegTech mantığını eklemek.

### Görevler

- `src/lib/forecasting.ts` oluştur.
- Kategori bazlı gelecek ay harcama tahmini yap.
- Son 3 ay ortalama mantığı kur.
- Mevsimsel katsayı desteği ekle.
- Dashboard'a tahmin kartları ekle.
- Budget sayfasına "gelecek ay riskli kategoriler" alanı ekle.
- `src/lib/regtech.ts` oluştur.
- Şüpheli işlem kurallarını yaz.
- RegTech sayfasında uyarıları listele.
- Uyarı önem derecesi göster.
- Uyarı açıklamaları ekle.
- RegTech modülünün eğitim amaçlı olduğunu belirt.

### Codex Komutu

```txt
Sprint 3 görevlerini uygula. 
src/lib/forecasting.ts içinde son 3 ay ortalamasına dayalı kategori bazlı gelecek ay harcama tahmini fonksiyonları yaz. 
Tahminleri dashboard ve budget sayfasında göster. 
src/lib/regtech.ts içinde kural tabanlı RegTech uyarı motoru oluştur. 
Kurallar: tek işlem 10000 TL üzeri high, aylık gider gelirden fazlaysa high, bütçe aşımı medium, aynı gün 5'ten fazla transfer medium, gece yüksek tutarlı işlem medium. 
RegTech sayfasında toplam uyarı sayısı, high-medium-low dağılımı ve uyarı kartlarını göster. 
Her uyarıda neden üretildiğini açıkla. 
Gerçek AML/uyum sistemi değil, eğitim amaçlı simülasyon olduğunu ekranda belirt.
```

### Hakan'ın Yapması Gerekenler

- Mock veride 10.000 TL üzeri birkaç işlem olduğundan emin ol.
- RegTech uyarıları gerçekten oluşuyor mu kontrol et.
- Tahmin değerleri aşırı saçma mı bak.
- Gerekirse mock veriyi güncelle.
- Build al.
- Ekran görüntülerini kaydet.

### Kabul Kriterleri

- Tahminleme fonksiyonu çalışıyor.
- Budget sayfasında gelecek ay riskleri görünüyor.
- RegTech sayfasında uyarılar çıkıyor.
- Uyarı seviyeleri doğru.
- Build başarılı.

### Git Komutları

```bash
git checkout develop
git pull
git checkout -b sprint-3
git add .
git commit -m "feat: sprint 3 tahminleme ve regtech modülü eklendi"
git push origin sprint-3
```

---

## Sprint 4 — Ödeme Simülasyonu ve Mini Robo-Danışmanlık

### Amaç

PISP/ödeme emri simülasyonu ve robo-danışmanlık ekranını tamamlamak.

### Görevler

- Payments sayfası:
  - Ödeme emri formu
  - Kaynak hesap seçimi
  - Alıcı adı
  - Tutar
  - Açıklama
  - Simülasyon butonu
  - Sonuç ekranı
- Ödeme sonrası gerçek bakiye değiştirmek zorunda değiliz.
- İstenirse simüle edilmiş ödeme geçmişi gösterilebilir.
- Robo Advisor sayfası:
  - Risk anketi
  - Risk skoru
  - Risk profili
  - Portföy dağılım grafiği
  - Eğitim amaçlı yatırım tavsiyesi değildir notu
- `src/lib/roboAdvisor.ts` oluştur.

### Codex Komutu

```txt
Sprint 4 görevlerini uygula. 
Payments sayfasında PISP/Ödeme Emri Başlatma simülasyonu oluştur. 
Kullanıcı kaynak hesap seçsin, alıcı adı, tutar ve açıklama girsin. 
Form gönderilince "Ödeme emri simüle edildi" sonucu gösterilsin. Gerçek ödeme yapılmadığını açıkça belirt. 
Robo Advisor sayfasında 5 soruluk risk anketi oluştur. 
Cevaplara göre düşük, orta veya yüksek risk profili hesapla. 
Risk profiline göre mevduat, altın, fon/hisse ve kripto/dijital varlık yüzdelerini göster. 
Recharts ile portföy dağılım grafiği ekle. 
Ekranda "Bu modül eğitim amaçlıdır, yatırım tavsiyesi değildir" uyarısı mutlaka bulunsun.
```

### Hakan'ın Yapması Gerekenler

- Ödeme formunu birkaç farklı tutarla dene.
- Robo anketini düşük/orta/yüksek cevaplarla test et.
- Portföy grafiği doğru değişiyor mu bak.
- Hukuki/etik uyarı ekranda açıkça var mı kontrol et.
- Build al.
- Ekran görüntülerini kaydet.

### Kabul Kriterleri

- Ödeme simülasyonu çalışıyor.
- Gerçek ödeme yapılmadığı açık.
- Robo anketi çalışıyor.
- Risk profili doğru hesaplanıyor.
- Portföy grafiği çıkıyor.
- Yatırım tavsiyesi değildir uyarısı var.
- Build başarılı.

### Git Komutları

```bash
git checkout develop
git pull
git checkout -b sprint-4
git add .
git commit -m "feat: sprint 4 odeme simulasyonu ve robo danismanlik eklendi"
git push origin sprint-4
```

---

## Sprint 5 — Rapor, Sunum, Final Temizlik ve Teslim

### Amaç

Projeyi hocaya teslim edilebilir hale getirmek.

### Görevler

- README final hale getir.
- Proje raporu yaz.
- Sunum taslağı hazırla.
- Ekran görüntüleri al.
- Test senaryolarını yaz.
- Bilinen sınırlılıkları yaz.
- Gelecek geliştirmeleri yaz.
- Demo akışını belirle.
- Final build al.
- GitHub main branch'e merge et.

### Rapor Başlıkları

1. Kapak
2. Özet
3. Projenin amacı
4. Finansal teknolojiler ile ilişkisi
5. Açık bankacılık ve AISP/PISP bağlantısı
6. Kişisel finans yönetimi modülü
7. Yapay zeka / tahminleme yaklaşımı
8. RegTech ve güvenlik yaklaşımı
9. Ödeme emri simülasyonu
10. Robo-danışmanlık modülü
11. Sistem mimarisi
12. Kullanılan teknolojiler
13. Ekran görüntüleri
14. Test senaryoları
15. Sınırlılıklar
16. Gelecek geliştirmeler
17. Sonuç
18. Kaynakça

### Sunum Başlıkları

1. Proje adı ve ekip/öğrenci bilgisi
2. Problem tanımı
3. FinWise çözüm fikri
4. Açık bankacılık simülasyonu
5. Dashboard
6. Kişisel finans ve bütçe modülü
7. Yapay zeka destekli tahminleme
8. RegTech uyarıları
9. Ödeme emri simülasyonu
10. Robo-danışmanlık
11. Teknoloji mimarisi
12. Demo ekranları
13. Sınırlılıklar ve gelecek geliştirmeler
14. Sonuç

### Codex Komutu

```txt
Sprint 5 final hazırlıklarını yap. 
README.md dosyasını proje tanımı, kurulum, özellikler, ekranlar, kullanılan teknolojiler ve eğitim amaçlı sınırlılıklar ile güncelle. 
docs/report-draft.md içinde akademik rapor taslağı oluştur. 
docs/presentation-outline.md içinde 12-14 slaytlık sunum planı oluştur. 
docs/test-scenarios.md içinde dashboard, budget, regtech, payments ve robo-advisor modülleri için test senaryoları yaz. 
Kod tarafında kullanılmayan importları temizle, responsive hataları düzelt ve npm run build başarılı olacak hale getir.
```

### Hakan'ın Yapması Gerekenler

- Uygulamayı baştan sona canlı demo gibi gez.
- Her sayfanın ekran görüntüsünü al.
- Rapor içine ekran görüntülerini koymak için bana gönder.
- Sunum istenirse bana ayrıca söyle.
- Hocanın özel formatı varsa bana gönder.
- Final build al.
- GitHub main'e merge et.

### Kabul Kriterleri

- `npm run build` başarılı.
- README tamam.
- Rapor taslağı hazır.
- Sunum taslağı hazır.
- Test senaryoları hazır.
- Ekran görüntüleri alınmış.
- Main branch final durumda.

### Git Komutları

```bash
git checkout develop
git pull
git checkout -b sprint-5
git add .
git commit -m "docs: sprint 5 final rapor ve sunum taslaklari eklendi"
git push origin sprint-5
```

Final merge sonrası:

```bash
git checkout main
git pull
git merge develop
git push origin main
```

---

# 12. Demo Akışı

Hocaya gösterilecek demo sırası:

1. Ana sayfa / login simülasyonu
2. Rıza ekranı
3. Dashboard
4. Banka hesapları
5. İşlem hareketleri
6. Harcama kategorileri
7. Bütçe aşımı
8. Gelecek ay tahmini
9. RegTech uyarıları
10. Ödeme emri simülasyonu
11. Robo-danışmanlık anketi
12. Risk profili ve portföy önerisi
13. Sonuç ve sınırlılıklar

---

# 13. Projenin Güçlü Anlatım Cümlesi

Sunumda kullanılabilecek kısa açıklama:

```txt
FinWise, açık bankacılık yaklaşımını temel alan, kullanıcıların farklı banka hesaplarını tek panelde görüntüleyebildiği, harcamalarını analiz edebildiği, bütçe aşımı ve nakit akışı risklerini önceden görebildiği, ödeme emri başlatma ve robo-danışmanlık süreçlerini eğitim amaçlı simüle eden bir kişisel finans yönetim sistemidir.
```

---

# 14. Riskler ve Önlemler

| Risk | Ne Olabilir? | Önlem |
|---|---|---|
| Proje fazla büyür | Yetişmez | Önce mock data ile MVP çıkar |
| Gerçek banka API sanılır | Hoca yanlış anlayabilir | Her yerde simülasyon notu yaz |
| Robo-danışmanlık yatırım tavsiyesi sanılır | Hukuki/etik risk | "Yatırım tavsiyesi değildir" uyarısı koy |
| SQLite sorun çıkarır | Build bozulabilir | Başlangıçta JSON kullan |
| Grafiklerde hata çıkar | Demo bozulabilir | Recharts basit grafikler kullan |
| Codex çok karmaşık kod yazar | Bakımı zorlaşır | Her sprintte küçük görev ver |
| Build hatası | Teslim sıkıntı | Her sprint sonunda `npm run build` zorunlu |

---

# 15. MVP Öncelik Sırası

Zaman azsa bu sırayı takip et:

1. Dashboard
2. Mock banka hesapları
3. İşlem hareketleri
4. Harcama kategorileri
5. Bütçe uyarısı
6. RegTech uyarısı
7. Ödeme simülasyonu
8. Robo advisor
9. Rapor
10. Sunum

Zaman çok az kalırsa minimum teslim:

- Dashboard
- Mock hesaplar
- İşlem listesi
- Bütçe uyarısı
- RegTech uyarısı
- Rapor

---

# 16. Yapay Zeka / ML Gerçekçilik Notu

Bu projede kullanılacak tahminleme basit modeldir:

```txt
Son 3 ay ortalaması + kategori bazlı katsayı + bütçe karşılaştırması
```

Rapor içinde şu şekilde açıklanacak:

```txt
Bu projede kullanılan tahminleme modeli, eğitim amaçlı basit bir öngörücü analiz yaklaşımıdır. Gerçek hayatta daha gelişmiş modeller olarak regresyon, karar ağaçları, zaman serisi modelleri, yapay sinir ağları veya derin öğrenme modelleri kullanılabilir. Ancak proje kapsamında amaç, fintech uygulamalarında geçmiş finansal verilerden hareketle kullanıcıya bütçe ve nakit akışı konusunda erken uyarı sunma mantığını göstermektir.
```

---

# 17. Final Teslim Paketi

Teslimde klasör şu şekilde hazırlanabilir:

```txt
FinWise_Teslim/
├─ FinWise_Rapor.pdf
├─ FinWise_Sunum.pptx
├─ FinWise_Sunum.pdf
├─ FinWise_Ekran_Goruntuleri/
├─ GitHub_Link.txt
└─ Demo_Notlari.txt
```

---

# 18. Sık Kullanılacak Komutlar

### Dev

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Git Durum

```bash
git status
```

### Commit

```bash
git add .
git commit -m "feat: mesaj"
```

### Push

```bash
git push origin branch-adi
```

### Branch Oluşturma

```bash
git checkout -b sprint-X
```

### Develop'a Geçme

```bash
git checkout develop
```

---

# 19. Codex Kullanım Kuralı

Codex'e asla tek seferde "tüm projeyi yap" deme. Her sprintte küçük ve net görev ver.

İyi prompt örneği:

```txt
Sadece Sprint 2 görevlerini uygula. Var olan yapıyı bozma. Yeni dosya oluşturman gerekiyorsa oluştur ama mevcut route isimlerini değiştirme. npm run build başarılı kalmalı. İş bittikten sonra hangi dosyaları değiştirdiğini özetle.
```

Kötü prompt örneği:

```txt
Projeyi komple yap.
```

---

# 20. Her Sprint Sonu Kontrol Listesi

- [ ] Uygulama açılıyor mu?
- [ ] Menü linkleri çalışıyor mu?
- [ ] Konsolda hata var mı?
- [ ] `npm run lint` başarılı mı?
- [ ] `npm run build` başarılı mı?
- [ ] Ekran görüntüsü alındı mı?
- [ ] README veya sprint notu güncellendi mi?
- [ ] Commit atıldı mı?
- [ ] GitHub'a pushlandı mı?
- [ ] Pull Request açıldı mı?
- [ ] Develop'a merge edildi mi?

---

# 21. Hakan İçin Kısa Çalışma Sırası

1. GitHub repo aç.
2. Local proje oluştur.
3. Bu dosyayı `docs/project-plan.md` olarak koy.
4. Sprint 0'ı Codex'e yaptır.
5. Build al.
6. GitHub'a pushla.
7. Her sprintte bana çıktı/hata/görüntü at.
8. Sprint bitince merge yap.
9. En son rapor ve sunumu birlikte hazırla.

---

# 22. Unutulmaması Gereken Kritik Notlar

- Proje eğitim amaçlıdır.
- Gerçek banka bağlantısı yoktur.
- Gerçek ödeme yoktur.
- Gerçek yatırım tavsiyesi yoktur.
- Mock veriler kullanılır.
- En önemli şey çalışan demo + güçlü rapor anlatımıdır.
- Her sprint sonunda GitHub'a yükleme yapılacaktır.
- Build almadan sprint bitmiş sayılmaz.
