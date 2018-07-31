const { User } = require('./user.model');
const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const passValidator = require('../config/password');
const validator = require("email-validator");
const send = require('../services/email.service');

const create = async (req, res) => {
    req.checkBody("username", "User name is required").notEmpty();
    if (validator.validate(req.body.username))
        return res.status(400).send({ msg: "username can not be an email" });
    req.checkBody("email", "Email is required").notEmpty();
    if (req.body.email)
        req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("password", "Password is required").notEmpty();
    if (!passValidator.validate(req.body.password))
        return res.status(400).send({ msg: "weak password" });
    let errors = req.validationErrors();
    if (errors)
        return res.status(400).send(errors);
    const body = req.body;
    const msg = "you registrated";
    var hash = await argon2.hash(body.password);
    body.password = hash;
    let newUser = new User(body);
    newUser.save()
        .then(() => {
            send.transporter.sendMail(send.setOptions(body.email, msg), () => {
                return res.status(201).send({ msg: "An email was sent" });
            })
        })
        .catch((err) => {
            if (err.name === 'MongoError' && err.code === 11000)
                return res.status(400).send({ msg: "already used" });
            return res.send(err);
        })
};

module.exports.create = create;

const login = (req, res) => {
    const body = req.body;
    req.checkBody("input", "Username or email is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    let errors = req.validationErrors()
    if (errors)
        res.status(400).send(errors);

    User.findOne({
        $or: [
            { email: req.body.input },
            { username: req.body.input }
        ]
    })
        .then(async (user) => {
            let msg = "Something went wrong";
            if (!user) return res.status(400).send({ msg });
            match = await argon2.verify(user.password, body.password);
            if (match)
                return res.status(200).send({ "token": user.getJWT() });
            return res.status(400).send({ msg });
        })
        .catch((err) => {
            return res.send(err);
        })
}

module.exports.login = login;