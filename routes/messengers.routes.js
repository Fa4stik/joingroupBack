const Router = require('express');
const router = new Router();
const msgController = require('../controller/messengers.controller');

router.post('/getPosts', msgController.getPosts)
router.post('/getGroupInfo', msgController.getGroupInfo)
router.post('/createPost', msgController.createPost)
router.post('/setGroupInfo', msgController.setGroupInfo)
router.post('/analysisPosts', msgController.analysisPosts)

module.exports = router;