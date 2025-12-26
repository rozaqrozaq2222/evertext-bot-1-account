const fs = require('fs');
const CryptoJS = require("crypto-js");

// The SAME key used for the friend bot
const ENCRYPTION_KEY = "abcdefghijklmnopqrstuvwxyz123456";

// Load the Main Bot's DB directly (using the path shown in cat output)
// It was printed in the previous step
const db = JSON.parse(fs.readFileSync('../Evertale-Bot-Public-02/db.json', 'utf8'));

function decrypt(ciphertext) {
    if (!ciphertext) return "";
    // If it's already short/uppercase alphanumeric, it's likely raw
    if (ciphertext.match(/^[A-Z0-9]{10,15}$/)) return ciphertext;

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText || originalText.length === 0) return ciphertext;
        return originalText;
    } catch (e) {
        return ciphertext;
    }
}

// Decrypt all accounts
const decryptedAccts = db.accounts.map(acc => {
    let rawCode = decrypt(acc.code);

    // Explicit manual fix for known failures if decryption yields nothing or garbage
    // You provided 'fnel' -> 'WD7T91ACZV3W'. Let's verify if my Key yields that.

    return {
        ...acc,
        code: rawCode,
        userId: "791627940927635456" // Ensure User ID is set for all
    };
});

const newDb = {
    accounts: decryptedAccts,
    settings: db.settings
};

console.log(JSON.stringify(newDb, null, 2));

// Save to disk for me to read
fs.writeFileSync('main_bot_decrypted.json', JSON.stringify(newDb, null, 2));
