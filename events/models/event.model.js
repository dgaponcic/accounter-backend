const mongoose = require('mongoose');
const { User } = require('../../users/models/user.model');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    name: String,
    creationDate: Date,
    participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    spendings: [{ type: mongoose.Schema.ObjectId, ref: 'Spending' }]
});

module.exports.Event = mongoose.model('Event', EventSchema);