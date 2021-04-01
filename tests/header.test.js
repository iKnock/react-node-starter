const puppeteer = require('puppeteer');
const sessionFactory = require('./factories/sessionFactory');
const userFactory = require('./factories/userFactory')

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

    expect(url).toMatch(/accounts\.google\.com/);
})

test('When Signed In, show logout button', async () => {
    const user = await userFactory();
    const { session, signature } = sessionFactory(user);

    //setting the session string and signature to cookies    
    await page.setCookie({ name: 'session', value: session });
    await page.setCookie({ name: 'session.sig', value: signature });

    //refresh the page
    await page.goto('http://localhost:3000');
    //wait until this element is loaded to dom
    await page.waitFor('a[href="/auth/logout"]');
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
})