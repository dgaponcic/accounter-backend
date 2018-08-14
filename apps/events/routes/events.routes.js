import express from 'express';
import passport from 'passport';
import * as EventController from '../controllers/event.controller';
import * as SpendingController from '../controllers/spending.controller';

const route = express.Router();

route.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  EventController.allEvents,
);

route.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  EventController.validateUser,
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
  EventController.validateUser,
  SpendingController.validateSpendingInput,
  SpendingController.createSpending,
);

// route.put(
//   '/:id/spending',
//   passport.authenticate('jwt', { session: false }),
//   EventController.validateUser,
//   SpendingController.editSpending,
// )

route.get(
  '/:id/spending/:spendingId',
  passport.authenticate('jwt', { session: false }),
  EventController.validateUser,
  SpendingController.getSpending,
)

export default route;
