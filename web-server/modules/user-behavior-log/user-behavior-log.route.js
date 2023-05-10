const express = require('express');
const router = express.Router({});

const UserBehaviorLogController = require('./user-behavior-log.controller');

router.post('/log', UserBehaviorLogController.addLog);
router.put('/log/:id/time-unload', UserBehaviorLogController.updateTimeUnLoad);
router.put('/log/:id/scroll-percentage', UserBehaviorLogController.updateScrollPercentage);

module.exports = router;