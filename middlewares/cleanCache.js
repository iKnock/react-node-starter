const { clearHash } = require('../services/cache')

module.exports = async (req, res, next) => {
    await next();//this makes the route handler run first and wait until finish then after its done

    //clear cache
    clearHash(req.user.id)
}