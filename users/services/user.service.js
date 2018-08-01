const mailService = require('./mailer.service');
const { User } = require('../models/user.model');
var crypto = require('crypto');
const argon2 = require('argon2');
 
async function createUser(username, email, raw_password) {
	const password = await argon2.hash(raw_password);
	const user = await new User({ username, email, password });
	return user.save();
}

async function registerUser(url,username, email, raw_password) {
	const user = await createUser(username, email, raw_password);
	await createRegistrationToken(user);
	url += user.registrationToken;
	mailService.sendConfirmationEmail(url, user.email);
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

async function resetPassword(user, raw_password) {
	const password = await argon2.hash(raw_password);
	user.password = password;
	return user.save();
}

module.exports.resetPassword = resetPassword;

async function createRegistrationToken(user) {
	const buff = await crypto.randomBytes(30);
	user.registrationToken = buff.toString('hex');
	user.registrationExpires = Date.now() + 3600000;
}

async function findByRegistrationToken(token, expirationDate) {
	const user = await User.findOne({ registrationToken: token });
	return user;	
}

module.exports.findByRegistrationToken = findByRegistrationToken;

async function checkUser(user) {
	if(user.isConfirmed === true && user.active === true)
		return true;
	return false;
}

module.exports.checkUser = checkUser;