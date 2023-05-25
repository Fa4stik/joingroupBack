const ApiError = require('../exceptions/api.error');
const tgServices = require('../services/tg.services');

class TgController {
    async getPosts(req, res, next) {
        try {
            const { api_id_tg, api_hash_tg, domaintg } = req.body;
            const posts = await tgServices.getPosts(api_id_tg, api_hash_tg, domaintg);
            return res.json(posts);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TgController();