import dotenv from 'dotenv';
import validator from 'email-validator';
import passValidator from '../../../config/password';
import * as userService from '../services/user.service';
import * as passwordService from '../services/password.service';

dotenv.config();

// Validate the input
export async function validateUserCreationInput(req, res, next) {
  req.checkBody('username', 'User name is required.').notEmpty();
  req.checkBody('username', 'Too long ot too short username.').isLength({ min: 5, max: 50 });
  if (validator.validate(req.body.username)) return res.status(400).send({ msg: 'Username can not be an email.' });
  req.checkBody('email', 'Email is required.').notEmpty();
  if (!validator.validate(req.body.email)) return res.status(400).send({ msg: 'Invalid email.' });
  req.checkBody('password', 'Password is required.').notEmpty();
  // Check the strength of the password
  if (!passValidator.validate(req.body.password)) return res.status(400).send({ msg: 'Weak password.' });
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

// Create a new user
export async function createUser(req, res) {
  const { username, email, password } = req.body;
  try {
    // Call the register user service
    await userService.registerUser(username, email, password);
    return res.status(201).send({ msg: 'success' });
  } catch (error) {
    // Check if the user already exists
    if (error.name === 'MongoError' && error.code === 11000) return res.status(400).send({ msg: 'Already used.' });
    return res.status(400).send({ msg: error });
  }
}

export function send(req, res) {
  res.send('working');
}

// Confirm the user
export async function confirmRegistration(req, res) {
  const { token } = req.params;
  try {
    // Find the user by registration Token
    const user = await userService.findByToken(token, 'registrationToken');
    if (!user) return res.status(400).send({ msg: 'Invalid or expired.' });
    // Confirm the user
    user.isConfirmed = true;
    user.save();
    return res.send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

export async function validateLoginInput(req, res, next) {
  // Check if the required fields are not empty
  req.checkBody('username', 'Email or username is required.').notEmpty();
  req.checkBody('password', 'Password is required.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

export async function login(req, res) {
  const { username, password } = req.body;
  try {
    // Find the user by username
    const user = await userService.findUser(username);
    const msg = 'Something went wrong.';
    if (!user) return res.status(400).send({ msg });
    // Check if the user is confirmed and active
    const check = await userService.checkUser(user);
    if (check.value) {
      // Check if the input matches user's password
      const match = await passwordService.checkPassword(user.password, password);
      if (match) return res.status(200).send({ token: user.getJWT() });
      return res.status(400).send({ msg });
    }
    // Return error if the user is not confirmed or active
    return res.status(400).send({ msg: check.msg });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

// Resend registration confirmation if token expired
export async function resendConfirmation(req, res) {
  const { token } = req.params;
  try {
    // Find user by expired token
    const user = await userService.findByExpiredToken(token, 'registrationToken');
    if (!user) return res.status(404).send({ msg: 'Not found.' });
    // Resend confirmation email
    await userService.resendEmail(user);
    return res.send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

export async function addFriend(req, res) {
  const { id } = req.params;
  try {
    const addedUser = await userService.findUserById(id);
    const isAdded = await userService.addFriend(req.user, addedUser);
    if (addedUser.id === req.user.id) {
      return res.status(400).send({ msg: 'Can not add yourself in friends.' });
    }
    if (isAdded) return res.send({ msg: 'added' });
    return res.send({ msg: 'You are already friends' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function deleteFriend(req, res) {
  const { id } = req.params;
  try {
    const friend = await userService.findUserById(id);
    if (friend.id === req.user.id) {
      return res.status(400).send({ msg: 'Can not delete yourself.' });
    }
    const isFriend = await userService.checkIsFriend(req.user, friend);
    if (!isFriend) return res.send({ msg: 'You are not friends.' });
    await userService.deleteFriend(req.user, friend);
    return res.send({ msg: 'Deleted.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function allFriends(req, res) {
  const { page } = req.params || 1;
  try {
    const { friends, pages } = await userService.allFriends(req.user, page);
    if (friends.length) return res.send({ friends, pages });
    return res.send({ msg: 'No friends to show.' });
  } catch (error) {
    return res.status(400).send({ error });
  }
}
