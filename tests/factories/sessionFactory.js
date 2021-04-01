const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');
const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = (user) => {
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    }

    //generating session string and session signature
    const session = Buffer.from(JSON.stringify(sessionObject)).toString('base64');
    const signature = keygrip.sign('session=' + session);

    return { session, signature }
}