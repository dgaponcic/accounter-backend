import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import * as cryptoService from '../../../common/crypto.service';
import * as passwordService from '../services/password.service';

const { Schema } = mongoose;

// Define user schema
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
  friends: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  tokens: [{
    type: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  }],
});

// get the bearer token
UserSchema.methods.getJWT = function () {
  const expirationTime = parseInt(100000); // TODO: get me from settings
  return `Bearer ${jwt.sign(
    { user_id: this._id },
    process.env.tokenJWTSecret,
    {
      expiresIn: expirationTime,
    },
  )}`;
};

// Add event
UserSchema.methods.addEvent = async function (event) {
  this.events.push(event);
  await this.save();
};

UserSchema.methods.addToken = async function (type) {
  // Generate the registration token
  const token = await cryptoService.generateTokensObjects(type);
  this.tokens.push(token);
  await this.save();
};

// hash the password using argon2
UserSchema.methods.createPassword = async function (password) {
  this.password = await passwordService.hashPassword(password);
  await this.save();
};

UserSchema.methods.deleteEvent = async function (eventId) {
  const index = this.events.indexOf(eventId);
  this.events.splice(index, 1);
  await this.save();
};

UserSchema.methods.addFriend = async function (addedUser) {
  this.friends.push(addedUser);
  await this.save();
};

UserSchema.methods.deleteFriend = async function (friend) {
  const index = this.friends.indexOf(friend);
  this.friends.splice(index, 1);
  this.save();
};

export default mongoose.model('User', UserSchema);
