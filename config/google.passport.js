import User from '../apps/users/models/user.model';

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.

export default function(passport) {
  // TODO: Export just strategy and use is in app.js
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, //TODO: Use convit
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, //TODO: Use convit
        callbackURL: 'https://localhost:8000/users/google/callback', //TODO: value to setting and use it
        passReqToCallback: true
      },
      (accessToken, refreshToken, profile, done) => {
        // TODO: User user service, don't use model directly
        User.findOrCreate({ googleId: profile.id }, (err, user) =>
          done(err, user)
        );
      }
    )
  );
}
