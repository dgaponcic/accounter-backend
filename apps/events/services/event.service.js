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
    author: user
  });
  event.participants.push(user);
  user.addEvent(event);
  await Promise.all([event.save(), user.save()]);
  return createEventToken(event, finishAt);
}

async function findEventByToken(invitationToken) {
  const event = await Event.findOne({
    invitationToken,
    invitationExpires: { $gt: Date.now() }
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

module.exports.createNewEvent = createNewEvent;
module.exports.findEventByToken = findEventByToken;
module.exports.addPeople = addPeople;

async function addNewSpending(event, name, price, author) {
  const spending = new Spending({ name, price, author });
  event.spendings.push(spending);
  spending.addParticipants(event);
  await Promise.all([event.save(), spending.save()]);
  return spending;
}

module.exports.addNewSpending = addNewSpending;

async function findEventById(id) {
  try {
    return await Event.findById(id);
  } catch (error) {
    return undefined;
  }
}

module.exports.findEventById = findEventById;

async function populateEvents(user, events) {
  events.map(async (event) => {
    await Event.findById(event).populate('').exec()
  });
  return events;
}

module.exports.populateEvents = populateEvents;
