import { io } from 'socket.io-client';
import fs from 'fs';

const SOCKET_URL = 'https://evertext.sytes.net/';

export const runDirectSession = async (account, mode = 'daily') => {
    return new Promise((resolve) => {
        console.log(`[DirectRunner] Starting direct session for ${account.name}...`);

        // Load cookies/headers
        let extraHeaders = {
            'Origin': 'https://evertext.sytes.net',
            'Referer': 'https://evertext.sytes.net/'
        };
        let sessionCookie = ''; // Kept for the check below
        let userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'; // Default user agent

        try {
            if (fs.existsSync('./data/headers.json')) {
                const headers = JSON.parse(fs.readFileSync('./data/headers.json'));
                // Copy all headers except connection-specific ones
                for (const [key, value] of Object.entries(headers)) {
                    if (!['content-length', 'connection', 'host', 'accept-encoding'].includes(key.toLowerCase())) {
                        extraHeaders[key] = value; // Preserve case or use proper casing? Request headers usually case-insensitive but specific casing helps
                        // Map lowercase keys to proper casing if needed? socket.io handles it.
                    }
                }
                sessionCookie = headers.cookie || ''; // Populate sessionCookie for the check
                if (headers['user-agent']) userAgent = headers['user-agent']; // Update userAgent if present
            } else if (fs.existsSync('./data/cookies.json')) {
                const cookies = JSON.parse(fs.readFileSync('./data/cookies.json'));
                const safeCookies = cookies.filter(c => !c.name.startsWith('__cf') && !c.name.startsWith('cf_'));
                sessionCookie = safeCookies.map(c => `${c.name}=${c.value}`).join('; ');
                extraHeaders['Cookie'] = sessionCookie;
                extraHeaders['User-Agent'] = userAgent; // Use default or previously set userAgent
            }
        } catch (err) {
            console.error('[DirectRunner] Failed to read cookies/headers:', err.message);
        }

        if (!sessionCookie) {
            return resolve({ success: false, reason: 'No session cookie found. Login required.' });
        }

        // Add hardcoded headers if not already present from headers.json
        if (!extraHeaders['Sec-Ch-Ua']) extraHeaders['Sec-Ch-Ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
        if (!extraHeaders['Sec-Ch-Ua-Mobile']) extraHeaders['Sec-Ch-Ua-Mobile'] = '?0';
        if (!extraHeaders['Sec-Ch-Ua-Platform']) extraHeaders['Sec-Ch-Ua-Platform'] = '"Windows"';
        if (!extraHeaders['Sec-Fetch-Site']) extraHeaders['Sec-Fetch-Site'] = 'same-origin';
        if (!extraHeaders['Sec-Fetch-Mode']) extraHeaders['Sec-Fetch-Mode'] = 'websocket';
        if (!extraHeaders['Sec-Fetch-Dest']) extraHeaders['Sec-Fetch-Dest'] = 'empty';
        if (!extraHeaders['Accept-Language']) extraHeaders['Accept-Language'] = 'en-US,en;q=0.9';
        if (!extraHeaders['Accept-Encoding']) extraHeaders['Accept-Encoding'] = 'gzip, deflate, br';
        if (!extraHeaders['Host']) extraHeaders['Host'] = 'evertext.sytes.net';
        if (!extraHeaders['Cookie']) extraHeaders['Cookie'] = sessionCookie; // Ensure cookie is set
        if (!extraHeaders['User-Agent']) extraHeaders['User-Agent'] = userAgent; // Ensure user agent is set

        const socket = io(SOCKET_URL, {
            extraHeaders: extraHeaders,
            // transports: ['websocket'], // Allow default (polling -> websocket) to see if polling auth works
            reconnection: false,
            timeout: 330000 // Increased timeout to 5.5 minutes (330000 ms)
        });

        let outputBuffer = '';
        let phase = 'idle'; // idle -> start -> restore -> waiting -> cleanup -> done
        let timeoutTimer;

        const cleanup = (success, reason = '') => {
            clearTimeout(timeoutTimer);
            if (socket.connected) {
                console.log(`[DirectRunner] Sending stop and disconnecting...`);
                socket.emit('stop');
                socket.disconnect();
            }
            resolve({ success, reason });
        };

        // Safety timeout (8 minutes total)
        timeoutTimer = setTimeout(() => {
            cleanup(false, 'Global Timeout reached');
        }, 480000);

        socket.on('connect', () => {
            console.log('[DirectRunner] Connected to Socket.io Server (Namespace joined).');
            console.log(`[DirectRunner] Transport used: ${socket.io.engine.transport.name}`);
        });

        socket.io.engine.on('upgrade', (transport) => {
            console.log(`[DirectRunner] Transport upgraded to: ${transport.name}`);
        });

        socket.on('connection_success', (data) => {
            console.log(`[DirectRunner] Connection Authenticated. Session ID: ${data.sessionID}`);
            setTimeout(() => {
                console.log('[DirectRunner] Sending start...');
                socket.emit('start', { args: '' });
                phase = 'start';
            }, 3500);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[DirectRunner] WebSocket Disconnected. Reason: ${reason}`);
            if (reason === 'io server disconnect') {
                console.error('[DirectRunner] Server kicked the connection. Cookie might be invalid or expired.');
            }
            if (!['done', 'idle', 'cleaning'].includes(phase) && !socket.connected) {
                resolve({ success: false, reason: `Disconnected: ${reason}` });
            }
        });

        socket.on('error', (err) => {
            console.error('[DirectRunner] Socket Error:', err);
        });

        socket.on('connection_success', (data) => {
            console.log(`[DirectRunner] Connection Authenticated. Session ID: ${data.sessionID}`);
            setTimeout(() => {
                console.log('[DirectRunner] Sending start...');
                socket.emit('start', { args: '' });
                phase = 'start';
            }, 1000);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[DirectRunner] WebSocket Disconnected. Reason: ${reason}`);
            // ... existing disconnect logic ...
            if (reason === 'io server disconnect') {
                // warning
            }
            if (!['done', 'idle', 'cleaning'].includes(phase) && !socket.connected) {
                resolve({ success: false, reason: `Disconnected: ${reason}` });
            }
        });

        // ... error handler ...

        socket.on('output', async (data) => {
            const text = data.data || '';
            outputBuffer += text;

            // Log output lines for visibility
            if (text.includes('\n') || text.includes('\r')) {
                const lines = text.split(/[\r\n]+/);
                lines.forEach(l => {
                    const clean = l.trim();
                    if (clean) console.log(`[Terminal] ${clean}`);

                    // Detect Auth Errors
                    if (clean.includes('You are not logged in') || clean.includes('Invalid session')) {
                        console.error('[DirectRunner] AUTH FAILURE DETECTED from Server Output.');
                        cleanup(false, 'Auth Failure: ' + clean);
                    }
                });
            }

            // Phase logic
            if (phase === 'start' && outputBuffer.includes('Enter Command to use :')) {
                console.log('[DirectRunner] Prompt detected. Sending "d"...');
                socket.emit('input', { input: 'd' });
                phase = 'restore';
                outputBuffer = '';
            }
            else if (phase === 'restore' && outputBuffer.includes('Enter Restore code of Your Account')) {
                console.log('[DirectRunner] Sending restore code...');
                socket.emit('input', { input: account.code });
                phase = 'waiting_login';
                outputBuffer = '';
            }
            else if (phase === 'waiting_login') {
                if (outputBuffer.includes('Either Zigza error') || outputBuffer.includes('Incorrect Restore Code')) {
                    cleanup(false, 'Zigza Error or Invalid Code');
                }
                else if (outputBuffer.includes('Which acc u want to Login')) {
                    console.log('[DirectRunner] Server selection needed. Sending selection...');
                    // Logic to find targetServer index could go here, but for simple fix we send target or '1'
                    socket.emit('input', { input: account.targetServer || '1' });
                    phase = 'processing';
                    outputBuffer = '';
                }
                else if (outputBuffer.includes('Login / Relog Successfull')) {
                    console.log('[DirectRunner] Login success. Starting wait timer...');
                    phase = 'processing';
                    outputBuffer = '';
                }
            }

            if (phase === 'processing') {
                // Wait 4 minutes for dailies
                phase = 'wait_period';
                console.log('[DirectRunner] Waiting 4 minutes for dailies to complete...');
                setTimeout(() => {
                    console.log('[DirectRunner] Wait complete. Running cleanup commands...');
                    runCleanupSequence();
                }, 240000);
            }
        });

        const runCleanupSequence = async () => {
            const commands = mode === 'handout' ? ["ho", "quit", "y"] : ["y", "auto", "y", "3", "1", "y", "quit", "y"];

            for (const cmd of commands) {
                console.log(`[DirectRunner] Sending cleanup: ${cmd}`);
                socket.emit('input', { input: cmd });
                await new Promise(r => setTimeout(r, 1000));
            }

            console.log('[DirectRunner] Sequence complete. Closing in 90s...');
            setTimeout(() => {
                cleanup(true);
            }, 90000);
        };

        socket.on('disconnect', () => {
            console.log('[DirectRunner] WebSocket Disconnected.');
        });
    });
};
