import * as eventService from '../services/event.service';

export async function validateUser(req, res, next) {
  const { user } = req;
  const { id } = req.params;
  // Find the event by id
  const event = await eventService.findEvent(id);
  if (!event) {
    return res.status(400).send({ msg: 'Event not found.' });
  }
  // Check if the user participate to the event
  const isParticipant = await eventService.validateUser(event, user);
  if (!isParticipant) {
    return res.status(401).send({ msg: 'You are not a participant to this event.' });
  }
  next();
}

export function validateEventCreation(req, res, next) {
  // Check if the required fields are not empty
  req.checkBody('name', 'Name is required.').notEmpty();
  req.checkBody('startDate', 'Start date is required.').notEmpty();
  req.checkBody('finishDate', 'Finish date is required.').notEmpty();
  if (req.body.finishDate) {
    req
      .checkBody('finishDate', 'Finish date must be after the start date.')
      .isAfter(req.body.startDate);
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);
  next();
}

export async function createEvent(req, res) {
  const { name, startDate, finishDate } = req.body;
  const { user } = req;
  try {
    // Create a new event
    const eventToken = await eventService.createNewEvent(name, startDate, finishDate, user);
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
      return res.send({ msg: 'succes' });
    }
    return res.status(404).send({ msg: 'No event Found' });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

// Give information about all events
export async function allEvents(req, res) {
  const { user } = req;
  try {
    // Populate events
    const events = await eventService.allEvents(user.events);
    return res.send({ msg: 'success', events });
  } catch (error) {
    return res.status(400).send({ msg: error });
  }
}

// Give information about the event
export async function getEvent(req, res) {
  const { id } = req.params;
  try {
    // Find the event by id
    const event = await eventService.findEventById(id);
    if (!event) {
      return res.status(400).send({ msg: 'Event not found.' });
    }
    res.send({ event, msg: 'success' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).send({ msg: 'Not Found' });
    }
    return res.status(400).send({ error });
  }
}

export async function deleteParticipant(req, res) {
  res.send({ msg: 'success' });
}
