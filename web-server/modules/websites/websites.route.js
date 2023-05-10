const express = require('express');
const router = express.Router({});

const WebsitesController = require('./websites.controller');
const CheckAccessTokenMiddleware = require('../../middlewares/check-access-token.middlewares');
const CheckWebsiteIdMiddleware = require('../../middlewares/check-website-id.middleware');

router.get('/', CheckAccessTokenMiddleware, WebsitesController.getWebsites);
router.get('/:websiteId/verify-domain-and-code-attached', CheckAccessTokenMiddleware, CheckWebsiteIdMiddleware, WebsitesController.checkDomainTrackingCode);

module.exports = router;
