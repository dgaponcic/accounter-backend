const mongoose = require('mongoose');

const { Schema } = mongoose;

const SpendingSchema = Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  price: Number,
});

module.exports.Spending = mongoose.model('Spending', SpendingSchema);
