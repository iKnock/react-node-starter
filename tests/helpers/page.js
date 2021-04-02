const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory')

class CustomPage {

    constructor(page) {
        this.page = page;
    }
    //generate a new puppeteer page and instance of custome page, browser object and
    // combine the two with proxy 
    static async build() {
        //to launch browser object using puppeteer. which is always async        
        const browser = await puppeteer.launch({
            headless: false, //to see the UI of the browser
            executablePath: './node_modules/puppeteer/local-chromium/chrome-win/chrome.exe',
        });

        //to create a tab inside the browser we created
        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                //the order of the call in the following line (i.e close function on both browser and page so FCFS)
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    async login() {
        const user = await userFactory();
        const { session, signature } = sessionFactory(user);

        //setting the session string and signature to cookies    
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: signature });

        //refresh the page
        await this.page.goto('http://localhost:3000');
        //wait until this element is loaded to dom
        await this.page.waitFor('a[href="/auth/logout"]');
    }
}

module.exports = CustomPage;