/**
 * FinWise - Screenshot Retake Script
 * Yalnızca belirtilen 7 kareyi (5 masaüstü, 2 mobil) yeniden çeker.
 */

import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs', 'final-screenshots');
const BASE_URL = 'http://localhost:3000';

const report = {
  taken: [],
  failed: []
};

async function screenshot(page, filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  try {
    await page.screenshot({ path: filepath });
    console.log(`  ✅ ${filename}`);
    report.taken.push(filename);
  } catch (err) {
    console.error(`  ❌ ${filename}: ${err.message}`);
    report.failed.push({ file: filename, error: err.message });
  }
}

async function navigateTo(page, route, extraMs = 700) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(extraMs);
}

async function main() {
  console.log('\n🚀 FinWise Screenshot Retake Script başlıyor...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
  });

  // 1. Masaüstü Context
  const desktopCtx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await desktopCtx.newPage();

  // İlk yükleme (localStorage seed)
  await navigateTo(page, '/', 1500);

  // --- 1) 04-dashboard-finansal-aksiyon-merkezi.png ---
  console.log('\n📸 1) 04-dashboard-finansal-aksiyon-merkezi.png');
  await navigateTo(page, '/dashboard', 1000);
  try {
    const actionEl = page.locator('text=Finansal Aksiyon Merkezi').first();
    await actionEl.waitFor({ timeout: 3000 });
    // Ortalamak için scrollIntoView ve hafif ayar
    await actionEl.evaluate(el => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(700);
  } catch (e) {
    console.log(`⚠️ Aksiyon Merkezi bulunamadı: ${e.message}`);
  }
  await screenshot(page, '04-dashboard-finansal-aksiyon-merkezi.png');

  // --- 2) 09-pdf-dekont-gorunumu.png ---
  console.log('\n📸 2) 09-pdf-dekont-gorunumu.png');
  try {
    const files = readdirSync(OUTPUT_DIR);
    const pdfFile = files.find(f => f.endsWith('.pdf'));
    if (pdfFile) {
      const pdfPath = path.join(OUTPUT_DIR, pdfFile);
      // Chromium native PDF görüntüleyicisini kullan
      const pdfUrl = 'file:///' + pdfPath.replace(/\\/g, '/');
      await page.goto(pdfUrl, { waitUntil: 'networkidle', timeout: 5000 });
      await page.waitForTimeout(1500);
      await screenshot(page, '09-pdf-dekont-gorunumu.png');
    } else {
      console.log('⚠️ PDF dosyası bulunamadı!');
      report.failed.push({ file: '09-pdf-dekont-gorunumu.png', error: 'PDF bulunamadı' });
    }
  } catch (e) {
    console.log(`⚠️ PDF Gösterim Hatası: ${e.message}`);
    report.failed.push({ file: '09-pdf-dekont-gorunumu.png', error: e.message });
  }

  // --- 3) 10-butce-plani-genel.png ---
  console.log('\n📸 3) 10-butce-plani-genel.png');
  await navigateTo(page, '/budget', 1000);
  try {
    // Üst istatistikler ve kart başlangıcı için çok az scroll
    await page.evaluate(() => window.scrollBy(0, 100));
    await page.waitForTimeout(700);
  } catch (e) {}
  await screenshot(page, '10-butce-plani-genel.png');

  // --- 4) 14-odeme-talimatlari-tamamlandi.png ---
  console.log('\n📸 4) 14-odeme-talimatlari-tamamlandi.png');
  await navigateTo(page, '/payments', 1000);
  try {
    const tamamEl = page.locator('text=Tamamlandı').first();
    await tamamEl.waitFor({ timeout: 3000 });
    await tamamEl.evaluate(el => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(700);
  } catch (e) {
    console.log(`⚠️ Tamamlandı bulunamadı: ${e.message}`);
  }
  await screenshot(page, '14-odeme-talimatlari-tamamlandi.png');

  // --- 5) 17-regtech-yuksek-riskli-islemler.png ---
  console.log('\n📸 5) 17-regtech-yuksek-riskli-islemler.png');
  await navigateTo(page, '/regtech', 1000);
  try {
    const riskEl = page.locator('text=Yüksek').first();
    await riskEl.waitFor({ timeout: 3000 });
    // Kart detayları net görünsün diye biraz daha aşağı scroll
    await riskEl.evaluate(el => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -50));
    await page.waitForTimeout(700);
  } catch (e) {
    console.log(`⚠️ Yüksek risk bulunamadı: ${e.message}`);
  }
  await screenshot(page, '17-regtech-yuksek-riskli-islemler.png');

  await desktopCtx.close();

  // 2. Mobil Context
  console.log('\n📱 Mobil viewport (390x844)');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileCtx.newPage();

  // --- 6) 23-mobile-dashboard.png ---
  console.log('\n📸 6) 23-mobile-dashboard.png');
  await navigateTo(mobilePage, '/dashboard', 1000);
  try {
    // Sağlık skoru veya hedefler kartı için scroll
    await mobilePage.evaluate(() => window.scrollBy(0, 450));
    await mobilePage.waitForTimeout(700);
  } catch (e) {}
  await screenshot(mobilePage, '23-mobile-dashboard.png');

  // --- 7) 24-mobile-islemler.png ---
  console.log('\n📸 7) 24-mobile-islemler.png');
  await navigateTo(mobilePage, '/transactions', 1000);
  try {
    // Tablo form alanına scroll
    await mobilePage.evaluate(() => window.scrollBy(0, 250));
    await mobilePage.waitForTimeout(700);
  } catch (e) {}
  await screenshot(mobilePage, '24-mobile-islemler.png');

  await mobileCtx.close();
  await browser.close();

  // README Güncellemesi
  const readmePath = path.join(OUTPUT_DIR, 'README.md');
  if (existsSync(readmePath)) {
    try {
      let content = readFileSync(readmePath, 'utf8');
      const updateNote = `\n\n*Not: ${report.taken.length} adet görsel retake-script ile ${new Date().toLocaleTimeString('tr-TR')} saatinde yenilendi.*`;
      writeFileSync(readmePath, content + updateNote, 'utf8');
      console.log('✅ README.md güncellendi');
    } catch (e) {
      console.log(`⚠️ README güncellenemedi: ${e.message}`);
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log(`✨ İşlem Tamamlandı: ${report.taken.length} yenilendi, ${report.failed.length} hata`);
  console.log('='.repeat(40));
}

main().catch(console.error);
