const crypto = require('crypto');
const { Event } = require('../models/event.model');
const { Spending } = require('../models/spending.model');

async function createEventToken(event, finishAt) {
  const buff = await crypto.randomBytes(30);
  event.invitationToken = buff.toString('hex');
  event.invitationExpires = finishAt;
  await event.save();
  return event.invitationToken;
}

async function createNewEvent(name, startAt, finishAt, user) {
  const event = new Event({
    name,
    startAt,
    finishAt,
    author: user,
  });
  event.participants.push(user);
  user.addEvent(event);
  await Promise.all([event.save(), user.save()]);
  return createEventToken(event, finishAt);
}

async function findEventByToken(invitationToken) {
  const event = await Event.findOne({
    invitationToken,
    invitationExpires: { $gt: Date.now() },
  });
  return event;
}

async function addPeople(event, user) {
  const isParticipant = await Array.from(event.participants.includes(user._id));
  if (!isParticipant) {
    event.participants.push(user);
  }
  await event.save();
}

async function addNewSpending(event, name, price, author) {
  const spending = new Spending({ name, price, author });
  event.spendings.push(spending);
  spending.addParticipants(event);
  await Promise.all([event.save(), spending.save()]);
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

async function populateEvents(user, events) {
  events.map(async (event) => {
    await Event.findById(event).populate('').exec();
  });
  return events;
}

async function validateUser(event, user) {
  const participantsIDs = event.participants.map(x => String(x._id));
  const isParticipant = participantsIDs.includes(String(user._id));
  return isParticipant;
}

module.exports.createNewEvent = createNewEvent;
module.exports.findEventByToken = findEventByToken;
module.exports.addPeople = addPeople;
module.exports.addNewSpending = addNewSpending;
module.exports.findEventById = findEventById;
module.exports.populateEvents = populateEvents;
module.exports.validateUser = validateUser;
