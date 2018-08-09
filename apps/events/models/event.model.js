const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  startAt: Date,
  finishAt: Date,
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  spendings: [{ type: mongoose.Schema.ObjectId, ref: 'Spending' }],
});

module.exports.Event = mongoose.model('Event', EventSchema);
