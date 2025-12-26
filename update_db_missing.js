
import fs from 'fs';

const missingAccounts = [
    {
        "id": "1766367174661",
        "name": "muzan",
        "encryptedCode": "U2FsdGVkX1/VRIQkCdd6a7jYwXCxImV1WOMyXrezWps=",
        "targetServer": "54",
        "lastRun": "2025-12-22T08:11:27.787Z",
        "status": "idle"
    },
    {
        "id": "1766367207741",
        "name": "nyx",
        "encryptedCode": "U2FsdGVkX1+H6bsMo603CWLjw8AChpVcz8tjSRWrM2A=",
        "targetServer": "e54",
        "lastRun": "2025-12-22T08:16:17.106Z",
        "status": "idle"
    },
    {
        "id": "1766367259887",
        "name": "Nyx",
        "encryptedCode": "U2FsdGVkX19iOMjpqDVoTv4pt6Aom/pfqDqYzHPnRas=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:21:05.437Z",
        "status": "idle"
    },
    {
        "id": "1766367302077",
        "name": "Élysian",
        "encryptedCode": "U2FsdGVkX18zngNqBRm3PHdrGnMmxJbG2Fy/cMBbhMQ=",
        "targetServer": "E- 54",
        "lastRun": "2025-12-22T08:25:53.782Z",
        "status": "idle"
    },
    {
        "id": "1766367350052",
        "name": "ROKURO",
        "encryptedCode": "U2FsdGVkX1+VT0P6YagQxdBz0pM5wM/nh9VTiyt0EEI=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:30:42.232Z",
        "status": "idle"
    },
    {
        "id": "1766367389217",
        "name": "RIKI",
        "encryptedCode": "U2FsdGVkX1+/BQ0oxMlKRRzc+ol75naW812ilEmbuM4=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:35:30.593Z",
        "status": "idle"
    },
    {
        "id": "1766367452070",
        "name": "nampa",
        "encryptedCode": "U2FsdGVkX19Fa+7StHA0+lWJ6AcvST/Q5hseQRPUCmo=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:40:19.027Z",
        "status": "idle"
    },
    {
        "id": "1766367638367",
        "name": "Eokja",
        "encryptedCode": "U2FsdGVkX1+u9gu6FA27cu0VE4u1ytWIcJr9qrzk3oXihB+yRZBaEeta5CLLp3uy",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:45:20.935Z",
        "status": "idle"
    },
    {
        "id": "1766367713526",
        "name": "major racist",
        "encryptedCode": "U2FsdGVkX1/xx23hAnsbVzYhJ53nlKOaHISUt9pXYEX0fv0yOW6viLl6DLOKXZ8v",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:50:08.990Z",
        "status": "idle"
    },
    {
        "id": "1766367824315",
        "name": "Zenith",
        "encryptedCode": "U2FsdGVkX1/fiUKadgjEjKtvjunGSEn1ZDQNMImCGGk=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:54:57.318Z",
        "status": "idle"
    },
    {
        "id": "1766367881694",
        "name": "ゆき",
        "encryptedCode": "U2FsdGVkX1+sRD9cmpjmfo1rVGPV1xAfHsRcO2SwDN4=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T08:59:47.532Z",
        "status": "idle"
    },
    {
        "id": "1766367911027",
        "name": "ユーキ",
        "encryptedCode": "U2FsdGVkX1+PzBcXh08/isEe4BdWCykrLj/5OZbFPJI=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T09:04:37.853Z",
        "status": "idle"
    },
    {
        "id": "1766367946619",
        "name": "kiwi",
        "encryptedCode": "U2FsdGVkX1/DsMG9tg0lPXUJbN7Mg3PHo2M6ybYI3w4=",
        "targetServer": "E- 54",
        "lastRun": "2025-12-22T09:09:29.439Z",
        "status": "idle"
    },
    {
        "id": "1766367969694",
        "name": "Ina",
        "encryptedCode": "U2FsdGVkX19v7OQFDaojD1BAWnOB4gkzGcGER28UW40=",
        "targetServer": "E-54",
        "lastRun": "2025-12-22T09:14:20.812Z",
        "status": "idle"
    },
    {
        "id": "1766406260506",
        "name": "UNKNOWN",
        "encryptedCode": "U2FsdGVkX1+25mY+ORXc8Wd2ACTpIIE0L/N6xdIopmA=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406302113",
        "name": "RAZ",
        "encryptedCode": "U2FsdGVkX19sz1S08VBhRCjwFNBqpgP5uh6JBbvKm9k=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406338965",
        "name": "Yoshi",
        "encryptedCode": "U2FsdGVkX18bo96LrzONP2DK4T+N/tRLYsSfbHqQvx8=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406382649",
        "name": "Primula Zen",
        "encryptedCode": "U2FsdGVkX18zw8dzajiQwoWtETFVHkXZS10O2VRYXx4=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406407048",
        "name": "AK",
        "encryptedCode": "U2FsdGVkX18KG496It+0tlXZZCK7W0/t9LaYkEjDVRs=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406436561",
        "name": "SS New",
        "encryptedCode": "U2FsdGVkX18xNjArjFQgZHbfArk2vDZ1rynRIJYo1D4=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406462397",
        "name": "Mayu ningsih",
        "encryptedCode": "U2FsdGVkX19Oa/afLmEbmJ6bkljdfr2YsVxXiEBwm7A=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406491140",
        "name": "R-Nagay",
        "encryptedCode": "U2FsdGVkX1/Z9zbasZX/2Pf889l+EhqdQSh0qbEHI88=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406520623",
        "name": "Burn",
        "encryptedCode": "U2FsdGVkX19EGEgfcp/tjIx0Tp6nVPUgo54PPa6vJPs=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406543107",
        "name": "Yoshi burn",
        "encryptedCode": "U2FsdGVkX18n8gNQ9fVHrr44SNBlFz5H127LiziDtdQ=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406562083",
        "name": "Leon Zender",
        "encryptedCode": "U2FsdGVkX1/wajqxf1wc7bMu3xK1iSWDb4o0Y3eHRso=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406609878",
        "name": "God",
        "encryptedCode": "U2FsdGVkX19kt9EK9g5J9gTuiAJLJHUej5MglyXfngI=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406630805",
        "name": "Main cherry",
        "encryptedCode": "U2FsdGVkX18HiA/8SwKJJHKW7GYKjFGo4a8i5ZFyqi8=",
        "targetServer": "E-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406680882",
        "name": "Shio",
        "encryptedCode": "U2FsdGVkX1+RJawX+GWcJQ0KlvXUYrSLerFBOWmaUlY=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    },
    {
        "id": "1766406739490",
        "name": "Beneadame",
        "encryptedCode": "U2FsdGVkX1/ctT4vNj8WQvcfgRYmuWjqpD1wyBcrsjc=",
        "targetServer": "e-54",
        "lastRun": null,
        "status": "idle"
    }
];

const dbPath = './data/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
let addedCount = 0;

missingAccounts.forEach(account => {
    // Check if account ID already exists to prevent duplicates
    if (!db.accounts.some(a => a.id === account.id)) {
        db.accounts.push(account);
        addedCount++;
    }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`Successfully added ${addedCount} missing accounts. Total Accounts: ${db.accounts.length}`);
