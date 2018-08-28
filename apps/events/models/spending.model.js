import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const { Schema } = mongoose;

// Define the spending schema
const SpendingSchema = Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  participants: [{
    type: { type: String },
    participant: { type: mongoose.Schema.ObjectId, ref: 'User' },
    amount: { type: Number },
  }],
  price: { type: Number, required: true },
  type: { type: String, required: true },
});

// Add payers or consumers
SpendingSchema.methods.addParticipant = function (type, user) {
  this.participants.push({ type, participant: user });
};

SpendingSchema.plugin(mongoosePaginate);

export default mongoose.model('Spending', SpendingSchema);
