// const doxl = require('doxl');
import Event from '../models/event.model';
import Spending from '../models/spending.model';

// Generate the invitation token
export async function createEventToken(event) {
  await event.createEventToken();
  return event.invitationToken;
}

export async function createNewEvent(name, startAt, finishAt, user) {
  // Create a new instance of Event
  const event = new Event({
    name,
    startAt,
    finishAt,
    author: user,
  });
  // Add the author of the event to the participants
  await event.addParticipants(user);
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
  const participantsIDs = event.participants.map(x => String(x._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}

export async function addPeople(event, user) {
  // Check if the user is a participant
  const isParticipant = await validateUser(event, user);
  if (!isParticipant) {
    // If not, add him to the event
    await event.addParticipants(user);
    // Add the event to user
    await user.addEvent(event);
  }
}

export async function addNewSpending(event, name, price, author) {
  // Create new instance of Spending
  const spending = new Spending({ name, price, author });
  await spending.save();
  // Default the author pays for the spending
  await spending.addPayers(spending.author);
  // Add the spending and participants to event
  await Promise.all([event.addSpendings(spending),
    spending.addParticipants(event)]);
  return spending;
}

export async function findEventById(id) {
  try {
    // Populate the fields
    return await Event.findById(id)
      .populate('author', 'username')
      .populate('participants', 'username')
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
  const eventsList = await Event.find({ _id: { $in: events } }).select({ name: 1, _id: 1 }).exec();
  return eventsList;
}
