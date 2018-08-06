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
router.get(
	'/resend/:token',
	UserController.resendConfirmation
);
router.post(
	'/reset',
	passport.authenticate('jwt', { session: false }),
	PasswordController.validatePasswordReset,
	PasswordController.resetPass
);
router.post(
	'/forgot',
	PasswordController.validatePasswordForgot,
	PasswordController.forgotPass
);
router.get(
	'/change/:token',
	PasswordController.checkPassToken
);
router.post(
	'/change/:token',
	PasswordController.validateResetPassword,
	PasswordController.changePassword
);

module.exports = router;
