const mailService = require('./mailer.service');
const { User } = require('../models/user.model');
const argon2 = require('argon2');

async function resetPassword(user, raw_password) {
	const password = await argon2.hash(raw_password);
	user.password = password;
	return user;
}

async function createUser(username, email, raw_password) {
	const password = await argon2.hash(raw_password);
	const user = new User({ username, email, password });

	return user.save();
}

async function registerUser(username, email, raw_password) {
	const user = await createUser(username, email, raw_password);
	mailService.sendConfirmationEmail(user.email);
	return user;
}

module.exports.createUser = createUser;
module.exports.registerUser = registerUser;

async function findUser(input) {
	const user = await User.findOne({
		$or: [{ email: input }, { username: input }]
	});
	return user;
}

async function checkPassword(userPass, inputPass) {
	match = await argon2.verify(userPass, inputPass);
	return match;
}

module.exports.findUser = findUser;
module.exports.checkPassword = checkPassword;
