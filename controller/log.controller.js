const logServices = require('../services/log.services');

class LogController {
    async createAction(req, res, next) {
        try {
            const log = await logServices.createAction(req.body);
            return res.json(log);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new LogController();