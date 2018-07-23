const mongoose = require('mongoose');
const beautifyUnique = require('mongoose-beautiful-unique-validation');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');



const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String },
    username: { type: String, unique: "username is used" },
    email: { type: String, unique: "email is used" },
    password: { type: String }
});

UserSchema.methods.getJWT = function () {
    let expiration_time = parseInt(100000);
    return "Bearer " + jwt.sign({ user_id: this._id }, 'secret_key', { expiresIn: expiration_time });
};

UserSchema.plugin(beautifyUnique);

module.exports.User = mongoose.model('User', UserSchema);

