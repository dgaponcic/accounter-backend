const mongoose = require('mongoose');

const { Schema } = mongoose;

const SpendingSchema = new Schema({
  name: String,
  creationDate: Date,
  author: { type: mongoose.Schema.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  price: Number,
});

module.exports.Spending = mongoose.model('Spending', SpendingSchema);
