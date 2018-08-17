import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import argon2 from 'argon2';
// import * as cryptoService from '../services/crypto.service';

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
  // tokens: {

  //   registrationToken: String,
  //   registrationExpires: Date,
  //   resetPasswordToken: String,
  //   resetPasswordExpires: Date,
  // },

  tokens: [{
    type: { type: String },
    token: { type: String },
    expiresAt: { type: Date },
  }],
});
/* TODO: use this format
```{
  type: "Token Type"
  token: "xx",
  expire_at: ""
}
```;
*/

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
  const buff = await crypto.randomBytes(30);
  const token = buff.toString('hex');
  // The token is valid 1 hour
  const expiresAt = Date.now() + 3600000;
  this.tokens.push({ type, token, expiresAt });
  await this.save();
};

// generate password reset token
// UserSchema.methods.createPasswordToken = async function () {
//   const buff = await crypto.randomBytes(30);
//   const token = buff.toString('hex');
//   // The token is valid 1 hour
//   const expiresAt = Date.now() + 3600000;
//   this.tokens.push({ type: 'passwordToken', token, expiresAt });
//   await this.save();
// };

// hash the password using argon2
UserSchema.methods.createPassword = async function (password) {
  this.password = await argon2.hash(password);
  await this.save();
};

export default mongoose.model('User', UserSchema);
