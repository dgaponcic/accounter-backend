const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/user.controller');
const PasswordController = require('../controllers/password.controller');
router = express.Router();

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/reset', passport.authenticate('jwt', {session:false}), UserController.reset);
router.post('/forgot', PasswordController.forgot);
router.post('/change/:token', PasswordController.change);

module.exports = router;