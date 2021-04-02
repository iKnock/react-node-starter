const puppeteer = require('puppeteer');

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
}

module.exports = CustomPage;