const puppeteer = require('puppeteer');

test('Adds two numbers', () => {
    const sum = 1 + 2;
    expect(sum).toEqual(3);
});


test('Launch a browser', async () => {
    //to launch browser object using puppeteer. which is always async 
    const browser = await puppeteer.launch({
        headless: false, //to see the UI of the browser
        executablePath: './node_modules/puppeteer/.local-chromium/win64-599821/chrome-win/chrome.exe',
    });

    //to create a tab inside the browser we created
    const page = await browser.newPage();
})