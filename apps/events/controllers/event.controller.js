const eventService = require('../services/event.service');
const { Event } = require('../models/event.model');

function validateEventCreation(req, res, next) {
    req.checkBody("name", "Name is required.").notEmpty();
	const errors = req.validationErrors()
	if (errors)
		return res.status(400).send(errors);
	next();
}

async function createEvent(req, res) {
    const eventName = req.body.name;
    try {
        const event = await eventService.createNewEvent(eventName, req.user);
        res.send({msg: 'success'});
    } catch (error) {
        return res.status(400).send({ msg: error });
    }
}

module.exports.validateEventCreation = validateEventCreation
module.exports.createEvent = createEvent;
