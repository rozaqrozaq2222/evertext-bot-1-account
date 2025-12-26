const fs = require('fs');
const CryptoJS = require("crypto-js");

const ENCRYPTION_KEY = "abcdefghijklmnopqrstuvwxyz123456";

// Read file
let rawData = fs.readFileSync('../Evertale-Bot-Public-02/db.json', 'utf8');

// Strip BOM if present
if (rawData.charCodeAt(0) === 0xFEFF) {
    rawData = rawData.slice(1);
}

const db = JSON.parse(rawData);

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

const decryptedAccts = db.accounts.map(acc => {
    let rawCode = decrypt(acc.code);

    // Explicit fix for 'fnel' if decryption fails or returns garbage
    if (acc.name === "fnel" && (rawCode === acc.code || rawCode.length > 20)) {
        rawCode = "WD7T91ACZV3W"; // Manually provided by user
    }

    return {
        ...acc,
        code: rawCode,
        userId: "791627940927635456"
    };
});

const newDb = {
    accounts: decryptedAccts,
    settings: db.settings
};

const output = JSON.stringify(newDb, null, 2);
console.log(output);
fs.writeFileSync('main_bot_decrypted.json', output);
