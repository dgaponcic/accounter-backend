const express = require('express');
const chalk = require('chalk');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/database');
const expressValidator = require('express-validator');
const passport = require('passport');
const cors = require('cors');
const Promise = require('bluebird');
const validator = require('./config/validator');
const authRouter = require('./users/auth.routes');

const app = express();
mongoose.Promise = Promise;
mongoose.connect(config.database);
const db = mongoose.connection;
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

app.listen(port, () => {
  console.log(`listening on ${chalk.green(port)}`);
});
