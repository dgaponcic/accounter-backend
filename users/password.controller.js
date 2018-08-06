const { User } = require('./models/user.model');
const argon2 = require('argon2');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
const passValidator = require('../config/password');
const userService = require('./services/user.service');

async function validatePasswordReset(req, res, next) {
	req.checkBody("password", "Password is required.").notEmpty();
	req.checkBody("newPassword", "Introduce new password.").notEmpty();
	const errors = req.validationErrors()
	if (errors)
		return res.status(400).send(errors);
	if (!passValidator.validate(req.body.newPassword))
		return res.status(400).send({ status: 400, msg: "Too weak password." });
	next();
}

async function resetPass(req, res) {
	const user = req.user;
	const { password, newPassword } = req.body;
	try {
		match = await userService.checkPassword(user.password, password);
		if (match) {
			await userService.resetPassword(user, newPassword);
			return res.send({ msg: "success" });
		}
		return res.status(400).send({ msg: "Incorrect password." });
	} catch (error) {
		return res.status(400).send({ msg: error });
	}
};

module.exports.validatePasswordReset = validatePasswordReset;
module.exports.resetPass = resetPass;

function validatePasswordForgot(req, res, next) {
	req.checkBody('username', 'Email or username is required.').notEmpty();
	const errors = req.validationErrors();
	if (errors)
		return res.status(400).send(errors);
	next();
}

async function forgotPass(req, res) {
	try {
		username = req.body.username;
		user = await userService.findUser(username);
		if (!user)
			return res.status(400).send({ status: 400, msg: 'No user exists.' });
		const url = `http://192.168.84.220:8080/#/forgot/confirmation/`;
		await userService.forgotPassword(url, user)
		return res.send({ msg: 'success' })
	} catch (error) {
		return res.status(400).send(error);
	}
}

module.exports.validatePasswordForgot = validatePasswordForgot;
module.exports.forgotPass = forgotPass;

async function checkPassToken(req, res) {
	try {
		user = await userService.checkPasswordToken(req.params.token);
		if (user)
			return res.send({ msg: 'success' });
		return res.status(400).send({ msg: 'Invalid or expired.' });
	} catch (error) {
		return res.status(400).send(error);
	}
};

module.exports.checkPassToken = checkPassToken;

function validateResetPassword(req, res, next) {
	req.checkBody('newPassword', 'Password is required.').notEmpty();
	const errors = req.validationErrors();
	if (errors)
		return res.status(400).send(errors);
	if (!passValidator.validate(req.body.newPassword))
		return res.status(400).send({ status: 400, msg: 'Too weak password.' });
	next();
}

async function changePassword(req, res) {
	try {
		const user = await userService.checkPasswordToken(req.params.token);
		if (!user)
			return res.status(400).send({ msg: 'Invalid or expired.' });
		await userService.resetPassword(user, req.body.newPassword);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		user.save();
		return res.status(200).send({ status: 200, msg: 'success' })
	} catch (error) {
		return res.status(400).send(error);
	}
};

module.exports.validateResetPassword = validateResetPassword;
module.exports.changePassword = changePassword;
