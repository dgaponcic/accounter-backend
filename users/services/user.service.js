const mailService = require('./mailer.service');
const { User } = require('../models/user.model');
const argon2 = require('argon2');

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
