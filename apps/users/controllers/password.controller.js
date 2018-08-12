const passValidator = require('../../../config/password');
const userService = require('../services/user.service');

// Validate the input for password reset
async function validatePasswordReset(req, res, next) {
  // Check if the required fields are not empty
  req.checkBody('password', 'Password is required.').notEmpty();
  req.checkBody('newPassword', 'Introduce new password.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  // Check the password strength
  if (!passValidator.validate(req.body.newPassword)) {
    return res.status(400).send({ status: 400, msg: 'Too weak password.' });
  }
  next();
}

async function resetPassword(req, res) {
  const { user } = req;
  const { password, newPassword } = req.body;
  try {
    // Check if user's password matches the input
    const match = await userService.checkPassword(user.password, password);
    // If matches reset password
    if (match) {
      await userService.resetPassword(user, newPassword);
      return res.send({ msg: 'success' });
    }
    return res.status(400).send({ msg: 'Incorrect password.' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}


function validatePasswordForgot(req, res, next) {
  req.checkBody('username', 'Email or username is required.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

async function forgotPass(req, res) {
  try {
    const { username } = req.body;
    // Find the user by username
    const user = await userService.findUser(username);
    if (!user) return res.status(400).send({ status: 400, msg: 'No user exists.' });
    // Call the forgot password service
    await userService.forgotPassword(user);
    return res.send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send(error);
  }
}

async function checkPassToken(req, res) {
  try {
    // Check if the registration token is valid
    const user = await userService.checkPasswordToken(req.params.token);
    if (user) return res.send({ msg: 'success' });
    return res.status(400).send({ msg: 'Invalid or expired.' });
  } catch (error) {
    return res.status(400).send(error);
  }
}

function validateResetPassword(req, res, next) {
  // Check if the new password is provided
  req.checkBody('newPassword', 'Password is required.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  // Check password strength
  if (!passValidator.validate(req.body.newPassword)) return res.status(400).send({ status: 400, msg: 'Too weak password.' });
  next();
}

async function changePassword(req, res) {
  try {
    // Check if the password reset token is valid
    const user = await userService.checkPasswordToken(req.params.token);
    if (!user) return res.status(400).send({ msg: 'Invalid or expired.' });
    // Call the reset password service
    await userService.resetPassword(user, req.body.newPassword);
    // Set password token fields to undefined
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.save();
    return res.status(200).send({ status: 200, msg: 'success' });
  } catch (error) {
    return res.status(400).send(error);
  }
}

module.exports.validatePasswordReset = validatePasswordReset;
module.exports.resetPass = resetPassword;
module.exports.validatePasswordForgot = validatePasswordForgot;
module.exports.forgotPass = forgotPass;
module.exports.checkPassToken = checkPassToken;
module.exports.validateResetPassword = validateResetPassword;
module.exports.changePassword = changePassword;
