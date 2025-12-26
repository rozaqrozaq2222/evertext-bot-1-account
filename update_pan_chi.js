
import { updateAccountStatus, getAccounts } from './src/db.js';

const run = async () => {
    const accounts = await getAccounts();
    const target = 'pan chi';
    const account = accounts.find(a => a.name === target);

    if (account) {
        console.log(`Updating ${account.name} -> success`);
        await updateAccountStatus(account.id, 'success', new Date().toISOString());
    } else {
        console.log(`Account ${target} not found.`);
    }
};

run();
