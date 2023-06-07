const Router = require('express');
const router = new Router();
const VkController = require('../controller/vk.controller');
const { body } = require('express-validator');

router.post('/getPosts', VkController.getPosts);
router.post('/getUserInfo', VkController.getUserInfo);
router.post('/getFullGroupInfo', VkController.getFullGroupInfo);
router.post('/createPost', VkController.createPost);
router.post('/setGroupInfo',
    // body('phone').isMobilePhone(),
    body('description').isLength({max: 4000}),
    VkController.setGroupInfo);

module.exports = router;