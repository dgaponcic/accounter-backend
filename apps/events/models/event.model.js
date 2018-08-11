const mongoose = require('mongoose');

const { Schema } = mongoose;

const EventSchema = Schema({
  name: String,
  creationDate: Date,
  startAt: Date,
  finishAt: Date,
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  spendings: [{ type: mongoose.Schema.ObjectId, ref: 'Spending' }],
  invitationToken: String,
  invitationExpires: Date,
});

module.exports.Event = mongoose.model('Event', EventSchema);
