const express = require('express');
const passport = require('passport');
const UserController = require("./user.controller");
const PasswordController = require("./password.controller")
router = express.Router();

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/reset', passport.authenticate('jwt', { session: false }), PasswordController.reset);
router.post('/forgot', PasswordController.forgot);
router.get('/change/:token', PasswordController.check);
router.post('/change/:token', PasswordController.change);

module.exports = router;