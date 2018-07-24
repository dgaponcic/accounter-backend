const { User } = require('../models/user.model');
const argon2 = require('argon2');
var crypto = require('crypto');
const waterfall = require('async-waterfall');
const async = require('async');
const nodemailer = require('nodemailer');

const forgot = (req, res) => {
    req.checkBody("email", "Email is required").notEmpty();
    if (req.body.email)
        req.checkBody("email", "Email is not valid").isEmail();
    let errors = req.validationErrors()
    if (errors) {
        res.status(500).send(errors);
    } else {
        var transporter = nodemailer.createTransport({
            host:'localhost',
            port: 1025

        });
    };
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(400).send("no user with that email address exists");
        crypto.randomBytes(30, (err, buf) => {
            user.resetPasswordToken = buf.toString('hex');
            user.resetPasswordExpires = Date.now() + 3600000;
            user.save((err) => {
                if (err)
                    return res.status(500).send(err);
                else {
                    const changeURL = `http://${req.headers.host}/users/change/${user.resetPasswordToken}`
                    const mailOptions = {
                        from: 'support@accounter.com',
                        to: user.email,
                        subject: "Password Change",
                        html: `follow this link ${changeURL}>link</a>`
                    };
                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err)
                            res.send(err)
                        else
                            res.send(info);
                    });
                }
            })
        })
    })
}


module.exports.forgot = forgot;

const change = (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            return res.status(400).send('expired or invalid')
        }
        req.checkBody("newPassword", "password is required").notEmpty();
        let errors = req.validationErrors()
        if (errors) {
            res.status(500).send(errors);
        } else {
            argon2.hash(req.body.newPassword).then(hash => {
                user.password = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                user.save((err) => {
                    if (err)
                        return res.status(500).send(err);
                    else
                        return res.send(user);
                });
            });
        }
    })
}

module.exports.change = change;