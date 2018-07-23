
const { ExtractJwt, Strategy } = require('passport-jwt');
const { User } = require('../models/user.model');

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = 'secret_key'

    passport.use(new Strategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.user_id, (err, user) => {
            if(err) return done(err, false);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
}