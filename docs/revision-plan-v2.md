# FinWise V2 Revizyon Planı

## Ürün Vizyonu

FinWise V2, kişisel finans yönetimini masaüstü webde profesyonel bir kontrol paneli olarak sunmayı hedefler. Kullanıcı; hesaplarını, nakit akışını, bütçe limitlerini, ödeme talimatlarını, risk sinyallerini ve yatırım profilini tek merkezden izler.

## Revizyon İlkeleri

- Next.js App Router, TypeScript ve Tailwind CSS korunur.
- Gerçek banka API bağlantısı, gerçek ödeme veya gerçek yatırım yönlendirmesi eklenmez.
- Route isimleri korunur; kullanıcıya görünen metinler ürün diline çevrilir.
- Büyük refactor yerine küçük ve kontrollü sprintlerle ilerlenir.
- Her sprint sonunda `npm run lint` ve `npm run build` başarılı olmalıdır.

## Sprint 6: UI Redesign ve Türkçe Metin Temizliği

Sprint 6, uygulamayı ödev/prototip hissinden çıkarıp kurumsal fintech paneli seviyesine yaklaştırır.

- AppShell masaüstü öncelikli finans paneline dönüştürülür.
- Sidebar, üst bar, aktif menü ve kullanıcı özeti profesyonel hale getirilir.
- Landing page modern FinWise ürün vitrini olarak yenilenir.
- Dashboard finansal sağlık skoru, metrik kartları, hızlı işlemler, hesap özeti, grafikler ve uyarılarla yeniden tasarlanır.
- Hesaplar, İşlemler, Bütçe Planı, Ödeme Talimatları, Risk İzleme ve Yatırım Profili sayfaları görsel olarak iyileştirilir.
- Görünen metinlerde Türkçe karakterler düzeltilir.
- Kullanıcı arayüzündeki sprint, ders, uyarı ve deneme dili kaldırılır.
- Recharts container ölçüleri düzenlenerek build uyarıları azaltılır.

## V2 Sonraki Sprintler

### Sprint 7: Veri Girişi ve Yerel Kalıcılık

- Tarayıcı içinde kalıcı veri yönetimi eklenir.
- İşlem ekleme/silme, hesap ekleme ve bütçe limiti düzenleme akışları tasarlanır.
- Dashboard hesaplamaları kullanıcı verisine bağlanır.

### Sprint 8: Modül Derinleştirme

- Ödeme talimat geçmişi ve durum takibi geliştirilir.
- Risk İzleme ekranında sebep, etki ve aksiyon önerileri güçlendirilir.
- Yatırım Profili ekranında analiz geçmişi ve dağılım görünümü iyileştirilir.

### Sprint 9: Final Sunum Kalitesi

- README, rapor, sunum planı ve demo akışı V2 görünümüne göre güncellenir.
- Ekran görüntüleri hazırlanır.
- Eski V1 dokümanları gerekirse arşivlenir.

## Kabul Kriterleri

- Uygulama 1366 px ve 1440 px masaüstü ekranlarda dengeli görünür.
- UI metinleri Türkçe karakterlidir ve ürün odaklıdır.
- Kullanıcı arayüzünde eski sprint/ders dili görünmez.
- Grafikler build sırasında ölçü uyarısı üretmez ya da anlamlı biçimde azaltılmıştır.
- Lint ve build başarılıdır.
