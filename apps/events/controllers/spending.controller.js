import * as eventService from '../services/event.service';
import * as spendingService from '../services/spending.service';

export async function validateSpendingInput(req, res, next) {
  // Check the input
  req.checkBody('name', 'Name is required.').notEmpty();
  if (req.body.name) {
    req.checkBody('name', 'Too short name').isLength({ min: 3 });
  }
  req.checkBody('name', 'Too long name.').isLength({ max: 30 });
  req.checkBody('price', 'Price is required.').notEmpty();
  if (req.body.price) {
    req.checkBody('price', 'Price is not a number or is negative.').isFloat({ gt: 0 });
  }
  req.checkBody('payers', 'Introduce the payers.').notEmpty();
  req.checkBody('consumers', 'Introduce the consumers.').notEmpty();
  req.checkBody('type', 'Introduce the type.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

export async function createSpending(req, res) {
  const { type, name, price, payers, consumers } = req.body;
  const { id } = req.params;
  try {
    // Find event by id
    if (type === 'payment') {
      const checkUser = eventService.checkUser(payers[0], consumers[0], req.user);
      if (!checkUser) {
        return res.status(400).send({ msg: 'You are not a participant to this payment.' });
      }
    }
    const event = await eventService.findEventById(id);
    if (!event) return res.status(404).send({ msg: 'Not Found.' });
    // Add new spending to event
    const response = await eventService.addNewSpending(
      type,
      event,
      name,
      price,
      payers,
      consumers,
      req.user,
    );
    if (!response.created) return res.status(400).send({ msg: 'Invalid participants' });
    return res.status(201).send({ msg: 'success' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send(error);
  }
}

export async function getSpending(req, res) {
  const { spendingId, id } = req.params;
  try {
    // Find event by id
    const event = await eventService.findEventByIdAndPopulate(id, 'spendings');
    // Find spending by id
    if (!event) return res.status(404).send({ msg: 'Not Found.' });
    const spending = await spendingService.findSpendingByIdAndPopulate(
      spendingId,
    );
    // Check if the spending belongs to event
    const check = spendingService.checkSpending(event, spending);
    if (!check) return res.status(404).send({ msg: 'Not Found.' });
    return res.send({ msg: 'success', spending });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function getSpendings(req, res) {
  const { id } = req.params;
  const { page } = req.params || 1;
  try {
    // Find event by id
    const event = await eventService.findEventById(id);
    // Find all spendings of that event
    const results = await spendingService.getSpendings(event, page);
    const { spendings, pages } = results;
    if (!spendings.length) return res.send({ msg: 'No spendings to show.' });
    return res.send({ msg: 'success', spendings, pages });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function updateSpending(req, res) {
  const { id, spendingId } = req.params;
  const spending = req.body;
  try {
    const event = await eventService.findEventById(id);
    const oldSpending = await spendingService.findSpendingById(
      spendingId,
    );
    const check = spendingService.checkSpending(event, oldSpending);
    if (!check) return res.status(404).send({ msg: 'Not Found.' });
    await spendingService.updateSpending(spending, oldSpending, req.user, event);
    return res.send({ updated: true });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function deleteSpending(req, res) {
  const { id, spendingId } = req.params;
  try {
    const event = await eventService.findEventById(id);
    const spending = await spendingService.findSpendingById(spendingId);
    const check = spendingService.checkSpending(event, spending);
    if (!check) return res.status(404).send({ msg: 'Not Found.' });
    await spendingService.deleteSpending(req.user, spending, event);
    return res.send({ msg: 'Deleted.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function searchSpendings(req, res) {
  const { id } = req.params;
  const { query } = req.query;
  try {
    const event = await eventService.findEventById(id);
    const spendings = await spendingService.searchSpendings(event, query);
    if (spendings.length) return res.send({ spendings });
    return res.status(400).send({ msg: 'Not found.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}
