const mongoose = require('mongoose');
const { User } = require('../../users/models/user.model');
const Schema = mongoose.Schema;

const SpendingSchema = new Schema({
    name: String,
    creationDate: Date,
    author: { type: mongoose.Schema.ObjectId, ref: 'User' },
    participants: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    price: Number
});

module.exports.Spending = mongoose.model('Spending', SpendingSchema);