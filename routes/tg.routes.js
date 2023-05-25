const Router = require('express');
const router = new Router();
const tgController = require('../controller/tg.controller');

router.post('/getPosts', tgController.getPosts)

module.exports = router;