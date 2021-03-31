const puppeteer = require('puppeteer');

let browser, page;

//automatically invoked before each test executed inside this file
beforeEach(async () => {
    //to launch browser object using puppeteer. which is always async 
    browser = await puppeteer.launch({
        headless: false, //to see the UI of the browser
        executablePath: './node_modules/puppeteer/local-chromium/chrome-win/chrome.exe',
    });

    //to create a tab inside the browser we created
    page = await browser.newPage();

    //Navigate to app (put the protocol)
    await page.goto('http://localhost:3000');
})

//invoked after each test inside this file is executed
afterEach(async () => {
    await browser.close();
});

test('Insure that the header has the correct text', async () => {
    //Use DOM selector to retrive the content of an element from the page
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);//puppeteer serialize this code, send it to chromium and deserialize the response
    //assert that the logo of the page is correct
    expect(text).toEqual('Blogster')
});

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    console.log(url)

    expect(url).toMatch(/accounts\.google\.com/);
})


test('When Signed In, show logout button', async () => {
    const id = '6028325d272a9543607a8630';
    const Buffer = require('safe-buffer').Buffer;
    const sessionObject = {
        passport: {
            user: id
        }
    }

    const sessionString = Buffer.from(JSON.stringify(sessionObject)).toString('base64');

    //generating session string and session signature
    const Keygrip = require('keygrip');
    const keys = require('../config/keys');
    const keygrip = new Keygrip([keys.cookieKey]);
    const signature = keygrip.sign('session=' + sessionString);

    //setting the session string and signature to cookies    
    await page.setCookie({ name: 'session', value: sessionString });
    await page.setCookie({ name: 'session.sig', value: signature });

    console.log(sessionString, signature);
})