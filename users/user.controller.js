const { User } = require('./models/user.model');
const passValidator = require('../config/password');
const validator = require('email-validator');
const userService = require('./services/user.service');

async function validateUserCreationInput(req, res, next) {
	req.checkBody('username', 'User name is required').notEmpty();
	if (validator.validate(req.body.username))
		return res.status(400).send({ msg: 'username can not be an email' });
	req.checkBody('email', 'Email is required').notEmpty();
	if (req.body.email) req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	if (!passValidator.validate(req.body.password))
		return res.status(400).send({ msg: 'weak password' });
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors);
	next();
}

const create = async (req, res) => {
	const { username, email, password } = req.body;

	try {
		const url = `http://${req.headers.host}/users/confirmation/`;
		await userService.registerUser(url, username, email, password);
		return res
			.status(201)
			.send({ msg: "success" });
	} catch (error) {
		if (error.name === 'MongoError' && error.code === 11000)
			return res.status(400).send({ msg: 'already used' });
		return res.status(400).send({ msg: error });
	}
};

const confirmRegistration = async (req, res) => {
	try {
		const user = await userService.findByRegistrationToken(req.params.token);
		if (!user) return res.status(400).send({ msg: 'invalid or expired' });
		user.registrationToken = undefined;
		user.registrationExpires = undefined;
		user.isConfirmed = true;
		user.save();
		return res.send({ msg: "success" });
	} catch (error) {
		return res.status(400).send({ msg: error });
	}
}

module.exports.validateUserCreationInput = validateUserCreationInput;
module.exports.create = create;
module.exports.confirmRegistration = confirmRegistration;


async function validateLoginInput(req, res, next) {
	req.checkBody('username', 'Email or username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors);
	next();
}

const login = async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await userService.findUser(username);
		const msg = "Something went wrong";
		if (!user) return res.status(400).send({ msg });
		const check = await userService.checkUser(user);
		if (check.value) {
			const match = await userService.checkPassword(user.password, password);
			if (match)
				return res.status(200).send({ token: user.getJWT() });
			return res.status(400).send(msg);
		}
		return res.status(400).send({ msg: check.msg });
	} catch (error) {
		return res.status(400).send({ msg: error });
	};
};

module.exports.validateLoginInput = validateLoginInput;
module.exports.login = login;


const resendConfirmation = (req, res) => {
	res.send('here');
}

module.exports.resendConfirmation = resendConfirmation;