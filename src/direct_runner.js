import { io } from 'socket.io-client';
import fs from 'fs';

const SOCKET_URL = 'https://evertext.sytes.net/';

export const runDirectSession = async (account, mode = 'daily') => {
    return new Promise((resolve) => {
        console.log(`[DirectRunner] Starting direct session for ${account.name}...`);

        // Load cookies
        let sessionCookie = '';
        try {
            if (fs.existsSync('./data/cookies.json')) {
                const cookies = JSON.parse(fs.readFileSync('./data/cookies.json'));
                const session = cookies.find(c => c.name === 'session');
                if (session) {
                    sessionCookie = `session=${session.value}`;
                }
            }
        } catch (err) {
            console.error('[DirectRunner] Failed to read cookies:', err.message);
        }

        if (!sessionCookie) {
            return resolve({ success: false, reason: 'No session cookie found. Login required.' });
        }

        const socket = io(SOCKET_URL, {
            extraHeaders: {
                Cookie: sessionCookie,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            reconnection: false,
            timeout: 30000
        });

        let outputBuffer = '';
        let phase = 'idle'; // idle -> start -> restore -> waiting -> cleanup -> done
        let timeoutTimer;

        const cleanup = (success, reason = '') => {
            clearTimeout(timeoutTimer);
            if (socket.connected) {
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
            console.log('[DirectRunner] Connected to Evertext WebSocket.');
            socket.emit('start', { args: '' });
            phase = 'start';
        });

        socket.on('connect_error', (err) => {
            console.error('[DirectRunner] Connection Error:', err.message);
            cleanup(false, `WebSocket Connection Error: ${err.message}`);
        });

        socket.on('output', async (data) => {
            const text = data.data || '';
            outputBuffer += text;

            // Log output lines for visibility
            if (text.includes('\n')) {
                const lines = text.split('\n');
                lines.forEach(l => {
                    if (l.trim()) console.log(`[Terminal] ${l.trim()}`);
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
