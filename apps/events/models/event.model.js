import mongoose from 'mongoose';
import crypto from 'crypto';

const { Schema } = mongoose;

// Define user schema
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

// Create the invitation token
EventSchema.methods.createEventToken = async function () {
  const buff = await crypto.randomBytes(30);
  this.token.invitationToken = buff.toString('hex');
  this.token.invitationExpires = this.finishAt;
  await this.save();
};

// Add participants to the event
EventSchema.methods.addParticipants = async function (user) {
  this.participants.push(user);
  await this.save();
};

// Add spending to the event
EventSchema.methods.addSpendings = async function (spending) {
  this.spendings.push(spending);
  await this.save();
};

export default mongoose.model('Event', EventSchema);
