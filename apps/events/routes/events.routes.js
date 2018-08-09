const express = require('express');
const passport = require('passport');
const EventController = require('../controllers/event.controller');
const SpendingController = require('../controllers/spending.controller');

const route = express.Router();

route.post(
  '/creation',
  passport.authenticate('jwt', { session: false }),
  EventController.validateEventCreation,
  EventController.createEvent,
);

route.post(
  '/:id/add/spending',
  passport.authenticate('jwt', { session: false }),
  SpendingController.validateSpendingInput,
  SpendingController.createSpending,
);

module.exports = route;
