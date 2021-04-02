const Page = require('./helpers/page')

let page;

//automatically invoked before each test executed inside this file
beforeEach(async () => {
    //page is the proxy object we created called CustomPage in the helper folder
    page = await Page.build();
    await page.goto('http://localhost:3000');//Navigate to app (put the protocol)
})

//invoked after each test inside this file is executed
afterEach(async () => {
    await page.close();
});

test('Insure that the header has the correct text', async () => {
    //Use DOM selector to retrive the content of an element from the page
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster')
});

test('Clicking login starts oauth flow', async () => {
    await page.click('.right a');
    const url = await page.url();
    expect(url).toMatch(/accounts\.google\.com/);
})

test('When Signed In, show logout button', async () => {
    await page.login();
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
})