const express = require('express');
const passport = require('passport');
const UserController = require('../controllers/user.controller');
router = express.Router();

router.post('/', UserController.create);
router.post('/login', UserController.login);
router.post('/reset', passport.authenticate('jwt', {session:false}), UserController.reset);
router.post('/forgot', UserController.forgot);

module.exports = router;