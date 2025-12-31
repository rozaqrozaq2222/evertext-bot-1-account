import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://evertext.sytes.net/';

(async () => {
    console.log('[StorageDumper] Launching browser...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const page = (await browser.pages())[0];
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    console.log('[StorageDumper] Checking login...');
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
        }, { timeout: 60000 });
    } catch {
        console.log('[StorageDumper] Please login manually!');
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Logout');
        }, { timeout: 300000 });
    }

    console.log('[StorageDumper] Dumping LocalStorage...');
    const storage = await page.evaluate(() => JSON.stringify(localStorage));

    fs.writeFileSync('./data/localstorage.json', storage);
    console.log('[StorageDumper] Saved to ./data/localstorage.json: ' + storage);

    await browser.close();
})();
