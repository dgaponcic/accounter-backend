const mongoose = require('mongoose');

const { Schema } = mongoose.Schema;

const EventSchema = new Schema({
  name: String,
  creationDate: Date,
  startAt: Date,
  finishAt: Date,
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  spendings: [{ type: mongoose.Schema.ObjectId, ref: 'Spending' }],
});

module.exports.Event = mongoose.model('Event', EventSchema);
