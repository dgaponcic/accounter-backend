const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  isConfirmed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  events: [{ type: mongoose.Schema.ObjectId, ref: 'Event' }],
  registrationToken: String,
  registrationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.methods.getJWT = function () {
  const expirationTime = parseInt(100000);
  return `Bearer ${jwt.sign({ user_id: this._id }, 'secret_key', { expiresIn: expirationTime })}`;
};

UserSchema.methods.addEvent = function (event) {
  this.events.push(event);
};

module.exports.User = mongoose.model('User', UserSchema);
