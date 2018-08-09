const { Event } = require('../models/event.model');
const { Spending } = require('../models/spending.model')

async function createNewEvent(name, author) {
    const event = new Event({ name, author });
    event.participants.push(author);
    event.creationDate = Date.now();
    return event.save();
}

module.exports.createNewEvent = createNewEvent;

async function addNewSpending(event, name, price, author) {
    const spending = new Spending({ name, price, author })
    event.spendings.push(spending);
    spending.participants.push(author);
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