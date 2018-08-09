const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String },
  isConfirmed: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  registrationToken: String,
  registrationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.methods.getJWT = function () {
  const expirationTime = parseInt(100000);
  return `Bearer ${jwt.sign({ user_id: this._id }, 'secret_key', { expiresIn: expirationTime })}`;
};

module.exports.User = mongoose.model('User', UserSchema);
