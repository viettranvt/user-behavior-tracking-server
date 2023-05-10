const express = require('express');
const router = express.Router({});

const UserController = require('./user.controller');
const CheckAccessTokenMiddlewares = require('../../middlewares/check-access-token.middlewares');

router.post('/login', UserController.login);
router.get('/', CheckAccessTokenMiddlewares, UserController.getUserInfo);
router.put('/password', CheckAccessTokenMiddlewares, UserController.updatePassword);

module.exports = router;
