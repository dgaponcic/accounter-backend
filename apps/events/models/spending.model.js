const mongoose = require('mongoose');

const SpendingSchema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  price: Number,
});

module.exports.Spending = mongoose.model('Spending', SpendingSchema);
