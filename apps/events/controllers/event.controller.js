import * as eventService from '../services/event.service';
import * as debtsService from '../services/debts.service';

export async function validateUser(req, res, next) {
  const { user } = req;
  const { id } = req.params;
  // Find the event by id
  const event = await eventService.findEventById(id);
  if (!event) {
    return res.status(400).send({ msg: 'Event not found.' });
  }
  // Check if the user participate to the event
  const isParticipant = await eventService.validateUser(event, user);
  if (!isParticipant) {
    return res.status(400).send({ msg: 'You are not a participant to this event.' });
  }
  next();
}

export function validateEventCreation(req, res, next) {
  // Check if the required fields are not empty
  req.checkBody('name', 'Name is required.').notEmpty();
  req.checkBody('startAt', 'Start date is required.').notEmpty();
  req.checkBody('finishAt', 'Finish date is required.').notEmpty();
  if (req.body.finishAt) {
    req.checkBody('finishAt', 'Finish date must be after the start date.')
      .isAfter(req.body.startAt);
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

export async function createEvent(req, res) {
  const { name, startAt, finishAt } = req.body;
  const { user } = req;
  try {
    // Create a new event
    const eventToken = await eventService.createNewEvent(name, startAt, finishAt, user);
    return res.status(201).send({ msg: 'success', eventToken });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

export async function joinEvent(req, res) {
  const { user } = req;
  const { token } = req.params;
  try {
    // Find the event by token
    const event = await eventService.findEventByToken(token);
    if (event) {
      // Add the suer to participants of the event
      await eventService.addPeople(event, user);
      return res.send({ msg: 'success' });
    }
    return res.status(404).send({ msg: 'No event Found' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

// Give information about all events
export async function allEvents(req, res) {
  const { user } = req;
  const page = req.params.page || 1;
  try {
    // Populate events
    const results = await eventService.allEvents(user.events, page);
    const { events, pages } = results;
    if (events.length) return res.send({ msg: 'success', events, pages });
    return res.send({ msg: 'No events to show.' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

// Give information about the event
export async function getEvent(req, res) {
  const { id } = req.params;
  try {
    const event = await eventService.findEventByIdAndPopulate(id, 'name', 'spendings');
    if (!event) {
      return res.status(404).send({ msg: 'Event not found.' });
    }
    res.send({ event, msg: 'success' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function getDebts(req, res) {
  const { id } = req.params;
  try {
    const event = await eventService.findEventByIdAndPopulate(id, 'name', 'debts');
    if (!event) {
      return res.status(404).send({ msg: 'Event not found.' });
    }
    const debts = await debtsService.calculateDebts(event);
    const percentages = await eventService.getPercentages(event);
    if (!debts) return res.send({ msg: 'No debts to show', percentages });
    if (debts.length) return res.send({ msg: 'success', debts, percentages });
    return res.send({ msg: 'No debts to show.', percentages });
  } catch (error) {
    return res.status(400).send({ error });
  }
}

export async function updateEvent(req, res) {
  const { id } = req.params;
  const event = req.body;
  try {
    const oldEvent = await eventService.findEventByIdAndPopulate(id, 'participants');
    event.spendings = oldEvent.spendings;
    const response = await eventService.updateEvent(req.user, event, oldEvent);
    if (response.updated === false && response.msg === 'spendings') {
      return res.status(400).send({
        msg: 'You can not delete the users. They have already participated to spendings.',
      });
    }
    return res.send(response);
  } catch (error) {
    return res.status(400).send({ error });
  }
}

export async function checkEvent(req, res, next) {
  try {
    const { id } = req.params;
    const event = await eventService.findEventByIdAndPopulate(id, 'participants');
    const isAuthor = eventService.isEventAuthor(req.user, event);
    if (isAuthor) return next();
    const debts = await debtsService.initializeDebtsCalculation(event);
    if (!debts) return next(null, event);
    const noDebts = debtsService.checkDebts(debts);
    if (noDebts) return next();
    return res.status(400).send({ msg: 'You can not delete the event.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function deleteEvent(req, res) {
  try {
  await eventService.deleteEvent(req.params.id);
  return res.send({ msg: 'Deleted.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    res.status(400).send({ error });
  }
}

export async function searchEvents(req, res) {
  const { query } = req.query;
  try {
    const events = await eventService.searchEvents(query);
    if (events.length) return res.send({ events });
    return res.status(400).send({ msg: 'Not found.' });
  } catch (error) {
    return res.status(400).send({ error });
  }
}

export async function getHistory(req, res) {
  const { id } = req.params;
  try {
    const event = await eventService.findEventById(id);
    const history = await eventService.getHistory(event);
    return res.send({ history });
  } catch (error) {
    res.status(400).send({ error });
  }
}
