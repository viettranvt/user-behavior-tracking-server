const express = require('express');
const router = express.Router({});

const ReportsController = require('./reports.controller');
const CheckAccessTokenMiddleware = require('../../middlewares/check-access-token.middlewares');
const CheckWebsiteIdMiddleware = require('../../middlewares/check-website-id.middleware');

router.get('/:websiteId/user-behavior-log/statistic', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getLogChart);
router.get('/:websiteId/user-behavior-log/user-statistic', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getUserChart);
router.get('/:websiteId/user-behavior-log/user', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getUserLog);
router.get('/:websiteId/user-behavior-log/user/:uuid', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getUserDetail);
router.get('/:websiteId/user-behavior-log/', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getLog);
router.get('/:websiteId/user-behavior-log/:ip', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware,  ReportsController.getIpDetail);

module.exports = router;
