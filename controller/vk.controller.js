const ApiError = require('../exceptions/api.error');
const vkServices = require('../services/vk.services');
const { validationResult } = require('express-validator');

class VkController {
    async getPosts(req, res, next) {
        try {
            const response = await vkServices.getPosts(req.body);
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async getUserInfo(req, res, next) {
        try {
            const response = await vkServices.getUserInfo(req.body);
            return res.json(response);
        } catch (e) {
            next(e);
        }
    }

    async getFullGroupInfo(req, res, next) {
        try {
            const group = await vkServices.getFullGroupInfo(req.body);
            return res.json(group);
        } catch (e) {
            next(e);
        }
    }

    async createPost(req, res, next) {
        try {
            const postId = await vkServices.createPost(req.files?.picture, req.body);
            return res.json(postId);
        } catch (e) {
            next(e);
        }
    }

    async setGroupInfo(req, res, next) {
        try {
            const errors = await validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.path === 'phone') {
                        next(ApiError.BadRequest('Вы ввели некорректный номер телефона'));
                    }
                    if (err.path === 'description') {
                        next(ApiError.BadRequest('Максимальная длина описания 4000 символов'))
                    }
                })
            }
            const newInfoGroup = await vkServices.setGroupInfo(req.files?.cover, req.files?.avatar, req.body);
            return res.json(newInfoGroup);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new VkController();