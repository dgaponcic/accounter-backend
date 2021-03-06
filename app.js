import express from 'express';
import chalk from 'chalk';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import validator from './common/validator';
import authRouter from './apps/users/routes/auth.routes';
import eventRouter from './apps/events/routes/events.routes';
import config from './config/config';
import passportConfig from './config/passport';
import googlePassportConfig from './config/google.passport';

passportConfig(passport);
googlePassportConfig(passport);
dotenv.config();
const app = express();
// Set mongoose.Promise to any Promise implementation
mongoose.Promise = Promise;
mongoose.connect(
  config.get('mongo.main'),
  { useNewUrlParser: true },
);
const port = config.get('port');

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator);

// Keep the user in session
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use('/users', authRouter);
app.use('/events', eventRouter);

app.listen(port, () => {
  console.log(`listening on ${chalk.green(port)}`);
});
