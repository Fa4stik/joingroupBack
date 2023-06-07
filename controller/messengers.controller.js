const msgServices = require('../services/messengers.service')

class MessengersController {
    async getPosts(req, res, next) {
        try {
            const response = await msgServices.getPosts(req.body);
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async getGroupInfo(req, res, next) {
        try {
            const groupsInfo = await msgServices.getGroupInfo(req.body);
            return res.json(groupsInfo);
        } catch (e) {
            next(e);
        }
    }

    async createPost(req, res, next) {
        try {
            const post = await msgServices.createPost(req.files?.picture, req.body);
            return res.json(post);
        } catch (e) {
            next(e);
        }
    }

    async setGroupInfo(req, res, next) {
        try {
            const group = await msgServices.setGroupInfo(req.files?.cover, req.files?.avatar, req.body);
            return res.json(group);
        } catch (e) {
            next(e);
        }
    }

    async analysisPosts(req, res, next) {
        try {
            const posts = await msgServices.analysisPosts(req.body);
            return res.json(posts);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new MessengersController();