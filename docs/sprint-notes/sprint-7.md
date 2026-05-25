# Sprint 7 - Veri girişi ve yerel kalıcılık

## Sprint amacı

FinWise V2 panelini yalnızca hazır kayıtları gösteren bir yapıdan çıkarıp kullanıcı tarafından veri girilebilen, tarayıcıda kalıcı çalışan ürün prototipine dönüştürmek.

## Yapılan işler

- LocalStorage tabanlı merkezi veri katmanı eklendi.
- Uygulama geneline client store/provider bağlandı.
- Dashboard, Hesaplar, İşlemler, Bütçe Planı, Ödeme Talimatları, Risk İzleme ve Yatırım Profili ekranları güncel yerel veriden beslenecek hale getirildi.
- AppShell içine iki adımlı başlangıç verisine dönüş kontrolü eklendi.
- Görünür ürün dili ve Türkçe karakterler kontrol edildi.

## Eklenen veri girişi özellikleri

- İşlem ekleme, doğrulama, tabloya anlık ekleme ve işlem silme.
- Yeni işlem eklendiğinde veya silindiğinde ilgili hesap bakiyesinin güncellenmesi.
- Hesap ekleme ve yeni hesabın işlem/ödeme formlarında seçilebilir olması.
- Bütçe limitlerini kart üzerinden düzenleme.
- Ödeme talimatı oluşturma, talimat geçmişi, durum değiştirme ve silme.
- Yatırım profili sonucunu son analiz tarihiyle birlikte kaydetme.

## LocalStorage veri yönetimi

- Yerel veri anahtarı: `finwise:v2:sprint7`.
- İlk açılışta başlangıç verileri localStorage'a yazılır.
- Sonraki açılışlarda kayıtlı yerel veri kullanılır.
- Snapshot; kullanıcı, hesaplar, işlemler, bütçeler, ödeme talimatları ve yatırım profili sonuçlarını içerir.
- Kayıtlı veri bozulursa başlangıç verisine güvenli dönüş yapılır.
- "Verileri başlangıç durumuna al" kontrolü kayıtlı yerel verileri yeniler.

## Kabul kriterleri

- İşlem eklenir, silinir ve sayfa yenilenince kalıcı kalır.
- Hesap eklenir ve yeni hesap işlem formunda seçilebilir.
- Bütçe limiti düzenlenir; kalan tutar, kullanım yüzdesi ve risk/tahmin görünümü güncellenir.
- Dashboard metrikleri ve grafikler localStorage verisinden hesaplanır.
- Ödeme talimatı geçmişi kalıcıdır.
- Yatırım profili sonucu ve analiz tarihi kalıcıdır.
- Başlangıç verisine dönüş iki adımlı onayla çalışır.

## Test notları

- `npm run lint` çalıştırılmalıdır.
- `npm run build` çalıştırılmalıdır.
- Tarayıcıda işlem, hesap, bütçe, ödeme talimatı, yatırım profili ve reset akışları yenileme sonrası kontrol edilmelidir.
- Grafiklerde Recharts ölçü uyarısı oluşmadığı doğrulanmalıdır.

## Sonraki sprint notları

- Ödeme talimatlarında durum geçmişi ve detay filtreleri geliştirilebilir.
- Risk İzleme ekranında kullanıcı aksiyonları ve açıklama detayları güçlendirilebilir.
- Hesap/işlem formlarına daha gelişmiş düzenleme akışları eklenebilir.
