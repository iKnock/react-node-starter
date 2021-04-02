const Page = require('./helpers/page')

let page;

//automatically invoked before each test executed inside this file
beforeEach(async () => {
    //page is the proxy object we created called CustomPage in the helper folder
    page = await Page.build();
    //Navigate to app (put the protocol)
    await page.goto('http://localhost:3000');
})

//invoked after each test inside this file is executed
afterEach(async () => {
    await page.close();
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
    await page.login();

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
})