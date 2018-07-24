const { User } = require('../models/user.model');
const argon2 = require('argon2');

const create = (req, res) => {
    req.checkBody("username", "User name is required").notEmpty();
    req.checkBody("email", "Email is required").notEmpty();
    if (req.body.email)
        req.checkBody("email", "Email is not valid").isEmail();
    req.checkBody("password", "Password is required").notEmpty();


    let errors = req.validationErrors()
    if (errors) {
        res.status(500).send(errors);
    } else {
        argon2.hash(req.body.password).then(hash => {
            req.body.password = hash;
            let newUser = new User(req.body);
            newUser.save((err) => {
                if (err)
                    if (err.name === 'MongoError' && err.code === 11000)
                        res.status(500).send("already used");
                    else
                        return res.status(500).send(err);
                else
                    return res.send(newUser);
            });
        })
    }

}
module.exports.create = create;

const login = (req, res) => {
    const body = req.body;
    req.checkBody("username", "User name is required").notEmpty();
    req.checkBody("password", "Password is required").notEmpty();
    let errors = req.validationErrors()
    if (errors) {
        res.status(500).send(errors);
    } else {
        User.findOne({ username: body.username }, async (err, user) => {
            let msg = "Something went wrong";
            if (err) return res.status(500).send(err);
            if (!user) return res.status(400).send(msg);
            match = await argon2.verify(user.password, body.password);
            if (match)
                res.status(200).send(
                    {
                        "token": user.getJWT()
                    }
                )
            else
                res.send({ 'ok': 400, "msg": msg })
        })
    }
}

module.exports.login = login;


const reset = async (req, res) => {

    req.checkBody("password", "password is required").notEmpty();
    req.checkBody("newPassword", "introduce new password").notEmpty();
    let errors = req.validationErrors()
    if (errors) {
        res.status(500).send(errors);
    } else {
        match = await argon2.verify(req.user.password, req.body.password);
        if (match) {
            argon2.hash(req.body.newPassword).then(hash => {
                req.user.password = hash;
                req.user.save((err) => {
                    if (err)
                        return res.status(500).send(err);
                    else
                        return res.send(req.user);
                });
            })
        } else
            res.send({ 'ok': 400, "msg": "incorrect password" })
    }
}

module.exports.reset = reset;