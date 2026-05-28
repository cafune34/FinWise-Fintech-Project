import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log('Navigating to transactions...');
  await page.goto('http://localhost:3000/transactions', { waitUntil: 'networkidle' });

  console.log('Clicking on Detay button...');
  const detayBtns = await page.$$('button:has-text("DETAY"), button:has-text("Detay")');
  if (detayBtns.length > 0) {
    await detayBtns[0].click();
    await page.waitForTimeout(1000);
    
    console.log('Clicking PDF Download button...');
    const pdfBtn = await page.$('button:has-text("PDF")');
    if (pdfBtn) {
      const downloadPromise = page.waitForEvent('download');
      await pdfBtn.click();
      const download = await downloadPromise;
      const downloadPath = await download.path();
      console.log('PDF Downloaded successfully to temp path:', downloadPath);
    } else {
      console.log('PDF button not found');
    }
  } else {
    console.log('Detay button not found');
  }

  await browser.close();
})();
