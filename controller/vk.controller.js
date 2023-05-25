const ApiError = require('../exceptions/api.error');
const VkServices = require('../services/vk.services');

class VkController {
    async createPost(req, res, next) {
        try {
            const vk = new VkServices(req.body);
            const postId = await vk.createPost(req.body);
            return res.json(postId);
        } catch (e) {
            next(e);
        }
    }

    async getPosts(req, res, next) {
        try {
            const vk = new VkServices(req.body);
            const response = await vk.getPosts(req.body);
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const vk = new VkServices(req.body);
            const response = await vk.getUserInfo(req.body);
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new VkController();