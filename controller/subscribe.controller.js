const subscribeServices = require('../services/subscribe.services');

class SubscribeController {
    async getSubscribes(req, res, next) {
        try {
            const subscribes = await subscribeServices.getSubscribes();
            return res.json(subscribes);
        } catch (e) {
            next(e);
        }
    }

    async getOneSubscribe(req, res, next) {
        try {
            const subscribe = await subscribeServices.getOneSubscribe(req.params.id);
            return res.json(subscribe);
        } catch (e) {
            next(e);
        }
    }

    async updateSubscribe(req, res, next) {
        try {
            const updateSubscribe = await subscribeServices.updateSubscribe(req.body);
            return res.json(updateSubscribe);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new SubscribeController();