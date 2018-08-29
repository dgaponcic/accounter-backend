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

router.get('/confirmation/:token', UserController.confirmRegistration);

router.post('/login', UserController.validateLoginInput, UserController.login);

router.get('/resend/:token', UserController.resendConfirmation);

router.get(
  '/add/friend/:id',
  passport.authenticate('jwt', { session: false }),
  UserController.addFriend,
);

router.delete(
  '/friends/:id',
  passport.authenticate('jwt', { session: false }),
  UserController.deleteFriend,
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
router.get('/change/:token', PasswordController.checkPasswordToken);
router.post(
  '/change/:token',
  PasswordController.validateResetPassword,
  PasswordController.changePassword,
);

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google'),
  UserController.send,
);

export default router;
