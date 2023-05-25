const Router = require('express');
const router = new Router();
const subscribeController = require('../controller/subscribe.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.get('/subscribe',
    authMiddleware,
    subscribeController.getSubscribes
);
router.get('/subscribe/:id',
    authMiddleware,
    subscribeController.getOneSubscribe
);
router.put('/subscribe',
    authMiddleware,
    subscribeController.updateSubscribe
);

module.exports = router;