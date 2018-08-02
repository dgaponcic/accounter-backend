const { User } = require('./models/user.model');
const argon2 = require('argon2');
var crypto = require('crypto');
const nodemailer = require('nodemailer');
const passValidator = require('../config/password');
const userService = require('./services/user.service');

async function validatePasswordReset(req, res, next) {
	req.checkBody("password", "password is required").notEmpty();
	req.checkBody("newPassword", "introduce new password").notEmpty();
	const errors = req.validationErrors()
	if (errors)
		return res.status(400).send(errors);
	if (!passValidator.validate(req.body.newPassword))
		return res.status(400).send({ status: 400, msg: "too weak password" });
	next();
}

const reset = async (req, res) => {
	const user = req.user;
	const { password, newPassword } = req.body;
	try {
		match = await userService.checkPassword(user.password, password);
		if (match) {
			await userService.resetPassword(user, newPassword);
			return res.send({ msg: "success" });
		}
		return res.status(400).send({ msg: "incorrect password" });
	} catch (error) {
		return res.status(400).send({ msg: error });
	}
};

module.exports.validatePasswordReset = validatePasswordReset;
module.exports.reset = reset;

async function validatePasswordForgot(req, res, next) {
	req.checkBody('username', 'Email or username is required').notEmpty();
	const errors = req.validationErrors();
	if (errors)
		return res.status(400).send(errors);
	next();
}

const forgot = async (req, res) => {
	try {
		username = req.body.username;
		user = await userService.findUser(username);
		if (!user)
			return res.status(400).send({ status: 400, msg: 'no user exists' });
		const url = `http://${req.headers.host}/users/change/`;
		await userService.forgotPassword(url, user)
		res.send({ msg: 'success' })
	} catch (error) {
		res.status(400).send(error);
	}
}

module.exports.validatePasswordForgot = validatePasswordForgot;
module.exports.forgot = forgot;

const check = (req, res) => {
	User.findOne({ resetPasswordToken: req.params.token }, (err, user) => {
		if (!user) return res.status(404).send();
		else if (user.resetPasswordExpires > Date.now() + 3600000)
			return res.status(400).send();
		else return res.status(200).send();
	});
};

module.exports.check = check;

const change = (req, res) => {
	User.findOne(
		{
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() }
		},
		(err, user) => {
			if (!user) {
				return res.status(400).send('expired or invalid');
			}
			req.checkBody('newPassword', 'password is required').notEmpty();
			let errors = req.validationErrors();
			if (errors) {
				res.status(400).send(errors);
			} else {
				if (!passValidator.validate(req.body.newPassword))
					return res
						.status(400)
						.send({ status: 400, msg: 'too weak password' });
				argon2.hash(req.body.newPassword).then(hash => {
					user.password = hash;
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;
					user.save(err => {
						if (err) return res.send(err);
						else return res.status(200).send({ status: 200, msg: 'success' });
					});
				});
			}
		}
	);
};

module.exports.change = change;
