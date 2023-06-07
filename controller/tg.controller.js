const ApiError = require('../exceptions/api.error');
const tgServices = require('../services/tg.services');

class TgController {
    async getMemberCount(req, res, next) {
        try {
            const channel = await tgServices.getMemberCount(req.body);
            return res.json(channel);
        } catch (e) {
            next(e);
        }
    }

    async getPosts(req, res, next) {
        try {
            const posts = await tgServices.getPosts(req.body);
            return res.json(posts);
        } catch (e) {
            next(e);
        }
    }

    async createPost(req, res, next) {
        try {
            const post = await tgServices.createPost(req.files?.picture, req.body);
            return res.json(post);
        } catch (e) {
            next(e);
        }
    }

    async setBiography(req, res, next) {
        try {
            const groupInfo = await tgServices.setBiography(req.files?.avatar, req.body);
            return res.json(groupInfo);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new TgController();