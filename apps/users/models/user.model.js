const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const argon2 = require('argon2');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  events: [{ type: mongoose.Schema.ObjectId, ref: 'Event' }],
  tokens: {
    registrationToken: String,
    registrationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
});

UserSchema.methods.getJWT = function () {
  const expirationTime = parseInt(100000);
  return `Bearer ${jwt.sign({ user_id: this._id }, 'secret_key', { expiresIn: expirationTime })}`;
};

UserSchema.methods.addEvent = async function (event) {
  this.events.push(event);
  await this.save();
};

UserSchema.methods.addRegistrationToken = async function () {
  const buff = await crypto.randomBytes(30);
  this.tokens.registrationToken = buff.toString('hex');
  this.tokens.registrationExpires = Date.now() + 3600000;
  await this.save();
};

UserSchema.methods.createPasswordToken = async function () {
  const buff = await crypto.randomBytes(30);
  this.tokens.resetPasswordToken = buff.toString('hex');
  this.tokens.resetPasswordExpires = Date.now() + 3600000;
  await this.save();
};

UserSchema.methods.createPassword = async function (password) {
  this.password = await argon2.hash(password);
  await this.save();
};

module.exports.User = mongoose.model('User', UserSchema);
