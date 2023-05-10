const express = require('express');
const router = express.Router({});

const AddToCartLogController = require('./log-add-to-cart-events.controller');

router.post('/', AddToCartLogController.createAddToCartLog);

module.exports = router;
