const mongoose = require('mongoose');
const crypto = require('crypto');

const { Schema } = mongoose;

const EventSchema = Schema({
  name: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now },
  startAt: { type: Date, required: true },
  finishAt: { type: Date, required: true },
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  spendings: [{ type: mongoose.Schema.ObjectId, ref: 'Spending' }],
  token: {
    invitationToken: String,
    invitationExpires: Date,
  },
});

EventSchema.methods.createEventToken = async function () {
  const buff = await crypto.randomBytes(30);
  this.token.invitationToken = buff.toString('hex');
  this.token.invitationExpires = this.finishAt;
  await this.save();
};

EventSchema.methods.addParticipants = async function (user) {
  this.participants.push(user);
  await this.save();
};

EventSchema.methods.addSpendings = async function (spending) {
  this.spendings.push(spending);
  await this.save();
};

module.exports.Event = mongoose.model('Event', EventSchema);
