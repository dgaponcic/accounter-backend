const { ExtractJwt, Strategy } = require('passport-jwt');
const { User } = require('../apps/users/models/user.model');

module.exports = function (passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'secret_key';

  passport.use(
    new Strategy(opts, (jwtPayload, done) => {
      // Find the user by token
      User.findById(jwtPayload.user_id, (err, user) => {
        if (err) return done(err, false);
        if (user) return done(null, user);
        return done(null, false);
      });
    }),
  );
};
