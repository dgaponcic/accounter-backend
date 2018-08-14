import { ExtractJwt, Strategy } from 'passport-jwt';
import User from '../apps/users/models/user.model';

export default function(passport) {
  const opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = 'secret_key'; //TODO: GET value from settings

  passport.use(
    // TODO: Export just strategy and use is in app.js
    new Strategy(opts, (jwtPayload, done) => {
      // Find the user by token
      // TODO: User user service, don't use model directly
      User.findById(jwtPayload.user_id, (err, user) => {
        if (err) return done(err, false);
        if (user) return done(null, user);
        return done(null, false);
      });
    })
  );
}
