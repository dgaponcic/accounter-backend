import Event from '../models/event.model';
import Spending from '../models/spending.model';
import User from '../../users/models/user.model';
import History from '../models/history.model';
import * as userService from '../../users/services/user.service';
import * as debtsService from './debts.service';

// Generate the invitation token
export async function createEventToken(event) {
  await event.createEventToken();
  return event.token.invitationToken;
}

// Add activity to history
export async function addActivity(actor, verb, object, event, participants, adverb) {
  if (!event) event = object.object;
  const history = new History({
    event,
    actor,
    verb,
    object,
  });
  if (participants) history.participants = participants;
  if (adverb) history.adverb = adverb;
  await history.save();
}

async function addEventToParticipants(participants, event) {
  participants.forEach(async (participant) => {
    participant = await userService.findUserById(participant);
    if (participant) await participant.addEvent(event);
  });
}

function filterEventParticipants(participants, user) {
  const filteredParticipants = [...new Set(participants
    .filter(participant => participant !== String(user.id)))];
  return filteredParticipants;
}

export async function createNewEvent(name, startAt, finishAt, user, participants) {
  // Create a new instance of Event
  const event = new Event({ name, startAt, finishAt });
  // Add the author of the event to the participants
  await event.addParticipant('author', user);
  // Add the event to the user
  participants = filterEventParticipants(participants, user);
  await event.addParticipants('participant', participants);
  await Promise.all([
    addEventToParticipants(participants, event),
    user.addEvent(event),
  ]);
  const object = { type: 'Event', object: event, name: event.name };
  await addActivity(user, 'created', object);
  return createEventToken(event);
}

// Check if the token is valid
export async function findEventByToken(invitationToken) {
  const event = await Event.findOne({
    'token.invitationToken': invitationToken,
    'token.invitationExpires': { $gt: Date.now() },
  });
  return event;
}

