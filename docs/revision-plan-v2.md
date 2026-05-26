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

Sprint 6, uygulamayı kurumsal fintech paneli seviyesine yaklaştırır.

- AppShell masaüstü öncelikli finans paneline dönüştürülür.
- Sidebar, üst bar, aktif menü ve kullanıcı özeti profesyonel hale getirilir.
- Landing page modern FinWise ürün vitrini olarak yenilenir.
- Dashboard finansal sağlık skoru, metrik kartları, hızlı işlemler, hesap özeti, grafikler ve uyarılarla yeniden tasarlanır.
- Hesaplar, İşlemler, Bütçe Planı, Ödeme Talimatları, Risk İzleme ve Yatırım Profili sayfaları görsel olarak iyileştirilir.
- Görünen metinlerde Türkçe karakterler düzeltilir.
- Kullanıcı arayüzündeki sprint, ders, uyarı ve deneme dili kaldırılır.
- Recharts container ölçüleri düzenlenerek build uyarıları azaltılır.

## Sprint 7: Veri Girişi ve Yerel Kalıcılık

Sprint 7 tamamlandığında FinWise, tarayıcıda kalıcı veriyle çalışan ve kullanıcı girişi kabul eden ürün prototipine dönüşür.

- LocalStorage tabanlı veri snapshot yapısı eklenir.
- İşlem ekleme/silme, hesap ekleme ve bütçe limiti düzenleme akışları uygulanır.
- Dashboard, grafikler, risk sinyalleri ve tahminler güncel yerel veriden hesaplanır.
- Ödeme talimatı geçmişi ve yatırım profili sonucu kalıcı hale getirilir.
- AppShell üzerinden başlangıç verisine iki adımlı dönüş kontrolü sunulur.

## Sprint 8: Profesyonel Modüller (Tamamlandı)

- Ödeme Talimatları durum takibi, geçmiş detayları, durum özeti ve silme/güncelleme işlevleri eklendi.
- Risk İzleme ekranına sebep, etki ve önerilen aksiyon detayları eklenerek grid düzeni ve istatistik özeti getirildi.
- Yatırım Profili modülünde son analiz, önerilen dağılım grafiği, profil açıklamaları ve analiz geçmişi entegre edildi.
- Dashboard alanına Bekleyen Talimatlar, Yüksek Riskli Uyarılar ve Son Yatırım Profili metriklerini içeren "Operasyon Özeti" yerleştirildi.

## Sprint 9: Final Sunum Kalitesi (Tamamlandı)

- README, rapor, sunum planı, demo akışı, test senaryoları ve sınırlılıklar V2 sürümüne göre hazırlanarak teslim paketi oluşturuldu.
- Eski V1 dokümanları `docs/archive/v1/` dizinine taşınarak arşivlendi.
- Ekran görüntüsü kılavuzu ve kılavuz README'si oluşturuldu.
- Lint ve build doğrulama adımları sıfır hata ile tamamlandı.

## Kabul Kriterleri

- Uygulama 1366 px ve 1440 px masaüstü ekranlarda dengeli görünür.
- UI metinleri Türkçe karakterlidir ve ürün odaklıdır.
- Kullanıcı arayüzünde eski sprint/ders dili görünmez.
- Grafikler build sırasında ölçü uyarısı üretmez ya da anlamlı biçimde azaltılmıştır.
- Lint ve build başarılıdır.
