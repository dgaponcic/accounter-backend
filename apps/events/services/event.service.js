const { Event } = require('../models/event.model');
const { Spending } = require('../models/spending.model');

async function createEventToken(event) {
  await event.createEventToken();
  return event.invitationToken;
}

async function createNewEvent(name, startAt, finishAt, user) {
  const event = new Event({
    name,
    startAt,
    finishAt,
    author: user,
  });
  await event.addParticipants(user);
  await user.addEvent(event);
  await event.save();
  return createEventToken(event);
}

async function findEventByToken(invitationToken) {
  const event = await Event.findOne({
    'token.invitationToken': invitationToken,
    'token.invitationExpires': { $gt: Date.now() },
  });
  return event;
}

async function validateUser(event, user) {
  const participantsIDs = event.participants.map(x => String(x._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}

async function addPeople(event, user) {
  const isParticipant = await validateUser(event, user);
  if (!isParticipant) {
    await event.addParticipants(user);
  }
  await user.addEvent(event);
}

async function addNewSpending(event, name, price, author) {
  const spending = new Spending({ name, price, author });
  await spending.save();
  event.addSpendings(spending);
  spending.addParticipants(event);
  return spending;
}

async function findEventById(id) {
  try {
    return await Event.findById(id)
      .populate('author', 'username')
      .populate('participants', 'username')
      .populate('spendings');
  } catch (error) {
    return undefined;
  }
}

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
