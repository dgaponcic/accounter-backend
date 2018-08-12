const mongoose = require('mongoose');

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
});

// Add participants to the spending
SpendingSchema.methods.addParticipants = async function (event) {
  this.participants = event.participants;
  await this.save();
};

module.exports.Spending = mongoose.model('Spending', SpendingSchema);
