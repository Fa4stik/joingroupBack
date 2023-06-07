const Router = require('express');
const router = new Router();
const instaController = require('../controller/insta.controller');

router.post('/getPosts', instaController.getPosts);
router.post('/getGroupInfo', instaController.getGroupInfo);
router.post('/createPost', instaController.createPost);
router.post('/setBiography', instaController.setBiography);

module.exports = router;