import Event from '../models/event.model';
import Spending from '../models/spending.model';
import User from '../../users/models/user.model';
import * as userService from '../../users/services/user.service';

// Generate the invitation token
export async function createEventToken(event) {
  await event.createEventToken();
  return event.token.invitationToken;
}

export async function createNewEvent(name, startAt, finishAt, user) {
  // Create a new instance of Event
  const event = new Event({
    name,
    startAt,
    finishAt,
    // author: user,
  });
  // Add the author of the event to the participants
  await event.addParticipants('author', user);
  // Add the event to the user
  await user.addEvent(event);
  await event.save();
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
    await event.addParticipants('participant', user);
    // Add the event to user
    await user.addEvent(event);
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

// Add participants to the spending
export function addParticipants(participants, type, spending) {
  participants.map(participant => spending.addParticipant(type, participant));
}

export async function addNewSpending(type, event, name, price, payers, consumers) {
  // Create new instance of Spending
  const spending = new Spending({ name, price, type });
  // Filter payers and consumers
  const filteredPayers = filterParticipants(event, payers);
  const filteredConsumers = filterParticipants(event, consumers);
  // Add participants to spending
  if (filteredPayers) addParticipants(filteredPayers, 'payer', spending);
  if (filteredConsumers) addParticipants(filteredConsumers, 'consumer', spending);
  // Calculate debts
  // Add the spending and participants to event
  await Promise.all([spending.save(), event.addSpendings(spending)]);
  // event = await findEventById(event.id);
  return spending;
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
  const limit = 5;
  const pages = Math.ceil(events.length / limit);
  if (page > pages) page = pages;
  const skip = (page - 1) * limit;
  const eventsList = await Event
  .find(
    { _id: { $in: events } },
    { name: 1, _id: 1 },
  )
  .skip(skip)
  .limit(limit)
  .sort({ finishAt: 1 });
  return eventsList;
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
  // const debts = await debtsService.initializeDebtsCalculation(event);
  // return participants.filter(async (participant) => {
  //   const { username } = participant.participant;
  //   return (debts[username] !== 0);
  // });
  if (!event.spendings.length) return false;
  const { spendings } = event;
  const isParticipant = spendings.some((spending) => {
    return checkIfIsParticipant(spending, participants);
  });
  return isParticipant;
}

function addedAndRemovedParticipants(newEvent, oldEvent) {
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
async function addParticipantsUpdate(addedParticipants, oldEvent) {
  addedParticipants.forEach(async (participant) => {
    const user = await userService.findUserById(participant);
    await user.addEvent(oldEvent);
  });
}

// Remove event from participant
async function removeParticipantsUpdate(removedParticipants, oldEvent) {
  removedParticipants.forEach(async (participant) => {
    const user = await userService.findUserById(participant.participant);
    user.deleteEvent(oldEvent._id);
  });
}

export async function updateEvent(newEvent, oldEvent) {
  const participantsDiff = addedAndRemovedParticipants(newEvent, oldEvent);
  const { removedParticipants, addedParticipants } = participantsDiff;
  if (addedParticipants.length) {
    await addParticipantsUpdate(addedParticipants, oldEvent);
  }
    const checkedUsers = await checkUsers(oldEvent, removedParticipants);
    if (checkedUsers) {
      return { msg: 'spendings', updated: false };
    }
    await removeParticipantsUpdate(removedParticipants, oldEvent);
  const event = await Event.findByIdAndUpdate({ _id: oldEvent._id }, newEvent);
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
