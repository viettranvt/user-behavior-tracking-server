const express = require('express');
const router = express.Router({});

const SearchLogController = require('./search-events-log.controller');

router.post('/', SearchLogController.createSearchLog);

module.exports = router;
