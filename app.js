const express = require('express');
const chalk = require('chalk');
// const debug = require('debug')('app');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('./config/database');
const expressValidator = require('express-validator');
const passport = require('passport');
const cors = require('cors');
const Promise = require('bluebird');

mongoose.Promise = Promise;
mongoose.connect(config.database);
const db = mongoose.connection;
const app = express();
const port = 8001;
const authRouter = require('./users/auth');

app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use('/users', authRouter);

app.listen(port, () => {
  console.log(`listening on ${chalk.green(port)}`);
});
