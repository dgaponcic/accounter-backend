const { User } = require('./user.model');
const argon2 = require('argon2');
const nodemailer = require('nodemailer');
const passValidator = require('../config/password');
const validator = require("email-validator");
const emailSender = require('../services/email.service');

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
    // var transporter = nodemailer.createTransport({
    //     host: 'localhost',
    //     port: 1025
    // });
    // const mailOptions = {
    //     from: 'support@accounter.com',
    //     to: req.body.email,
    //     subject: "User Registration",
    //     html: `You registrated`
    // };
    var hash = await argon2.hash(req.body.password);
    req.body.password = hash;
    let newUser = new User(req.body);
    newUser.save((err) => {
        if (err) {
            if (err.name === 'MongoError' && err.code === 11000)
                return res.status(400).send({ msg: "already used" });
            return res.send(err);
        }
        emailSender(req.body.email);
        // transporter.sendMail(mailOptions, (err, info) => {
        //     if (err)
        //         return res.send(err);
        //     else
        //         return res.status(201).send({ msg: "success", info });
        // });
    });
};

module.exports.create = create;

const login = (req, res) => {
    const body = req.body;
    req.checkBody("username", "User name is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    let errors = req.validationErrors()
    if (errors) {
        res.status(400).send(errors);
    } else {
        User.findOne({ username: body.username }, async (err, user) => {
            let msg = "Something went wrong";
            if (err) return res.send(err);
            if (!user) return res.status(400).send(msg);
            match = await argon2.verify(user.password, body.password);
            if (match)
                res.status(200).send(
                    {
                        "token": user.getJWT()
                    }
                );
            else
                res.status(400).send({ msg });
        });
    };
};

module.exports.login = login;