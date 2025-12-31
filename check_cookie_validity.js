import axios from 'axios';
import fs from 'fs';

const TARGET_URL = 'https://evertext.sytes.net/';

(async () => {
    try {
        const cookies = JSON.parse(fs.readFileSync('./data/cookies.json'));
        // Construct cookie string
        const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

        console.log('[CookieCheck] Testing Cookie...');
        const response = await axios.get(TARGET_URL, {
            headers: {
                'Cookie': cookieHeader,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Referer': TARGET_URL
            }
        });

        if (response.data.includes('Logout')) {
            console.log('[CookieCheck] SUCCESS: Cookie is valid! Logged in as user.');
            const match = response.data.match(/Session ID:\s*([a-zA-Z0-9-]+)/);
            if (match) {
                console.log('[CookieCheck] Detected Session ID in HTML: ' + match[1]);
            }
        } else {
            console.log('[CookieCheck] FAILED: Cookie accepted but user NOT logged in.');
            console.log('Response excerpt:', response.data.substring(0, 500));
        }

    } catch (err) {
        console.error('[CookieCheck] Request failed:', err.message);
        if (err.response) {
            console.log('[CookieCheck] Status:', err.response.status);
        }
    }
})();
