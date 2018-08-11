const eventService = require('../services/event.service');
const spendingService = require('../services/spending.service');

function validateEventCreation(req, res, next) {
  req.checkBody('name', 'Name is required.').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

async function createEvent(req, res) {
  const { name, startDate, finishDate } = req.body;
  const { user } = req;
  try {
    const eventToken = await eventService.createNewEvent(
      name,
      startDate,
      finishDate,
      user,
    );
    return res.status(201).send({ msg: 'success', eventToken });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

async function joinEvent(req, res) {
  const { user } = req;
  const { token } = req.params;
  try {
    const event = await eventService.findEventByToken(token);
    if (event) {
      await eventService.addPeople(event, user);
      return res.send({ msg: 'succes' });
    }
    return res.status(404).send({ msg: 'No event Found' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

async function validateUser(req, res, next) {
  const { user } = req;
  const { id } = req.params;
  const event = await eventService.findEventById(id);
  if (!event) {
    return res.status(400).send({ msg: 'Event not found' });
  }
  const isParticipant = await spendingService.validateUser(event, user);
  if (!isParticipant) {
    return res
      .status(401)
      .send({ msg: 'You are not a participant to this event.' });
  }
  next();
}

async function allEvents(req, res) {
  const { user } = req;
  try {
    const events = await eventService.populateEvents(user, user.events);
    return res.send({ msg: 'success', events });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

async function sendEvent(req, res) {
  const { id } = req.params;
  try {
    const event = await eventService.findEventById(id);
    if (!event) {
      return res.status(400).send({ msg: 'Event not found.' });
    }
    res.send({ event, msg: 'success' });
  } catch (error) {
    res.status(400).send({ msg: error });
  }
}

async function deleteParticipant(req, res) {
  res.send({ msg: 'success' });
}

module.exports.validateEventCreation = validateEventCreation;
module.exports.createEvent = createEvent;
module.exports.joinEvent = joinEvent;
module.exports.validateUser = validateUser;
module.exports.deleteParticipant = deleteParticipant;
module.exports.allEvents = allEvents;
module.exports.sendEvent = sendEvent;
