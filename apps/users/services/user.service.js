const crypto = require('crypto');
const argon2 = require('argon2');
const mailService = require('./mailer.service');
const { User } = require('../models/user.model');

async function createUser(username, email, rawPassword) {
  const password = await argon2.hash(rawPassword);
  const user = await new User({ username, email, password });
  return user.save();
}

async function createRegistrationToken(user) {
  const buff = await crypto.randomBytes(30);
  user.registrationToken = buff.toString('hex');
  user.registrationExpires = Date.now() + 3600000;
  user.save();
}


async function registerUser(url, username, email, rawPassword) {
  const user = await createUser(username, email, rawPassword);
  await createRegistrationToken(user);
  url += user.registrationToken;
  mailService.sendConfirmationEmail(url, user.email);
}

module.exports.createUser = createUser;
module.exports.registerUser = registerUser;

async function findUser(input) {
  const user = await User.findOne({
    $or: [{ email: input }, { username: input }],
  });
  return user;
}

async function checkPassword(userPass, inputPass) {
  const match = await argon2.verify(userPass, inputPass);
  return match;
}

module.exports.findUser = findUser;
module.exports.checkPassword = checkPassword;

async function resetPassword(user, rawPassword) {
  const password = await argon2.hash(rawPassword);
  user.password = password;
  return user.save();
}

module.exports.resetPassword = resetPassword;

async function findByRegistrationToken(token) {
  const user = await User.findOne({
    registrationToken: token,
    registrationExpires: { $gt: Date.now() },
  });
  return user;
}

module.exports.findByRegistrationToken = findByRegistrationToken;

async function checkUser(user) {
  if (user.isConfirmed && user.isActive) {
    return {
      value: true,
      msg: 'success',
    };
  }
  if (!user.isConfirmed) {
    return {
      value: false,
      msg: 'User is not confirmed.',
    };
  }
  return {
    value: false,
    msg: 'User is not active.',
  };
}

module.exports.checkUser = checkUser;

async function createPasswordToken(user) {
  const buff = await crypto.randomBytes(30);
  user.resetPasswordToken = buff.toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000;
  user.save();
}

async function forgotPassword(url, user) {
  await createPasswordToken(user);
  url += user.resetPasswordToken;
  mailService.forgotPasswordEmail(url, user.email);
}


module.exports.forgotPassword = forgotPassword;

async function resendEmail(url, user) {
  await createRegistrationToken(user);
  url += user.registrationToken;
  mailService.sendConfirmationEmail(url, user.email);
}

module.exports.resendEmail = resendEmail;

async function checkPasswordToken(resetPasswordToken) {
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  return user;
}

module.exports.checkPasswordToken = checkPasswordToken;
