const instaServices = require('../services/insta.services')
const axios = require('axios');

class InstaController {
    async getPosts(req, res, next) {
        try {
            const posts = await instaServices.getPosts(req.body);
            return res.json(posts);
        } catch (e) {
            next(e);
        }
    }

    async getGroupInfo(req, res, next) {
        try {
            const group = await instaServices.getGroupInfo(req.body);
            return res.json(group)
        } catch (e) {

        }
    }

    async createPost(req, res, next) {
        try {
            const publishPhoto = await instaServices.createPost(req.files?.picture, req.body);
            return res.json(publishPhoto);
        } catch (e) {
            next(e);
        }
    }

    async setBiography(req, res, next) {
        try {
            const newProfile = await instaServices.setBiography(req.files?.avatar, req.body);
            return res.json(newProfile);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new InstaController();