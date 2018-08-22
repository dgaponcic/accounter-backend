import * as mailService from './mailer.service';
import User from '../models/user.model';

export async function createUser(username, email, rawPassword) {
  // Create new user instance
  const user = await new User({ username, email });
  // hash the password
  await user.createPassword(rawPassword);
  // generate registration token
  await user.addToken('registrationToken');
  return user.save();
}

export async function findUserById(id) {
  const user = await User.findById(id);
  return user;
}

export async function findToken(user, type) {
  // Filter tokens by their type and expiration date
  const tokens = await user.tokens.filter(tokenObject => tokenObject.type === type
    && tokenObject.expiresAt >= Date.now());
  if (!tokens) return null;
  // return the token with max expiration date
  const maxValue = tokens.reduce((prev, current) => {
    return (prev.expiresAt > current.expiresAt) ? prev : current;
  });
  return maxValue.token;
}

export async function registerUser(username, email, rawPassword) {
  // Create new user
  const user = await createUser(username, email, rawPassword);
  const token = await findToken(user, 'registrationToken');
  if (token) {
    const url = `${process.env.registerURL}${token}`;
    // Send registration confirmation mail
    mailService.sendConfirmationEmail(url, user.email);
  }
}

// Find the user by username
export async function findUser(input) {
  const user = await User.findOne({
    $or: [{ email: input }, { username: input }],
  });
  return user;
}

// Find by token and check if token is valid
export async function findByToken(token, type) {
  const user = await User.findOne({
    tokens: {
      $elemMatch: {
        type,
        token,
        expiresAt: { $gt: Date.now() },
      },
    },
  });
  return user;
}

export async function findByExpiredToken(token, type) {
  const user = await User.findOne({
    tokens: { $elemMatch: { type, token } },
  });
  return user;
}

// Check if the user is confirmed and active
export async function checkUser(user) {
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

export async function forgotPassword(user) {
  // generate password token
  await user.addToken('passwordToken');
  const token = await findToken(user, 'passwordToken');
  const url = `${process.env.passwordResetURL}${token}`;
  // Send password confirmation mail
  mailService.forgotPasswordEmail(url, user.email);
}

// Resend confirmation mail if the token expired
export async function resendEmail(user) {
  await user.addToken('registrationToken');
  const token = findToken(user, 'registrationToken');
  const url = `${process.env.registerURL}${token}`;
  mailService.sendConfirmationEmail(url, user.email);
}
