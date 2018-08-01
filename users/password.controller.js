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
		return res.status(400).send({msg: error});
	}
};

module.exports.validatePasswordReset = validatePasswordReset;
module.exports.reset = reset;

const forgot = (req, res) => {
	req.checkBody('input', 'Email or username is required').notEmpty();
	let errors = req.validationErrors();
	if (errors) {
		res.status(400).send(errors);
	} else {
		var transporter = nodemailer.createTransport({
			host: 'localhost',
			port: 1025
		});
		User.findOne(
			{
				$or: [{ email: req.body.input }, { username: req.body.input }]
			},
			(err, user) => {
				if (err) return res.status(500).send(err);
				if (!user)
					return res.status(400).send({ status: 400, msg: 'no user exists' });
				crypto.randomBytes(30, (err, buf) => {
					user.resetPasswordToken = buf.toString('hex');
					user.resetPasswordExpires = Date.now() + 3600000;
					user.save(err => {
						if (err) return res.send(err);
						else {
							const changeURL = `http://${req.headers.host}/users/change/${
								user.resetPasswordToken
								}`;
							const mailOptions = {
								from: 'support@accounter.com',
								to: user.email,
								subject: 'Password Change',
								html: `follow this link <a href=${changeURL}>${changeURL}</a>`
							};
							transporter.sendMail(mailOptions, (err, info) => {
								if (err) res.send(err);
								else return res.send({ status: 200, msg: 'success', info });
							});
						}
					});
				});
			}
		);
	}
};
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