// Check if the user participate to the event
export async function validateUser(event, user) {
  const participantsIDs = event.participants.map(x => String(x.participant._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}

export async function addPeople(event, user) {
  // Check if the user is a participant
  const isParticipant = await validateUser(event, user);
  if (!isParticipant) {
    // If not, add him to the event
    await event.addParticipant('participant', user);
    // Add the event to user
    await user.addEvent(event);
    const object = { type: 'Event', object: event, name: event.name };
    await addActivity(user, 'joined', object);
  }
}

// Check if the user is event participant
function isEventParticipant(event, userId) {
  const participantsIDs = event.participants.map(x => String(x.participant._id));
  const isParticipant = participantsIDs.includes(String(userId));
  return isParticipant;
}

// Filter the participants
function filterParticipants(event, participants) {
  // Participants must be unique and participate to event
  const filteredParticipants = [...new Set(participants
    .filter(participant => isEventParticipant(event, participant)))];
    return filteredParticipants;
}

async function addPaymentActivity(spending, consumer, user, event) {
  const object = { object: null, name: spending.price };
  const userConsumer = await User.findById(consumer);
  await addActivity(user, 'gave', object, event, [userConsumer]);
}

async function addSpendingActivity(spending, event, user) {
  const object = { type: 'Spending', object: spending, name: spending.name };
  await addActivity(user, 'added', object, event);
}

// Add participants to the spending
export function addParticipants(participants, type, spending) {
  participants.map(participant => spending.addParticipant(type, participant));
}

export async function addNewSpending(type, event, name, price, payers, consumers, user) {
  // Create new instance of Spending
  const spending = new Spending({ name, price, type });
  // Filter payers and consumers
  const filteredPayers = filterParticipants(event, payers);
  const filteredConsumers = filterParticipants(event, consumers);
  // Add participants to spending
  if (!filteredConsumers.length || !filteredConsumers.length) {
    return { created: false };
  // if (filteredPayers) addParticipants(filteredPayers, 'payer', spending);
  // if (filteredConsumers) addParticipants(filteredConsumers, 'consumer', spending);
  }
  addParticipants(filteredPayers, 'payer', spending);
  addParticipants(filteredConsumers, 'consumer', spending);
  // Calculate debts
  // Add the spending and participants to event
  await Promise.all([spending.save(), event.addSpendings(spending)]);
  // Add activity history
  if (type === 'spending') await addSpendingActivity(spending, event, user);
  if (type === 'payment') await addPaymentActivity(spending, consumers[0], user, event);
  return { created: true };
}

export async function findEventByIdAndPopulate(id, fieldToPopulate, type) {
  try {
    // Populate the fields
    const event = await Event.findById(id)
      .populate({
        path: 'participants.participant',
        select: 'username',
        model: 'User',
      })
      .populate('spendings', fieldToPopulate);
      if (type === 'spending') {
        event.spendings = event.spendings.filter((spending) => {
          return spending.type === 'spending';
        });
      }
      return event;
  } catch (error) {
    return undefined;
  }
}

// Find event by id
export async function findEventById(id) {
  const event = await Event.findById(id);
  return event;
}

// Return all user's events
export async function allEvents(events, page) {
  const limit = 2;
  const pages = Math.ceil(events.length / limit);

  const query = { _id: { $in: events } };
  const options = {
    sort: '-finishAt',
    select: 'name',
    page,
    limit,
  };

  events = await Event.paginate(query, options);
  return {
    events: events.docs,
    pages,
  };
}

// Find all event where the user is author
export async function allEventsByAuthor(events, page, user) {
  const limit = 10;
  const pages = Math.ceil(events.length / limit);
  const options = {
    page,
    sort: '-createdAt',
    limit: 10,
    select: 'name',
  };
  const query = {
    _id: { $in: events },
    participants: {
      $elemMatch: { typeOfParticipant: 'author', participant: user._id },
    },
  };
  events = await Event.paginate(query, options);
  return { events: events.docs, pages };
}

async function calculateEventsDebts(events, user) {
  let eventsWithDebts = events.map(async (event) => {
    event = await findEventByIdAndPopulate(event);
    const debts = await debtsService.initializeDebtsCalculation(event);
    let userDebt = 0;
    if (debts && debts[user.username] !== 0) userDebt = debts[user.username];
    return { debts: userDebt, event: { _id: event._id, name: event.name } };
  });
  eventsWithDebts = await Promise.all(eventsWithDebts);
  return eventsWithDebts;
}

// Filter the events with debts
// Sort the events based on the debts in descending order
function sortDebtsEvents(eventsWithDebts) {
  eventsWithDebts = eventsWithDebts.filter((event) => {
    return event.debts !== 0;
  }).sort((prev, next) => {
    return prev.debt - next.debt;
  });
  return eventsWithDebts;
}

// Find all events where user has debts
export async function allEventsWithDebts(events, page, user) {
  const limit = 2;
  events = await Event.find({ _id: { $in: events } });
  let eventsWithDebts = await calculateEventsDebts(events, user);
  eventsWithDebts = sortDebtsEvents(eventsWithDebts);
  const pages = Math.ceil(eventsWithDebts.length / limit);
  let skip = 0;
  if (pages > 0) skip = (page - 1) * limit;
  if (page > pages) page = pages;
  return { events: eventsWithDebts.slice(skip, skip + limit), pages };
}

export function checkUser(to, from, user) {
  if (user.id !== to && user.id !== from) return false;
  return true;
}

function toArray(objectArray) {
  const newArray = [];
  objectArray.forEach((participant) => {
    return newArray.push(String(participant.participant._id));
  });
  return newArray;
}

function checkIfIsParticipant(spending, participants) {
  const spendingParticipants = toArray(spending.participants);
  participants = toArray(participants);
  const isParticipant = participants.some((participant) => {
    return spendingParticipants.includes(String(participant));
  });
  return isParticipant;
}

async function checkUsers(event, participants) {
  if (!event.spendings.length) return false;
  const { spendings } = event;
  const isParticipant = spendings.some((spending) => {
    return checkIfIsParticipant(spending, participants);
  });
  return isParticipant;
}

function addedAndRemovedParticipants(newEvent, oldEvent) {
  if (!newEvent.participants) newEvent.participants = [];
  const newEventParticipants = toArray(newEvent.participants);
  const oldEventParticipants = [];
  const removedParticipants = oldEvent.participants.filter((participant) => {
    oldEventParticipants.push(String(participant.participant._id));
    return !newEventParticipants.includes(String(participant.participant._id));
  });
  const addedParticipants = newEventParticipants.filter((participant) => {
    return !oldEventParticipants.includes(participant);
  });
  return {
    addedParticipants,
    removedParticipants,
  };
}

// Add event to participant
async function addParticipantsUpdate(actor, addedParticipants, oldEvent) {
  let participants = addedParticipants.map(async (participant) => {
    const user = await userService.findUserById(participant);
    await user.addEvent(oldEvent);
    return user;
  });
  participants = await Promise.all(participants);
  const object = { type: 'Event', object: oldEvent, name: oldEvent.name };
  addActivity(actor, 'added', object, oldEvent, participants, 'to');
}

// Add activity hor the removes participants
function removedParticipantsActivity(actor, event, participants, userActor) {
  if (participants.length) {
    const object = { type: 'Event', object: event, name: event.name };
    addActivity(actor, 'deleted', object, event, participants, 'from');
  }
  // If user left the event
  if (userActor) {
    const object = { type: 'Event', object: event, name: event.name };
    addActivity(actor, 'left', object);
  }
}

// Remove event from participant
async function removeParticipantsUpdate(actor, removedParticipants, oldEvent) {
  let userActor;
  let participants = removedParticipants.map(async (participant) => {
    const user = await userService.findUserById(participant.participant);
    if (actor.username !== user.username) {
      user.deleteEvent(oldEvent._id);
      return user;
    }
    user.deleteEvent(oldEvent._id);
    userActor = user;
  });
  participants = await Promise.all(participants);
  removedParticipantsActivity(actor, oldEvent, participants, userActor);
}

export async function updateEvent(user, newEvent, oldEvent) {
  const participantsDiff = addedAndRemovedParticipants(newEvent, oldEvent);
  const { removedParticipants, addedParticipants } = participantsDiff;
  if (addedParticipants.length) {
    await addParticipantsUpdate(user, addedParticipants, oldEvent);
  }
    const checkedUsers = await checkUsers(oldEvent, removedParticipants);
    if (checkedUsers) {
      return { msg: 'spendings', updated: false };
    }
  await removeParticipantsUpdate(user, removedParticipants, oldEvent);
  const object = { type: 'Event', object: oldEvent, name: oldEvent.name };
  const event = await Event.findByIdAndUpdate({ _id: oldEvent._id }, newEvent);
  addActivity(user, 'updated', object);
  await event.save();
  return { msg: 'success', updated: true };
}

async function deleteParticipants(event) {
  event.participants.forEach(async (participant) => {
    const user = await User.findById(participant.participant._id);
    await user.deleteEvent(event._id);
  });
}

export async function deleteEvent(id) {
  const event = await findEventById(id);
  await deleteParticipants(event);
  await Event.findByIdAndRemove(id);
}

export function isEventAuthor(user, event) {
	const isAuthor = event.participants.some((participant) => {
    return participant.typeOfParticipant === 'author'
      && String(participant.participant._id) === String(user._id);
  });
	return isAuthor;
}

export async function searchEvents(query) {
  const limit = 10;
  const events = await Event.find({
      name: { $regex: new RegExp(query) },
    }, { name: 1, createdAt: 1 })
    .sort({ createdAt: -1 })
    .limit(limit);
  return events;
}

async function historyLength(event) {
  const history = await History.find({ event });
  return history.length;
}

export async function getHistory(page, event) {
  const limit = 5;
  const pages = Math.ceil(await historyLength(event) / limit);
  const options = {
    sort: '-createdAt',
    page,
    limit,
    populate: [
      { path: 'actor', select: 'username' },
      { path: 'object.object', select: 'name', model: 'object.type' },
      { path: 'participants', select: 'username', model: 'User' },
    ],
  };
  const history = await History.paginate({ event }, options);
  return { history: history.docs, pages };
}
