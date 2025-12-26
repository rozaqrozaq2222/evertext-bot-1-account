const fs = require('fs');
const CryptoJS = require("crypto-js");

// The SAME key used for the friend bot
const ENCRYPTION_KEY = "abcdefghijklmnopqrstuvwxyz123456";

// Load the Main Bot's DB (which I confirmed has encrypted codes)
const rawData = fs.readFileSync('../Evertale-Bot-Public-02/db.json', 'utf8');
const db = JSON.parse(rawData);

function decrypt(ciphertext) {
    if (!ciphertext) return "";
    // If it looks like a raw code (alphanumeric, short), verify?
    // But these start with U2F... so they are definitely encrypted.
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (!originalText) return ciphertext; // Fallback
        return originalText;
    } catch (e) {
        return ciphertext;
    }
}

// Decrypt all accounts
const decrypted = db.accounts.map(acc => {
    let rawCode = decrypt(acc.code);

    // Safety check: specific fixes for known accounts if needed, 
    // but the key should work for all if they came from the same source.

    return {
        ...acc,
        code: rawCode,
        userId: "791627940927635456" // Ensure User ID is set for all
    };
});

// Create the new structure matches Rust's expectations
const newDb = {
    accounts: decrypted,
    settings: db.settings || {
        scheduleStart: "22:00",
        scheduleEnd: "18:00",
        cookies: "",
        admins: []
    }
};

// Output to console so I can capture it
console.log(JSON.stringify(newDb, null, 2));

// Save to file for verification
fs.writeFileSync('main_bot_decrypted.json', JSON.stringify(newDb, null, 2));
