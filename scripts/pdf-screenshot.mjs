import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const pdfPath = fs.readdirSync('docs/final-screenshots').find(f => f.endsWith('.pdf'));
  const b64 = fs.readFileSync('docs/final-screenshots/' + pdfPath, 'base64');
  await page.setContent(`<iframe src="data:application/pdf;base64,${b64}" width="100%" height="100%" style="border:none;margin:0;padding:0;position:absolute;top:0;left:0;"></iframe>`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'docs/final-screenshots/09-pdf-dekont-gorunumu.png' });
  await browser.close();
  console.log('PDF success');
})();
