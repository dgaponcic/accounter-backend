const express = require('express');
const passport = require('passport');
const EventController = require('../controllers/event.controller');
const SpendingController = require('../controllers/spending.controller');

const route = express.Router();

route.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  EventController.allEvents,
);

route.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  EventController.sendEvent,
);

route.post(
  '/creation',
  passport.authenticate('jwt', { session: false }),
  EventController.validateEventCreation,
  EventController.createEvent,
);

route.get(
  '/join/:token',
  passport.authenticate('jwt', { session: false }),
  EventController.joinEvent,
);

route.post(
  '/:id/add/spending',
  passport.authenticate('jwt', { session: false }),
  SpendingController.validateUser,
  SpendingController.validateSpendingInput,
  SpendingController.createSpending,
);

route.get(
  '/:id/delete/participant',
  passport.authenticate('jwt', { session: false }),
  EventController.validateUser,
  EventController.deleteParticipant,
);

module.exports = route;
