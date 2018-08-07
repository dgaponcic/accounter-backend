const { Event } = require('../models/event.model');

async function createNewEvent(eventName) {
    const event = new Event({ name: eventName });
    event.creationDate = Date.now();
    return event.save();
}

module.exports.createNewEvent = createNewEvent;