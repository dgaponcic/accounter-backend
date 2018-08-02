const express = require('express');
const passport = require('passport');
const UserController = require('./user.controller');
const PasswordController = require('./password.controller');
router = express.Router();

router.post(
	'/',
	UserController.validateUserCreationInput,
	UserController.create
);

router.get(
	'/confirmation/:token',
	UserController.confirmRegistration
)
router.post(
	'/login',
	UserController.validateLoginInput,
	UserController.login
);
router.get('/resend', UserController.resendConfirmation);
router.post(
	'/reset',
	passport.authenticate('jwt', { session: false }),
	PasswordController.validatePasswordReset,
	PasswordController.reset
);
router.post(
	'/forgot',
	PasswordController.validatePasswordForgot,
	PasswordController.forgot
);
router.get('/change/:token', PasswordController.check);
router.post('/change/:token', PasswordController.change);

module.exports = router;
