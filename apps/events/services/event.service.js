const { Event } = require('../models/event.model');
const { Spending } = require('../models/spending.model');

// Generate the invitation token
async function createEventToken(event) {
  await event.createEventToken();
  return event.invitationToken;
}

async function createNewEvent(name, startAt, finishAt, user) {
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
async function findEventByToken(invitationToken) {
  const event = await Event.findOne({
    'token.invitationToken': invitationToken,
    'token.invitationExpires': { $gt: Date.now() },
  });
  return event;
}

// Check if the user participate to the event
async function validateUser(event, user) {
  const participantsIDs = event.participants.map(x => String(x._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}

async function addPeople(event, user) {
  // Check if the user is a participant
  const isParticipant = await validateUser(event, user);
  if (!isParticipant) {
    // If not, add him to the event
    await event.addParticipants(user);
    // Add the event to user
    await user.addEvent(event);
  }
}

async function addNewSpending(event, name, price, author) {
  // Create new instance of Spending
  const spending = new Spending({ name, price, author });
  await spending.save();
  // Add the spending to event
  event.addSpendings(spending);
  // Add participants to event
  spending.addParticipants(event);
  return spending;
}

async function findEventById(id) {
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
async function findEvent(id) {
  const event = await Event.findById(id);
  return event;
}

module.exports.createNewEvent = createNewEvent;
module.exports.findEventByToken = findEventByToken;
module.exports.addPeople = addPeople;
module.exports.addNewSpending = addNewSpending;
module.exports.findEventById = findEventById;
module.exports.validateUser = validateUser;
module.exports.findEvent = findEvent;
