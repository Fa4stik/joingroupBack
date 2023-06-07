const authServices = require('../services/auth.services');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api.error');

class AuthController {
    async registration(req, res, next) {
        try {
            const errors = await validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.path === 'email') {
                        next(ApiError.BadRequest('Почта введена не корректно'));
                    }
                    if (err.path === 'password') {
                        next(ApiError.BadRequest('Пароль должен состоять от 3 до 32 символов'));
                    }
                })
                // next(ApiError.BadRequest('Error validation', errors.array()))
            }
            const userData = await authServices.createUser(req.body);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const userData = await authServices.login(req.body);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            await authServices.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const errors = await validationResult(req);
            if (!errors.isEmpty()) {
                errors.array().map(err => {
                    if (err.path === 'email') {
                        next(ApiError.BadRequest('Почта введена не корректно'));
                    }
                })
            }
            const resp = await authServices.resetPassword(req.body);
            return res.json(resp);
        } catch (e) {
            next(e);
        }
    }

    async activate(req, res, next) {
        try {
            await authServices.activate(req.params.link);
            res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies
            const userData = await authServices.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new AuthController();