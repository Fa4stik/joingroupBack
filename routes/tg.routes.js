const Router = require('express');
const router = new Router();
const tgController = require('../controller/tg.controller');

router.post('/getPosts', tgController.getPosts);
router.post('/getMemberCount', tgController.getMemberCount);
router.post('/createPost', tgController.createPost);
router.post('/setBiography', tgController.setBiography);


module.exports = router;