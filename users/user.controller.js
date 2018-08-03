const { User } = require('./models/user.model');
const passValidator = require('../config/password');
const validator = require('email-validator');
const userService = require('./services/user.service');

async function validateUserCreationInput(req, res, next) {
	req.checkBody('username', 'User name is required.').notEmpty();
	req.checkBody('username', 'Too long ot too short username.').isLength({ min: 5, max: 50 })
	if (validator.validate(req.body.username))
		return res.status(400).send({ msg: 'Username can not be an email.' });
	req.checkBody('email', 'Email is required.').notEmpty();
	if (!validator.validate(req.body.email))
		return res.status(400).send({ msg: 'Invalid email.' })
	req.checkBody('password', 'Password is required.').notEmpty();
	if (!passValidator.validate(req.body.password))
		return res.status(400).send({ msg: 'Weak password.' });
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors);
	next();
}

async function create(req, res) {
	const { username, email, password } = req.body;

	try {
		const url = `http://${req.headers.host}/users/confirmation/`;
		await userService.registerUser(url, username, email, password);
		return res
			.status(201)
			.send({ msg: "success" });
	} catch (error) {
		if (error.name === 'MongoError' && error.code === 11000)
			return res.status(400).send({ msg: 'Already used.' });
		return res.status(400).send({ msg: error });
	}
};

async function confirmRegistration(req, res) {
	try {
		const user = await userService.findByRegistrationToken(req.params.token);
		if (!user) return res.status(400).send({ msg: 'Invalid or expired.' });
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
	req.checkBody('username', 'Email or username is required.').notEmpty();
	req.checkBody('password', 'Password is required.').notEmpty();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors);
	next();
}

async function login(req, res) {
	const { username, password } = req.body;
	try {
		const user = await userService.findUser(username);
		const msg = "Something went wrong.";
		if (!user) return res.status(400).send({ msg });
		const check = await userService.checkUser(user);
		if (check.value) {
			const match = await userService.checkPassword(user.password, password);
			if (match)
				return res.status(200).send({ token: user.getJWT() });
			return res.status(400).send({ msg });
		}
		return res.status(400).send({ msg: check.msg });
	} catch (error) {
		return res.status(400).send({ msg: error });
	};
};

module.exports.validateLoginInput = validateLoginInput;
module.exports.login = login;


async function resendConfirmation(req, res) {
	try {
		const user = await User.findOne({ registrationToken: req.params.token })
		if (!user) return res.status(400).send({ msg: 'Invalid' });
		const url = `http://${req.headers.host}/users/confirmation/`;
		await userService.resendEmail(url, user);
		return res.send({ msg: "success" });
	} catch (error) {
		return res.status(400).send({ msg: error });
	}
}

module.exports.resendConfirmation = resendConfirmation;