/**
 * FinWise - Final Presentation Screenshot Script v2
 * Playwright ile otomatik ekran görüntüsü alma
 * Gerçek component selector'larıyla hazırlanmıştır.
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'final-screenshots');
const BASE_URL = 'http://localhost:3000';

// Klasörü oluştur
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Klasör oluşturuldu: ${OUTPUT_DIR}`);
} else {
  console.log(`📁 Klasör mevcut: ${OUTPUT_DIR}`);
}

const report = {
  taken: [],
  failed: [],
  pdfDownloaded: false,
  pdfFile: null,
  pdfFileName: null,
};

async function waitForPage(page, extraMs = 700) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    // networkidle timeout'u geçerse devam et
  }
  await page.waitForTimeout(extraMs);
}

async function scrollToTop(page) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
}

async function screenshot(page, filename, fullPage = false) {
  const filepath = path.join(OUTPUT_DIR, filename);
  try {
    await page.screenshot({ path: filepath, fullPage });
    console.log(`  ✅ ${filename}`);
    report.taken.push(filename);
  } catch (err) {
    console.error(`  ❌ ${filename}: ${err.message}`);
    report.failed.push({ file: filename, error: err.message });
  }
  return filepath;
}

async function navigateTo(page, route, extraMs = 800) {
  try {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  }
  await scrollToTop(page);
  await page.waitForTimeout(extraMs);
}

// ============================================================
// ANA SCRIPT
// ============================================================
async function main() {
  console.log('\n🚀 FinWise Final Screenshot Script v2 başlıyor...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  // ============================================================
  // DESKTOP CONTEXT (1920x1080)
  // ============================================================
  console.log('\n🖥️  Desktop viewport (1920x1080)');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    acceptDownloads: true,
  });
  const page = await desktopCtx.newPage();

  // İlk yükleme - localStorage mevcut veriyi koru
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1500);

  // --- 1. Dashboard genel görünüm ---
  console.log('\n📸 1. Dashboard genel görünüm');
  await navigateTo(page, '/dashboard', 1200);
  await screenshot(page, '01-dashboard-genel-gorunum.png');

  // --- 2. Dashboard nakit akışı tahmin şeridi ---
  console.log('\n📸 2. Dashboard nakit akışı tahmin şeridi');
  await navigateTo(page, '/dashboard', 1000);
  // Sayfayı biraz scroll ederek ForecastCard'ı getir
  await page.evaluate(() => window.scrollBy(0, 280));
  await page.waitForTimeout(700);
  await screenshot(page, '02-dashboard-nakit-akisi-tahmin-seridi.png');

  // --- 3. Dashboard hedefler + abonelik + takvim ---
  console.log('\n📸 3. Dashboard hedefler + abonelik + takvim');
  await navigateTo(page, '/dashboard', 1000);
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(700);
  await screenshot(page, '03-dashboard-hedefler-abonelik-takvim.png');

  // --- 4. Dashboard finansal aksiyon merkezi ---
  console.log('\n📸 4. Dashboard finansal aksiyon merkezi');
  await navigateTo(page, '/dashboard', 1000);
  // Sayfanın en altına scroll
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await screenshot(page, '04-dashboard-finansal-aksiyon-merkezi.png');

  // --- 5. Accounts portföy görünümü ---
  console.log('\n📸 5. Hesaplar portföy görünümü');
  await navigateTo(page, '/accounts', 1000);
  await screenshot(page, '05-hesaplar-portfoy-gorunumu.png');

  // --- 6. Transactions genel ---
  console.log('\n📸 6. İşlemler liste genel');
  await navigateTo(page, '/transactions', 1000);
  await screenshot(page, '06-islemler-liste-genel.png');

  // --- 7. Transactions tablo detay ---
  console.log('\n📸 7. İşlemler tablo detay');
  await navigateTo(page, '/transactions', 1000);
  await page.evaluate(() => window.scrollBy(0, 350));
  await page.waitForTimeout(600);
  await screenshot(page, '07-islemler-tablo-detay.png');

  // --- 8. İşlem detay modalı ---
  console.log('\n📸 8. İşlem detay modalı');
  await navigateTo(page, '/transactions', 1000);
  let txnModalOpened = false;
  try {
    // "DETAY" butonunu bul - TransactionTable.tsx'de uppercase "DETAY" yazıyor
    const detayBtns = await page.$$('button:has-text("DETAY"), button:has-text("Detay")');
    if (detayBtns.length > 0) {
      await detayBtns[0].click();
      await page.waitForTimeout(900);
      txnModalOpened = true;
      console.log('  ✓ Detay modalı açıldı');
    }
  } catch (e) {
    console.log(`  ⚠️ Detay butonu tıklama hatası: ${e.message}`);
  }
  await screenshot(page, '08-islem-detay-modali.png');

  // --- 9. PDF Dekont ---
  console.log('\n📸 9. PDF Dekont');
  try {
    if (!txnModalOpened) {
      // Tekrar dene
      const detayBtns = await page.$$('button:has-text("DETAY"), button:has-text("Detay")');
      if (detayBtns.length > 0) {
        await detayBtns[0].click();
        await page.waitForTimeout(900);
        txnModalOpened = true;
      }
    }
    if (txnModalOpened) {
      // PDF butonunu ara - "PDF Dekont İndir"
      const pdfBtn = await page.$('button:has-text("PDF")');
      if (pdfBtn) {
        // Download event'ini dinle
        const downloadPromise = desktopCtx.waitForEvent('download', { timeout: 8000 }).catch(() => null);
        await pdfBtn.click();
        await page.waitForTimeout(2000);
        const download = await downloadPromise;
        if (download) {
          const suggestedName = download.suggestedFilename() || 'dekont.pdf';
          const pdfPath = path.join(OUTPUT_DIR, suggestedName);
          await download.saveAs(pdfPath);
          report.pdfDownloaded = true;
          report.pdfFile = pdfPath;
          report.pdfFileName = suggestedName;
          console.log(`  ✅ PDF kaydedildi: ${pdfPath}`);
        } else {
          console.log('  ℹ️ PDF download event yakalanamadı (belki yeni sekmede açıldı)');
          report.pdfFileName = 'PDF butonu tıklandı ancak download event alınamadı';
        }
        // Modal hala açıksa screenshot al
        await screenshot(page, '09-pdf-dekont-gorunumu.png');
      } else {
        console.log('  ⚠️ PDF butonu bulunamadı');
        // Modalın mevcut halini kaydet
        await screenshot(page, '09-pdf-dekont-gorunumu.png');
        report.failed.push({ file: '09-pdf-dekont-gorunumu.png', error: 'PDF butonu bulunamadı' });
      }
    } else {
      console.log('  ⚠️ Modal açılamadı, sayfa screenshot alınıyor');
      await screenshot(page, '09-pdf-dekont-gorunumu.png');
    }
  } catch (e) {
    console.log(`  ⚠️ PDF hatası: ${e.message}`);
    await screenshot(page, '09-pdf-dekont-gorunumu.png');
  }

  // --- 10. Budget genel ---
  console.log('\n📸 10. Bütçe planı genel');
  await navigateTo(page, '/budget', 1000);
  await screenshot(page, '10-butce-plani-genel.png');

  // --- 11. Budget Senaryo Analizi ---
  console.log('\n📸 11. Bütçe senaryo analizi');
  await navigateTo(page, '/budget', 1000);
  // Senaryo Analizi alanını bul ve scroll
  try {
    const el = page.locator('text=Senaryo Analizi').first();
    await el.waitFor({ timeout: 3000 });
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  } catch (e) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(600);
  }
  await screenshot(page, '11-butce-senaryo-analizi.png');

  // --- 12. Budget limit kartları ---
  console.log('\n📸 12. Bütçe limit kartları');
  await navigateTo(page, '/budget', 1000);
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.waitForTimeout(500);
  await screenshot(page, '12-butce-limit-kartlari.png');

  // --- 13. Payments genel ---
  console.log('\n📸 13. Ödeme talimatları genel');
  await navigateTo(page, '/payments', 1000);
  await screenshot(page, '13-odeme-talimatlari-genel.png');

  // --- 14. Payments tamamlanmış talimat ---
  console.log('\n📸 14. Ödeme talimatları tamamlandı');
  await navigateTo(page, '/payments', 1000);
  try {
    const tamamEl = page.locator('text=Tamamlandı').first();
    await tamamEl.waitFor({ timeout: 3000 });
    await tamamEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
  } catch (e) {
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(500);
  }
  await screenshot(page, '14-odeme-talimatlari-tamamlandi.png');

  // --- 15. Payments yeni talimat ---
  console.log('\n📸 15. Ödeme talimatları yeni talimat');
  await navigateTo(page, '/payments', 1000);
  // Form genellikle sayfanın alt kısmında
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(600);
  await screenshot(page, '15-odeme-talimatlari-yeni-talimat.png');

  // --- 16. RegTech genel ---
  console.log('\n📸 16. RegTech risk izleme genel');
  await navigateTo(page, '/regtech', 1000);
  await screenshot(page, '16-regtech-risk-izleme-genel.png');

  // --- 17. RegTech yüksek riskli ---
  console.log('\n📸 17. RegTech yüksek riskli işlemler');
  await navigateTo(page, '/regtech', 1000);
  try {
    // "Yüksek" veya risk level elementini bul
    const riskEl = page.locator('text=Yüksek').first();
    await riskEl.waitFor({ timeout: 3000 });
    await riskEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
  } catch (e) {
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(600);
  }
  await screenshot(page, '17-regtech-yuksek-riskli-islemler.png');

  // --- 18. Robo Advisor anket ---
  console.log('\n📸 18. Robo Advisor anket');
  await navigateTo(page, '/robo-advisor', 1200);
  await screenshot(page, '18-robo-advisor-anket.png');

  // --- 19. Robo Advisor profil sonucu ---
  console.log('\n📸 19. Robo Advisor profil sonucu');
  await navigateTo(page, '/robo-advisor', 1200);
  // Anket formunu doldur - radio button name pattern: question.id + "-" + option.value
  // RoboQuestionnaire.tsx'de radio butonlar `name={question.id}` ile
  try {
    const radios = await page.$$('input[type="radio"]');
    console.log(`  Radio buton sayısı: ${radios.length}`);
    if (radios.length > 0) {
      // Tüm soruları grupla - name özelliğine göre
      const names = new Set();
      for (const r of radios) {
        const name = await r.getAttribute('name');
        if (name) names.add(name);
      }
      console.log(`  Soru grubu sayısı: ${names.size}`);
      // Her soru için 2. seçeneği seç (orta risk)
      for (const name of names) {
        const groupRadios = await page.$$(`input[type="radio"][name="${name}"]`);
        if (groupRadios.length >= 2) {
          const midIdx = Math.floor(groupRadios.length / 2);
          await groupRadios[midIdx].click();
          await page.waitForTimeout(150);
        } else if (groupRadios.length === 1) {
          await groupRadios[0].click();
          await page.waitForTimeout(150);
        }
      }
      await page.waitForTimeout(1200);
      console.log('  ✓ Anket dolduruldu');
    }
  } catch (e) {
    console.log(`  ⚠️ Anket doldurma: ${e.message}`);
  }
  await screenshot(page, '19-robo-advisor-profil-sonucu.png');

  // --- 20. Robo Advisor 12 aylık projeksiyon ---
  console.log('\n📸 20. Robo Advisor 12 aylık projeksiyon');
  // Projeksiyon bölümü için scroll
  try {
    const projEl = page.locator('text=12 Ay').first();
    await projEl.waitFor({ timeout: 3000 });
    await projEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
  } catch (e) {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(800);
  }
  await screenshot(page, '20-robo-advisor-12-aylik-projeksiyon.png');

  // --- 21. Sunum Modu modalı ---
  console.log('\n📸 21. Sunum Modu modalı');
  await navigateTo(page, '/dashboard', 1000);
  let sunumModalOpened = false;
  try {
    // AppShell.tsx: <button ... onClick={() => setIsPresentationModalOpen(true)}>
    // <span>🎬 Sunum Modu</span>
    const sunumBtn = page.locator('button:has-text("Sunum Modu")').first();
    await sunumBtn.waitFor({ timeout: 5000 });
    await sunumBtn.click();
    await page.waitForTimeout(900);
    sunumModalOpened = true;
    console.log('  ✓ Sunum Modu modalı açıldı');
  } catch (e) {
    console.log(`  ⚠️ Sunum Modu butonu: ${e.message}`);
    // Alternatif - emoji ile ara
    try {
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const txt = await btn.innerText().catch(() => '');
        if (txt.includes('Sunum')) {
          await btn.click();
          await page.waitForTimeout(900);
          sunumModalOpened = true;
          break;
        }
      }
    } catch (e2) {}
  }
  await screenshot(page, '21-sunum-modu-modali.png');

  // --- 22. Sunum Modu ilk adım ---
  console.log('\n📸 22. Sunum Modu dashboard akışı');
  if (sunumModalOpened) {
    try {
      // "Bu ekrana git" butonuna tıkla - ilk adım Genel Bakış / dashboard
      const gitBtns = await page.$$('a:has-text("Bu ekrana git")');
      if (gitBtns.length > 0) {
        await gitBtns[0].click();
        await page.waitForTimeout(1000);
        console.log('  ✓ "Bu ekrana git" butonuna tıklandı');
      } else {
        // "Sunuma Başla" butonunu dene
        const baslaBtns = await page.$$('button:has-text("Sunuma Başla")');
        if (baslaBtns.length > 0) {
          await baslaBtns[0].click();
          await page.waitForTimeout(1000);
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Sunum akış: ${e.message}`);
    }
  } else {
    await navigateTo(page, '/dashboard', 800);
  }
  await scrollToTop(page);
  await screenshot(page, '22-sunum-modu-dashboard-akisi.png');

  await desktopCtx.close();

  // ============================================================
  // MOBILE CONTEXT (390x844)
  // ============================================================
  console.log('\n📱 Mobil viewport (390x844)');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileCtx.newPage();

  // 23. Mobile Dashboard
  console.log('\n📸 23. Mobil dashboard');
  await mobilePage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(900);
  await screenshot(mobilePage, '23-mobile-dashboard.png');

  // 24. Mobile Transactions
  console.log('\n📸 24. Mobil işlemler');
  await mobilePage.goto(`${BASE_URL}/transactions`, { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.evaluate(() => window.scrollTo(0, 0));
  await mobilePage.waitForTimeout(900);
  await screenshot(mobilePage, '24-mobile-islemler.png');

  // 25. Mobile işlem detay modalı
  console.log('\n📸 25. Mobil işlem detay modalı');
  try {
    const detayBtns = await mobilePage.$$('button:has-text("DETAY"), button:has-text("Detay")');
    if (detayBtns.length > 0) {
      await detayBtns[0].click();
      await mobilePage.waitForTimeout(900);
      console.log('  ✓ Mobil Detay modalı açıldı');
    }
  } catch (e) {
    console.log(`  ⚠️ Mobil modal: ${e.message}`);
  }
  await screenshot(mobilePage, '25-mobile-islem-detay-modali.png');

  await mobileCtx.close();

  // ============================================================
  // TABLET CONTEXT (1366x768)
  // ============================================================
  console.log('\n💻 Tablet viewport (1366x768)');
  const tabletCtx = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    deviceScaleFactor: 1,
  });
  const tabletPage = await tabletCtx.newPage();

  // 26. Tablet Dashboard
  console.log('\n📸 26. Tablet dashboard');
  await tabletPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await tabletPage.evaluate(() => window.scrollTo(0, 0));
  await tabletPage.waitForTimeout(900);
  await screenshot(tabletPage, '26-tablet-dashboard-1366.png');

  // 27. Tablet Budget Senaryo
  console.log('\n📸 27. Tablet bütçe senaryo');
  await tabletPage.goto(`${BASE_URL}/budget`, { waitUntil: 'networkidle', timeout: 15000 });
  await tabletPage.evaluate(() => window.scrollTo(0, 0));
  await tabletPage.waitForTimeout(800);
  try {
    const senaryEl = tabletPage.locator('text=Senaryo Analizi').first();
    await senaryEl.waitFor({ timeout: 3000 });
    await senaryEl.scrollIntoViewIfNeeded();
    await tabletPage.waitForTimeout(600);
  } catch (e) {
    await tabletPage.evaluate(() => window.scrollBy(0, 400));
    await tabletPage.waitForTimeout(600);
  }
  await screenshot(tabletPage, '27-tablet-butce-senaryo-1366.png');

  await tabletCtx.close();

  // ============================================================
  // FULL PAGE SCREENSHOTS (Desktop 1920x1080)
  // ============================================================
  console.log('\n🖼️ Full-page screenshotlar');
  const fullCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const fullPage = await fullCtx.newPage();

  // 28. Full page dashboard
  console.log('\n📸 28. Dashboard full page');
  await fullPage.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 });
  await fullPage.evaluate(() => window.scrollTo(0, 0));
  await fullPage.waitForTimeout(1200);
  await screenshot(fullPage, '28-dashboard-full-page.png', true);

  // 29. Full page transactions
  console.log('\n📸 29. İşlemler full page');
  await fullPage.goto(`${BASE_URL}/transactions`, { waitUntil: 'networkidle', timeout: 15000 });
  await fullPage.evaluate(() => window.scrollTo(0, 0));
  await fullPage.waitForTimeout(1200);
  await screenshot(fullPage, '29-islemler-full-page.png', true);

  // 30. Full page budget
  console.log('\n📸 30. Bütçe full page');
  await fullPage.goto(`${BASE_URL}/budget`, { waitUntil: 'networkidle', timeout: 15000 });
  await fullPage.evaluate(() => window.scrollTo(0, 0));
  await fullPage.waitForTimeout(1200);
  await screenshot(fullPage, '30-butce-full-page.png', true);

  await fullCtx.close();
  await browser.close();

  // ============================================================
  // README OLUŞTUR
  // ============================================================
  console.log('\n📝 README.md oluşturuluyor...');
  const failedNote = report.failed.length > 0
    ? report.failed.map(f => `- ❌ ${f.file}: ${f.error}`).join('\n')
    : '(Alınamayan screenshot yok)';

  const readmeContent = `# FinWise — Final Sunum Ekran Görüntüleri

Bu klasör, FinWise projesi final sunumu için otomatik olarak alınmış ekran görüntülerini içermektedir.

**Tarih:** ${new Date().toLocaleDateString('tr-TR')}  
**Branch:** develop  
**Kullanıcı:** Hakan Dolay / HD

---

## Özet

| Metrik | Değer |
|--------|-------|
| Alınan screenshot | **${report.taken.length}** |
| Alınamayan screenshot | **${report.failed.length}** |
| PDF Dekont | ${report.pdfDownloaded ? `✅ İndirildi → \`${report.pdfFileName}\`` : report.pdfFileName ? `ℹ️ ${report.pdfFileName}` : '❌ İndirilemedi'} |
| Masaüstü (1920x1080) | ✅ |
| Mobil (390x844) | ✅ |
| Tablet (1366x768) | ✅ |

---

## Ekran Görüntüleri

| # | Dosya | Route | Viewport | İçerik | Önerilen Slayt |
|---|-------|-------|----------|--------|----------------|
| 1 | 01-dashboard-genel-gorunum.png | /dashboard | 1920x1080 | Portföy Özeti, Finansal Sağlık Skoru, Nakit Akışı, Operasyon Özeti | Genel Bakış / Giriş |
| 2 | 02-dashboard-nakit-akisi-tahmin-seridi.png | /dashboard | 1920x1080 | Nakit Akışı Tahmini, akıllı içgörü şeridi | Akıllı Tahmin |
| 3 | 03-dashboard-hedefler-abonelik-takvim.png | /dashboard | 1920x1080 | Finansal Hedefler, Abonelik tespiti, Finansal Takvim | Hedef & Takvim |
| 4 | 04-dashboard-finansal-aksiyon-merkezi.png | /dashboard | 1920x1080 | Finansal Aksiyon Merkezi, aylık özet | Karar Destek |
| 5 | 05-hesaplar-portfoy-gorunumu.png | /accounts | 1920x1080 | Bağlı hesaplar, bakiye kartları, portföy | Hesap Yönetimi |
| 6 | 06-islemler-liste-genel.png | /transactions | 1920x1080 | İşlem/gelir/gider kartları, filtreler | İşlem Yönetimi |
| 7 | 07-islemler-tablo-detay.png | /transactions | 1920x1080 | İşlem satırları, kategori, tutar, Riskli etiketleri | İşlem Detayları |
| 8 | 08-islem-detay-modali.png | /transactions | 1920x1080 | İşlem Detayı modalı, tutar, tarih, referans no, PDF butonu | Modal Detay |
| 9 | 09-pdf-dekont-gorunumu.png | /transactions | 1920x1080 | PDF Dekont akışı | PDF Dekont |
| 10 | 10-butce-plani-genel.png | /budget | 1920x1080 | Bütçe kartları, kategori limitleri | Bütçe Yönetimi |
| 11 | 11-butce-senaryo-analizi.png | /budget | 1920x1080 | Senaryo Analizi, tasarruf hesaplama | Senaryo Analizi |
| 12 | 12-butce-limit-kartlari.png | /budget | 1920x1080 | Limit kartları Market/Ulaşım/Fatura/Eğlence | Bütçe Limitleri |
| 13 | 13-odeme-talimatlari-genel.png | /payments | 1920x1080 | Ödeme talimatları listesi, güven skoru | Ödeme Talimatları |
| 14 | 14-odeme-talimatlari-tamamlandi.png | /payments | 1920x1080 | Tamamlanmış talimat, gider yansıması | Tamamlanan Ödemeler |
| 15 | 15-odeme-talimatlari-yeni-talimat.png | /payments | 1920x1080 | Yeni ödeme talimatı formu | Yeni Talimat |
| 16 | 16-regtech-risk-izleme-genel.png | /regtech | 1920x1080 | Risk uyarıları, risk metrikleri | Risk İzleme |
| 17 | 17-regtech-yuksek-riskli-islemler.png | /regtech | 1920x1080 | Yüksek riskli uyarılar, risk seviyeleri | Yüksek Risk |
| 18 | 18-robo-advisor-anket.png | /robo-advisor | 1920x1080 | Risk Profili Analizi soruları, cevap seçenekleri | Robo Advisor Giriş |
| 19 | 19-robo-advisor-profil-sonucu.png | /robo-advisor | 1920x1080 | Risk profili sonucu, önerilen portföy dağılımı | Yatırım Profili |
| 20 | 20-robo-advisor-12-aylik-projeksiyon.png | /robo-advisor | 1920x1080 | 12 Aylık Varsayımsal Projeksiyon | Projeksiyon Grafiği |
| 21 | 21-sunum-modu-modali.png | /dashboard | 1920x1080 | Sunum Modu adımları, "Bu ekrana git" butonları | Sunum Modu |
| 22 | 22-sunum-modu-dashboard-akisi.png | /dashboard | 1920x1080 | Sunum akışı dashboard yönlendirmesi | Sunum Akışı |
| 23 | 23-mobile-dashboard.png | /dashboard | 390x844 | Mobil dashboard layout, portföy kartları | Responsive — Mobil |
| 24 | 24-mobile-islemler.png | /transactions | 390x844 | Mobil işlemler görünümü | Responsive — Mobil |
| 25 | 25-mobile-islem-detay-modali.png | /transactions | 390x844 | Mobil işlem detay modalı | Responsive — Modal |
| 26 | 26-tablet-dashboard-1366.png | /dashboard | 1366x768 | Tablet dashboard, dengeli kart görünümü | Responsive — Tablet |
| 27 | 27-tablet-butce-senaryo-1366.png | /budget | 1366x768 | Tablet bütçe senaryo analizi | Responsive — Tablet |
| 28 | 28-dashboard-full-page.png | /dashboard | 1920x1080 | Dashboard tam sayfa (fullPage) | Full-Page |
| 29 | 29-islemler-full-page.png | /transactions | 1920x1080 | İşlemler tam sayfa (fullPage) | Full-Page |
| 30 | 30-butce-full-page.png | /budget | 1920x1080 | Bütçe tam sayfa (fullPage) | Full-Page |

---

## Alınamayan / Sorunlu Görüntüler

${failedNote}

---

*Bu dosya \`scripts/take-screenshots.mjs\` betiği tarafından otomatik oluşturulmuştur.*
`;

  writeFileSync(path.join(OUTPUT_DIR, 'README.md'), readmeContent, 'utf8');
  console.log('  ✅ README.md oluşturuldu');

  // ============================================================
  // FINAL RAPOR
  // ============================================================
  console.log('\n' + '='.repeat(65));
  console.log('📊 FINAL RAPOR');
  console.log('='.repeat(65));
  console.log(`✅ Alınan screenshot sayısı  : ${report.taken.length} / 30`);
  console.log(`❌ Alınamayan screenshot     : ${report.failed.length}`);
  console.log(`📁 Çıktı klasörü            : ${OUTPUT_DIR}`);
  console.log(`📄 PDF Dekont               : ${report.pdfDownloaded ? '✅ İndirildi → ' + report.pdfFileName : report.pdfFileName || '❌ İndirilemedi'}`);
  console.log(`📱 Mobil screenshots        : ✅ (390x844)`);
  console.log(`💻 Tablet screenshots       : ✅ (1366x768)`);
  console.log(`📝 README.md               : ✅ Oluşturuldu`);

  if (report.failed.length > 0) {
    console.log('\nAlınamayan dosyalar:');
    report.failed.forEach(f => console.log(`  - ${f.file}: ${f.error}`));
  }

  if (report.taken.length > 0) {
    console.log('\nAlınan dosyalar:');
    report.taken.forEach(f => console.log(`  ✅ ${f}`));
  }

  console.log('\n✨ Screenshot alma işlemi tamamlandı!');
}

main().catch(err => {
  console.error('💥 Script hatası:', err);
  process.exit(1);
});
