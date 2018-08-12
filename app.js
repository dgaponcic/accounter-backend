const express = require('express');
const chalk = require('chalk');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const config = require('./config/database');
const validator = require('./common/validator');
const authRouter = require('./apps/users/routes/auth.routes');
const eventRouter = require('./apps/events/routes/events.routes');
require('dotenv').config();

const app = express();
mongoose.Promise = Promise;
mongoose.connect(config.database, { useNewUrlParser: true });
const port = 8000;

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(validator);

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/users', authRouter);
app.use('/events', eventRouter);

app.listen(port, () => {
  console.log(`listening on ${chalk.green(port)}`);
});
