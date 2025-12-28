import puppeteer from 'puppeteer';
import fs from 'fs';

const GAME_URL = 'https://evertext.sytes.net/';

(async () => {
    console.log('🔵 Launching browser for manual login...');
    console.log('👉 Please login with Discord in the opened window.');
    console.log('👉 Once you see the "Terminal" or "Game" screen, return here.');

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null
    });

    const page = await browser.newPage();
    // Use EXACTLY the same User-Agent as the bot to ensure session validity
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto(GAME_URL, { waitUntil: 'networkidle2' });

        console.log('\n⏳ Waiting for you to reach the main game screen...');
        console.log('👉 Step 1: Click "Login with Discord" in Chrome.');
        console.log('👉 Step 2: Authorize/Login in the Discord window.');
        console.log('👉 Step 3: Wait until you see the Black Terminal or Game UI.');
        console.log('\n🛑 WHEN LOGGED IN:');
        console.log('⌨️  Press [ENTER] in this terminal (PowerShell) to save cookies and close.');

        // Wait for manual user confirmation
        const readline = (await import('readline')).createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await new Promise(resolve => readline.question('', resolve));
        readline.close();

        console.log('✅ Finalizing... Waiting 3 seconds to ensure cookies settle...');
        await new Promise(r => setTimeout(r, 3000));

        // Get cookies
        const cookies = await page.cookies();

        // Ensure data directory exists
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data');
        }

        fs.writeFileSync('./data/cookies.json', JSON.stringify(cookies, null, 2));

        console.log(`\n💾 SUCCESS! Saved ${cookies.length} cookies to data/cookies.json`);
        console.log('🎉 Your bot is now ready to log in.');
        console.log('🚀 You can now close this and start the bot or push the changes.');

    } catch (e) {
        console.error('❌ Error:', e);
    } finally {
        await browser.close();
    }
})();
