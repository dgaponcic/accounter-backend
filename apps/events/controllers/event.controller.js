const eventService = require('../services/event.service');

function validateEventCreation(req, res, next) {
  req.checkBody('name', 'Name is required.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

async function createEvent(req, res) {
  const { name, startDate, finishDate } = req.body;
  try {
    await eventService.createNewEvent(name, startDate, finishDate, req.user);
    return res.send({ msg: 'success' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

module.exports.validateEventCreation = validateEventCreation;
module.exports.createEvent = createEvent;
