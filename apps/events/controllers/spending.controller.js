const eventService = require('../services/event.service');

async function validateSpendingInput(req, res, next) {
  req.checkBody('name', 'Name is required.').notEmpty();
  if (req.body.name) {
    req.checkBody('name', 'Too short name').isLength({ min: 3 });
  }
  req.checkBody('name', 'Too long name.').isLength({ max: 30 });
  req.checkBody('price', 'Price is required.').notEmpty();
  if (req.body.price) req.checkBody('price', 'Price is not a number.').isDecimal();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

async function createSpending(req, res) {
  const { name, price } = req.body;
  const { id } = req.params;
  try {
    const event = await eventService.findEvent(id);
    if (!event) return res.status(404).send({ msg: 'Not Found.' });
    await eventService.addNewSpending(event, name, price, req.user);
    return res.send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send(error);
  }
}

module.exports.validateSpendingInput = validateSpendingInput;
module.exports.createSpending = createSpending;
