const userServices = require('../services/user.services');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api.error');

class UserController {
    async getUsers(req, res, next) {
        try {
            const users = await userServices.getUsers();
            return res.json(users);
        } catch (e) {
            next(e);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await userServices.getUserById(req.params);
            return res.json(user);
        } catch (e) {
            next(e);
        }
    }

    async updateUser(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.path === 'email') {
                        next(ApiError.BadRequest('Почта введена не корректно'));
                    }
                    if (err.path === 'password') {
                        next(ApiError.BadRequest('Пароль должен состоять от 3 до 32 символов'));
                    }
                });
            }
            const newUser = await userServices.updateUser(req.body, req.files?.avatar);
            return res.json(newUser);
        } catch (e) {
            next(e);
        }
    }

    async deleteUser(req, res, next) {
        try {
            await userServices.deletedUser(req.params);
            return res.status(204);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new UserController();