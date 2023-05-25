const Router = require('express');
const router = new Router();
const VkController = require('../controller/vk.controller');

router.post('/createPost', VkController.createPost);
router.post('/getPosts', VkController.getPosts);
router.post('/getUserInfo', VkController.getUserInfo);

module.exports = router;