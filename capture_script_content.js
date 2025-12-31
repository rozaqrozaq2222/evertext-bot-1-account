import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://evertext.sytes.net/';

(async () => {
    console.log('[ScriptCapture] Launching browser...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const page = (await browser.pages())[0];
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    console.log('[ScriptCapture] Waiting for login...');
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
        }, { timeout: 300000 });
    } catch {
        console.log('Timeout waiting for login');
    }

    console.log('[ScriptCapture] Extracting socket initialization code...');
    const scripts = await page.evaluate(() => {
        const scriptTags = Array.from(document.querySelectorAll('script'));
        return scriptTags.map(s => s.innerText || s.src)
            .filter(t => t.includes('io(') || t.includes('socket') || t.includes('connect'));
    });

    console.log('--- FOUND SCRIPTS ---');
    scripts.forEach(s => {
        if (s.length < 500) {
            console.log(s);
        } else {
            console.log(s.substring(0, 500) + '...');
        }
    });

    await browser.close();
})();
