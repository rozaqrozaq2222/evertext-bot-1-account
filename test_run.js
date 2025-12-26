
import { executeSession } from './src/manager.js';
import { getAccounts } from './src/db.js';
import dotenv from 'dotenv';
dotenv.config();
const run = async () => {
    const accounts = await getAccounts();
    const targetName = 'pan chi';
    const account = accounts.find(a => a.name === targetName);
    console.log(`Testing run for account: ${account.name}`);
    await executeSession(account.id);
};
run();
