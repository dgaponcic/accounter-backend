import Event from '../models/event.model';
import Spending from '../models/spending.model';
import * as debtsService from '../services/debts.service';

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
function addParticipants(participants, type, spending) {
  participants.map(participant => spending.addParticipant(type, participant));
}

export async function addNewSpending(event, name, price, payers, consumers) {
  // Create new instance of Spending
  const spending = new Spending({ name, price });
  // Filter payers and consumers
  const filteredPayers = filterParticipants(event, payers);
  const filteredConsumers = filterParticipants(event, consumers);
  // Add participants to spending
  if (filteredPayers) addParticipants(filteredPayers, 'payer', spending);
  if (filteredConsumers) addParticipants(filteredConsumers, 'consumer', spending);
  // Calculate debts
  // Add the spending and participants to event
  await Promise.all([spending.save(), event.addSpendings(spending)]);
  event = await findEventById(event.id);
  await debtsService.calculateDebts(event);
  return spending;
}

export async function findEventById(id) {
  try {
    // Populate the fields
    return await Event.findById(id)
      .populate({
        path: 'participants.participant',
        select: 'username',
        model: 'User',
      })
      .populate('spendings');
  } catch (error) {
    return undefined;
  }
}

// Find event by id
export async function findEvent(id) {
  const event = await Event.findById(id);
  return event;
}

// Return all user's events
export async function allEvents(events) {
  const eventsList = await Event.find({ _id: { $in: events } }, { name: 1, _id: 1 });
  return eventsList;
}

async function changeDebts(to, from, amount, debts) {
  let match = false;
  const changedDebts = debts.map((debt) => {
    if (debt.to === to && debt.from === from && amount !== 0) {
      match = true;
      if (amount <= debt.amount) {
        debt.amount -= amount;
        return debt;
      }
        [debt.to, debt.from] = [debt.from, debt.to];
        debt.amount = amount - debt.amount;
        return debt;
      }
      return debt;
  });
  return {
    debts: changedDebts,
    match,
  };
}

export async function addPayment(to, from, amount, event) {
  const debts = event.debts[event.debts.length - 1];
  const changedDebts = await changeDebts(to, from, amount, debts);
  if (changedDebts.match) await event.addDebts(changedDebts.debts);
}
