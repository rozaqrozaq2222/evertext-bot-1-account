import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

const TARGET_URL = 'https://evertext.sytes.net/';

(async () => {
    console.log('[SocketDebug] Launching browser...');
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized']
    });

    const page = (await browser.pages())[0];
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    console.log('[SocketDebug] Waiting for login...');
    try {
        await page.waitForFunction(() => {
            return document.body.innerText.includes('Logout') || document.body.innerText.includes('Session ID');
        }, { timeout: 300000 });
    } catch {
        console.log('Timeout waiting for login');
    }

    console.log('[SocketDebug] Attempting to open a SECOND socket from console...');
    const result = await page.evaluate(async () => {
        return new Promise((resolve) => {
            console.log('Creating test socket...');
            // @ts-ignore
            const s = io('https://evertext.sytes.net/', {
                transports: ['websocket'],
                reconnection: false
            });

            let logs = [];

            s.on('connect', () => {
                logs.push('Connected: ' + s.id);
                s.emit('start', { args: '' });
            });

            s.on('output', (data) => {
                logs.push('Output received: ' + data.data);
                // If we get output, it works!
                if (data.data.includes('Enter Command') || data.data.includes('Invalid session')) {
                    s.disconnect();
                    resolve({ success: true, logs });
                }
            });

            s.on('connect_error', (err) => {
                logs.push('Error: ' + err.message);
                resolve({ success: false, logs });
            });

            // Timeout
            setTimeout(() => {
                resolve({ success: false, logs: [...logs, 'Timeout waiting for response'] });
            }, 10000);
        });
    });

    console.log('[SocketDebug] Result:', result);

    // await browser.close();
})();
