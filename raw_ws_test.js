import WebSocket from 'ws';
import fs from 'fs';

const URL = 'wss://evertext.sytes.net/socket.io/?EIO=4&transport=websocket';

(async () => {
    // Load Headers
    const headers = JSON.parse(fs.readFileSync('./data/headers.json'));

    // Construct headers for WS
    const wsHeaders = {
        'Origin': 'https://evertext.sytes.net',
        'User-Agent': headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Cookie': headers.cookie || '',
        'Accept-Language': headers['accept-language'] || 'en-US,en;q=0.9',
        // 'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits' // ws handles this
    };

    console.log('[RawWS] Connecting with Cookie:', wsHeaders.Cookie.substring(0, 30) + '...');

    const ws = new WebSocket(URL, {
        headers: wsHeaders
    });

    ws.on('open', () => {
        console.log('[RawWS] Connected!');
        ws.send('40'); // Join Namespace
    });

    ws.on('message', (data) => {
        const str = data.toString();
        console.log('[RawWS] RX:', str);

        if (str.startsWith('0')) {
            // Handshake (OPEN)
            const payload = JSON.parse(str.substring(1));
            console.log('[RawWS] Handshake SID:', payload.sid);
        } else if (str === '40') {
            console.log('[RawWS] Namespace Joined? Wait for confirmation...');
        } else if (str.startsWith('42')) {
            // Event
            const eventBody = JSON.parse(str.substring(2));
            if (eventBody[0] === 'connection_success') {
                console.log('[RawWS] AUTH SUCCESS! SID:', eventBody[1].sessionID);
                console.log('[RawWS] Waiting 5s for session to settle...');
                setTimeout(() => {
                    console.log('[RawWS] Sending Start...');
                    ws.send('42' + JSON.stringify(['start', { args: '' }]));
                }, 5000);
            } else if (eventBody[0] === 'output') {
                console.log('[RawWS] OUTPUT:', eventBody[1].data);
            }
        }
    });

    ws.on('error', (err) => {
        console.error('[RawWS] Error:', err.message);
    });

    ws.on('close', (code, reason) => {
        console.log(`[RawWS] Closed: ${code} - ${reason}`);
    });

})();
