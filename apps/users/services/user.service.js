const argon2 = require('argon2');
const mailService = require('./mailer.service');
const { User } = require('../models/user.model');

async function createUser(username, email, rawPassword) {
  // Create new user instance
  const user = await new User({ username, email });
  // hash the password
  await user.createPassword(rawPassword);
  // generate registration token
  await user.addRegistrationToken();
  return user.save();
}

async function registerUser(username, email, rawPassword) {
  // Create new user
  const user = await createUser(username, email, rawPassword);
  const url = `${process.env.registerURL}${user.tokens.registrationToken}`;
  // Send registration confirmation mail
  mailService.sendConfirmationEmail(url, user.email);
}

// Find the user by username
async function findUser(input) {
  const user = await User.findOne({
    $or: [{ email: input }, { username: input }],
  });
  return user;
}

// Check if user's password matches the input
async function checkPassword(userPass, inputPass) {
  const match = await argon2.verify(userPass, inputPass);
  return match;
}

// hash the password
async function resetPassword(user, rawPassword) {
  user.createPassword(rawPassword);
}

// Find by token and check if token is valid
async function findByRegistrationToken(token) {
  const user = await User.findOne({
    'tokens.registrationToken': token,
    'tokens.registrationExpires': { $gt: Date.now() },
  });
  return user;
}

// Check if the user is confirmed and active
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

async function forgotPassword(user) {
  // generate password token
  await user.createPasswordToken();
  const url = `${process.env.passwordResetURL}${user.tokens.resetPasswordToken}`;
  // Send password confirmation mail
  mailService.forgotPasswordEmail(url, user.email);
}

// Resend confirmation mail if the token expired
async function resendEmail(user) {
  await user.addRegistrationToken();
  const url = `${process.env.registerURL}${user.tokens.registrationToken}`;
  mailService.sendConfirmationEmail(url, user.email);
}

// Check if password token is valid
async function checkPasswordToken(resetPasswordToken) {
  const user = await User.findOne({
    'tokens.resetPasswordToken': resetPasswordToken,
    'tokens.resetPasswordExpires': { $gt: Date.now() },
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
