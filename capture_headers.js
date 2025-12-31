import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://evertext.sytes.net/';

(async () => {
    console.log('[HeaderCapture] Launching browser...');
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized',
            '--disable-features=IsolateOrigins,site-per-process',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]
    });

    const page = (await browser.pages())[0];

    console.log('[HeaderCapture] Navigating...');
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    console.log('[HeaderCapture] checking login status...');
    // Wait for user to login if not already
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
        }, { timeout: 300000 }); // 5 mins
    } catch {
        console.log('Timeout waiting for login');
    }

    // NOW enable interception to capture the reload
    await page.setRequestInterception(true);

    let captured = false;

    page.on('request', request => {
        if (!captured && request.url().startsWith(TARGET_URL) && request.resourceType() === 'document') {
            const headers = request.headers();
            console.log('[HeaderCapture] Captured headers for authenticated request!');
            fs.writeFileSync('./data/headers.json', JSON.stringify(headers, null, 2));
            captured = true;
        }
        request.continue();
    });

    console.log('[HeaderCapture] Reloading to capture headers with auth...');
    await page.reload({ waitUntil: 'domcontentloaded' });

    // Give it a second to save
    await new Promise(r => setTimeout(r, 2000));

    console.log('[HeaderCapture] Done.');
    await browser.close();
})();
