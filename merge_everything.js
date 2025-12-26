
import fs from 'fs';
import path from 'path';
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvwxyz123456';

const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

const paths = [
    'C:/Users/USER/Documents/bot discord/RUST_BACKUP/Evertale-Bot-Public-02/db.json',
    'C:/Users/USER/Documents/bot discord/RUST_BACKUP/friendbot-rust/db.json',
    'C:/Users/USER/Documents/bot discord/Evertext-Discord-Bot/Friend_Bot_Export (2)/Friend_Bot_Export/data/db.json',
    'C:/Users/USER/Documents/bot discord/Evertext-Discord-Bot/data/db.json'
];

async function merge() {
    let allAccounts = [];
    let settings = {};

    for (const p of paths) {
        if (!fs.existsSync(p)) {
            console.log(`Skipping missing file: ${p}`);
            continue;
        }

        try {
            const data = JSON.parse(fs.readFileSync(p, 'utf8'));
            const accounts = data.accounts || [];

            // If settings haven't been set, take them from the last valid file (usually the active one)
            if (data.settings && Object.keys(data.settings).length > 0) {
                settings = data.settings;
            }

            for (const acc of accounts) {
                // Determine the raw code
                let rawCode = '';
                if (acc.code) {
                    rawCode = acc.code.split('\n')[0].trim(); // Handle multiline codes in some DBs
                } else if (acc.encryptedCode) {
                    try {
                        rawCode = decrypt(acc.encryptedCode);
                    } catch (e) {
                        console.error(`Failed to decrypt code for ${acc.name} in ${p}`);
                        continue;
                    }
                }

                if (!rawCode) continue;

                // Check if account already exists in our merged list
                const existingIdx = allAccounts.findIndex(a => a.name.toLowerCase() === acc.name.toLowerCase() || a.rawCode === rawCode);

                if (existingIdx === -1) {
                    allAccounts.push({
                        ...acc,
                        rawCode: rawCode,
                        encryptedCode: encrypt(rawCode)
                    });
                } else {
                    // Update existing if new one has more info (like lastRun)
                    if (acc.lastRun && (!allAccounts[existingIdx].lastRun || new Date(acc.lastRun) > new Date(allAccounts[existingIdx].lastRun))) {
                        allAccounts[existingIdx].lastRun = acc.lastRun;
                        allAccounts[existingIdx].status = acc.status;
                    }
                    // Keep the union of ping/handout settings
                    if (acc.pingEnabled) allAccounts[existingIdx].pingEnabled = true;
                    if (acc.handoutEnabled) allAccounts[existingIdx].handoutEnabled = true;
                }
            }
        } catch (err) {
            console.error(`Error processing ${p}:`, err);
        }
    }

    // Clean up temporary field and ensure encryptedCode is present
    const finalAccounts = allAccounts.map(({ rawCode, code, ...rest }) => ({
        ...rest,
        // encryptedCode already set in loop
    }));

    const finalDb = {
        accounts: finalAccounts,
        settings: settings
    };

    fs.writeFileSync('C:/Users/USER/Documents/bot discord/Evertext-Discord-Bot/data/db.json', JSON.stringify(finalDb, null, 2));
    console.log(`Successfully merged ${finalAccounts.length} accounts into Master DB.`);
}

merge();
