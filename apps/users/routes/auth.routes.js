import express from 'express';
import passport from 'passport';
import * as UserController from '../controllers/user.controller';
import * as PasswordController from '../controllers/password.controller';

const router = express.Router();

router.post(
  '/',
  UserController.validateUserCreationInput,
  UserController.createUser,
);

router.get(
  '/confirmation/:token',
  UserController.confirmRegistration,
);

router.post(
  '/login',
  UserController.validateLoginInput,
  UserController.login,
);

router.get(
  '/resend/:token',
  UserController.resendConfirmation,
);

router.post(
  '/reset',
  passport.authenticate('jwt', { session: false }),
  PasswordController.validatePasswordReset,
  PasswordController.resetPassword,
);

router.post(
  '/forgot',
  PasswordController.validatePasswordForgot,
  PasswordController.forgotPassword,
);
router.get(
  '/change/:token',
  PasswordController.checkPassToken,
);
router.post(
  '/change/:token',
  PasswordController.validateResetPassword,
  PasswordController.changePassword,
);

// module.exports = router;

export default router;
