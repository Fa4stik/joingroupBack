const Router = require('express');
const router = new Router();
const authController = require('../controller/auth.controller');
const { body } = require('express-validator');

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 3, max: 32}),
    authController.registration
);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.put('/resetPassword',
    body('email').isEmail(),
    authController.resetPassword
);
router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);

module.exports = router;