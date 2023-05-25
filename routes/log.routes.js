const Router = require('express');
const router = new Router();
const logController = require('../controller/log.controller');

router.post('/log', logController.createAction);

module.exports = router;