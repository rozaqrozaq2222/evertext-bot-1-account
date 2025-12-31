import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';
import path from 'path';

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://evertext.sytes.net/';

// Paths to save cookies to
const SAVE_PATHS = [
    './data/cookies.json',
    '../Evertext-Friend-Bot/data/cookies.json',
    '../Evertext-Discord-Bot/data/cookies.json'
];

(async () => {
    console.log('[CookieRefresher] Launching browser...');
    const browser = await puppeteer.launch({
        headless: false, // User needs to see this to login if needed
        defaultViewport: null,
        args: [
            '--start-maximized',
            '--disable-features=IsolateOrigins,site-per-process',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        ]
    });

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    console.log('[CookieRefresher] Navigating to Evertext...');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    // Check if logged in
    const isLoggedIn = await page.evaluate(() => {
        return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
    });

    if (!isLoggedIn) {
        console.log('[CookieRefresher] Not logged in. Please log in manually inside the browser window!');
        console.log('[CookieRefresher] Waiting up to 2 minutes for login...');
        try {
            await page.waitForFunction(() => {
                return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
            }, { timeout: 120000 });
        } catch (e) {
            console.error('[CookieRefresher] Login timed out. Exiting.');
            await browser.close();
            return;
        }
    }

    console.log('[CookieRefresher] Login detected! Capturing cookies...');

    // wait a bit for cloudflare/socket cookies to settle
    await new Promise(resolve => setTimeout(resolve, 3000));

    const client = await page.target().createCDPSession();
    const { cookies } = await client.send('Network.getAllCookies');

    console.log(`[CookieRefresher] Captured ${cookies.length} cookies.`);

    // Save to all paths
    const jsonCookies = JSON.stringify(cookies, null, 2);

    for (const relativePath of SAVE_PATHS) {
        const fullPath = path.resolve(relativePath);
        try {
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            fs.writeFileSync(fullPath, jsonCookies);
            console.log(`[CookieRefresher] Saved to ${fullPath}`);
        } catch (err) {
            console.warn(`[CookieRefresher] Could not save to ${fullPath}: ${err.message}`);
        }
    }

    console.log('[CookieRefresher] Done. Closing browser.');
    await browser.close();
})();
