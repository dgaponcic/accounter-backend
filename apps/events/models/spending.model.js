import mongoose from 'mongoose';

const { Schema } = mongoose;

// Define the spending schema
const SpendingSchema = Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  participants: [{
    type: { type: String },
    participant: { type: mongoose.Schema.ObjectId, ref: 'User' },
  }],
  price: { type: Number, required: true },
});

// Add payers or consumers
SpendingSchema.methods.addParticipant = function (type, user) {
  this.participants.push({ type, participant: user });
};

export default mongoose.model('Spending', SpendingSchema);
