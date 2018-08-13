import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the spending schema
const SpendingSchema = Schema({
  name: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
  price: { type: Number, required: true },
  payers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  }],
});

// Add participants to the spending
SpendingSchema.methods.addParticipants = async function (event) {
  this.participants = event.participants;
  await this.save();
};

// Add payers to spendings
SpendingSchema.methods.addPayers = async function (user) {
  this.payers.push(user);
  await this.save();
};

export default mongoose.model('Spending', SpendingSchema);
