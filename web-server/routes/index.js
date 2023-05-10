const express = require('express');
const router = express.Router({});

router.use('/users', require('../modules/user/user.route'));
router.use('/websites', require('../modules/websites/websites.route'));
router.use('/user-behaviors', require('../modules/user-behavior-log/user-behavior-log.route'));
router.use('/reports', require('../modules/reports/reports.route'));
router.use('/user-info', require('../modules/user-info/user-info.route'));
router.use('/log/add-to-cart', require('../modules/log-add-to-cart-events/log-add-to-cart-events.route'));
router.use('/log/search', require('../modules/search-events-log/search-events-log.route'));

module.exports = router;
