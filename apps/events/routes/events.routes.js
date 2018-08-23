import express from 'express';
import passport from 'passport';
import * as EventController from '../controllers/event.controller';
import * as SpendingController from '../controllers/spending.controller';
import catchAsyncErrors from '../../../settings/error.handler';

const route = express.Router();

route.get('/', passport.authenticate('jwt', { session: false }), EventController.allEvents);
route.get('/page/:page', passport.authenticate('jwt', { session: false }), EventController.allEvents);

route.get(
  '/search',
  passport.authenticate('jwt', { session: false }),
  EventController.searchEvents,
);

route.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  EventController.getEvent,
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
  catchAsyncErrors(EventController.validateUser),
  SpendingController.validateSpendingInput,
  SpendingController.createSpending,
);

route.get(
  '/:id/spendings',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.getSpendings,
);

route.get(
  '/:id/spendings/search',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.searchSpendings,
);

route.get(
  '/:id/spendings/page/:page',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.getSpendings,
);

route.get(
  '/:id/spending/:spendingId',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.getSpending,
);

route.get(
  '/:id/debts',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  EventController.getDebts,
);

route.put(
  '/:id/',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  EventController.validateEventCreation,
  EventController.updateEvent,
);

route.put(
  '/:id/spending/:spendingId',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.validateSpendingInput,
  SpendingController.updateSpending,
);

route.delete(
  '/:id/',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  EventController.checkEvent,
  EventController.deleteEvent,
);

route.delete(
  '/:id/spending/:spendingId',
  passport.authenticate('jwt', { session: false }),
  catchAsyncErrors(EventController.validateUser),
  SpendingController.deleteSpending,
);

export default route;
