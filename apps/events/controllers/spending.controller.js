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
    req.checkBody('price', 'Price is not a number.').isDecimal();
  }
  req.checkBody('payers', 'Introduce the payers.').notEmpty();
  req.checkBody('consumers', 'Introduce the consumers.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

export async function createSpending(req, res) {
  const { name, price, payers, consumers } = req.body;
  const { id } = req.params;
  try {
    // Find event by id
    const event = await eventService.findEvent(id);
    if (!event) return res.status(404).send({ msg: 'Not Found.' });
    // Add new spending to event
    await eventService.addNewSpending(
      event,
      name,
      price,
      payers,
      consumers,
    );
    return res.status(201).send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send(error);
  }
}

export async function getSpending(req, res) {
  const { spendingId, id } = req.params;
  try {
    // Find event by id
    const event = await eventService.findEvent(id);
    // Find spending by id
    const spending = await spendingService.findSpendingByIdAndPopulate(
      spendingId,
    );
    // Check if the spending belongs to event
    const check = spendingService.checkSpending(event, spending);
    if (!check) return res.status(400).send({ msg: 'Not Found.' });
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
  try {
    // Find event by id
    const event = await eventService.findEvent(id);
    // Find all spendings of that event
    const spendings = await spendingService.getSpendings(event);
    return res.send({ msg: 'success', spendings });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}
