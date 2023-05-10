const express = require('express');
const router = express.Router({});

const UserInfoController = require('./user-info.controllers');
const CheckUuidMiddleware = require('../../middlewares/check-uuid.middleware');

router.post('/:id/', CheckUuidMiddleware ,UserInfoController.createUserInfo);

module.exports = router;