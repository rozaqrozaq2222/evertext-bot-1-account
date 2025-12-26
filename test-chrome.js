import puppeteer from 'puppeteer-core';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      headless: false
    });

    console.log('CHROME BERHASIL DIBUKA');
    await new Promise(r => setTimeout(r, 10000));
    await browser.close();
  } catch (e) {
    console.error('GAGAL:', e.message);
  }
})();
