
import { updateAccountStatus, getAccounts } from './src/db.js';

const run = async () => {
    const accounts = await getAccounts();
    const target = 'pan chi';
    const account = accounts.find(a => a.name === target);

    if (account) {
        console.log(`Resetting ${account.name} -> idle for re-test`);
        await updateAccountStatus(account.id, 'idle', null);
    }
};

run();
