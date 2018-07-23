const express = require('express');
// const passport = require('passport');
const UserController = require('../controllers/user.controller');
router = express.Router();

router.post('/', UserController.create);
router.post('/login', UserController.login);

module.exports = router;