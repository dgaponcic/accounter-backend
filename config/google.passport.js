import User from '../apps/users/models/user.model';

const GoogleStrategy = require('passport-google-oauth20');

export default function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:8000/users/google/callback',
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        // const user = User.find({ email: })
        done(null, user)
      },
    ),
  );
}
