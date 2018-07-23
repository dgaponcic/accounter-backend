const bcrypt = require('bcryptjs');
const { User } = require('../models/user.model');

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
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) {
                    res.send(err);
                }
                req.body.password = hash;
                let newUser = new User(req.body);
                newUser.save((err) => {
                    if (err)
                        if (err.name === 'MongoError' && err.code === 11000) {
                            res.status(500).send(err.message);
                        }
                        else
                            return res.status(500).send(err.errors)
                    else
                        return res.send(newUser);
                });
            })
        });
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
        User.findOne({ username: body.username }, (err, user) => {
            if (err) return res.status(500).send(err);
            if (!user) return res.status(404).send('No user found.');
            match = bcrypt.compareSync(body.password, user.password);
            if (match)
                res.status(200).send(
                    {
                        "token": user.getJWT()
                    }
                )
            else
                res.send({ 'ok': 401, "msg": "Incorrect Password" })
        })
    }
}

module.exports.login = login;