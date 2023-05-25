const Router = require('express');
const router = new Router();
const userController = require('../controller/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {body} = require("express-validator");

router.get('/user',
    authMiddleware,
    userController.getUsers
);
router.get('/user/:id',
    authMiddleware,
    userController.getUserById
);
router.put('/user',
    authMiddleware,
    body('email').isEmail(),
    body('password').custom((value, { req }) => {
        if (req.body.password) {
            return value.length >= 3 && value.length <= 32;
        }
        return true;
    }),
    userController.updateUser
);

router.delete('/user/:id',
    authMiddleware,
    userController.deleteUser
);

module.exports = router;