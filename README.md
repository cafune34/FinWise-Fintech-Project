# FinWise

## Proje Adi
FinWise - Finansal Teknolojiler dersi icin gelistirilen egitim odakli fintech demo uygulamasi.

## Ders Baglami
Bu proje, universite duzeyinde Finansal Teknolojiler dersi kapsaminda sprint mantigiyla gelistirilmistir ve final teslimine hazir hale getirilmistir.

## Proje Amaci
- Acik bankacilik, kisisel finans, odeme ve robo-danismanlik kavramlarini tek bir demo uygulamada gostermek
- Gercek sistemlere baglanmadan fintech urun akislarini simule etmek
- Ders kapsami icin raporlanabilir, sunulabilir ve test edilebilir bir prototip cikarmak

## Ozellikler
- Dashboard: toplam bakiye, gelir-gider, net nakit akisi ve grafikler
- Accounts: mock banka hesaplari ve hesap ozeti
- Transactions: filtrelenebilir islem listesi
- Budget: kategori bazli butce takibi ve asim uyarisi
- Forecasting: son 3 ay ortalamasi + kategori katsayisi ile tahminleme
- RegTech: kural tabanli supheli islem uyari simulasyonu
- Payments: PISP odeme emri simulasyonu
- Robo Advisor: risk anketi ve ornek portfoy dagilimi

## Kullanilan Teknolojiler
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Recharts
- Zod

## Kurulum
```bash
npm install
```

## Calistirma
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Sayfa / Modul Listesi
- `/` Ana sayfa
- `/dashboard`
- `/accounts`
- `/transactions`
- `/budget`
- `/regtech`
- `/payments`
- `/robo-advisor`

## Sprint Ozeti
- Sprint 0: proje plani, repo ve temel iskelet
- Sprint 1: App Router sayfalari, AppShell, mock veri ve temel tipler
- Sprint 2: dashboard, finans hesaplama helper'lari, butce ve islem filtreleri
- Sprint 3: tahminleme ve RegTech kural motoru
- Sprint 4: odeme emri simulasyonu ve robo-danismanlik modulu
- Sprint 5: final dokumantasyon, test senaryolari, demo akisi ve teslim temizligi

## Egitim Amacli Sinirliliklar
- Proje egitim amaclidir.
- Gercek banka baglantisi yoktur.
- Gercek odeme yapilmaz.
- Gercek yatirim tavsiyesi degildir.
- Mock/simulasyon veri kullanilir.
