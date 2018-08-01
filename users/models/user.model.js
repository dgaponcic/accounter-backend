const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String },
    isConfirmed: false,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

UserSchema.methods.getJWT = function () {
    let expiration_time = parseInt(100000);
    return "Bearer " + jwt.sign({ user_id: this._id }, 'secret_key', { expiresIn: expiration_time });
};

module.exports.User = mongoose.model('User', UserSchema);

