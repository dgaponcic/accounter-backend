const argon2 = require('argon2');
const mailService = require('./mailer.service');
const { User } = require('../models/user.model');

async function createUser(username, email, rawPassword) {
  const password = await argon2.hash(rawPassword);
  const user = await new User({ username, email, password });
  return user.save();
}

async function registerUser(url, username, email, rawPassword) {
  const user = await createUser(username, email, rawPassword);
  await user.createRegistrationToken;
  url += user.registrationToken;
  mailService.sendConfirmationEmail(url, user.email);
}

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

async function resetPassword(user, rawPassword) {
  const password = await argon2.hash(rawPassword);
  user.password = password;
  return user.save();
}

async function findByRegistrationToken(token) {
  const user = await User.findOne({
    registrationToken: token,
    registrationExpires: { $gt: Date.now() },
  });
  return user;
}

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

async function forgotPassword(url, user) {
  await user.createPasswordToken;
  url += user.resetPasswordToken;
  mailService.forgotPasswordEmail(url, user.email);
}

async function resendEmail(url, user) {
  await user.createRegistrationToken;
  url += user.registrationToken;
  mailService.sendConfirmationEmail(url, user.email);
}

async function checkPasswordToken(resetPasswordToken) {
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });
  return user;
}

module.exports.createUser = createUser;
module.exports.registerUser = registerUser;
module.exports.findUser = findUser;
module.exports.checkPassword = checkPassword;
module.exports.resetPassword = resetPassword;
module.exports.findByRegistrationToken = findByRegistrationToken;
module.exports.checkUser = checkUser;
module.exports.forgotPassword = forgotPassword;
module.exports.resendEmail = resendEmail;
module.exports.checkPasswordToken = checkPasswordToken;
