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
		const user = await userService.registerUser(username, email, password);

		return res
			.status(201)
			.send({ id: user.id, email: user.email, username: user.username });
	} catch (error) {
		if (error.name === 'MongoError' && error.code === 11000)
			return res.status(400).send({ msg: 'already used' });
		return res.status(400).send({ msg: error.msg });
	}
};
module.exports.validateUserCreationInput = validateUserCreationInput;
module.exports.create = create;


async function validateLoginInput(req, res, next) {
	req.checkBody('username', 'Email or username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors);
	next();
}

const login = async (req, res) => {
	const {username, password } = req.body;
	try {
		const user = await userService.findUser(username);
		const msg = "Something went wrong";
		if (!user) return res.status(400).send({ msg });
		const match = await userService.checkPassword(user.password, password);
		if (match)
			return res
				.status(200)
				.send({ token: user.getJWT() });
		return res.status(400).send({ msg });
	} catch (error) {
		return res.send(error);
	};
};

module.exports.validateLoginInput = validateLoginInput;
module.exports.login = login;
