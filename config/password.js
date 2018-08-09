const PasswordValidator = require('password-validator');

const schema = new PasswordValidator();

schema
  .is()
  .min(6)
  .is()
  .max(20)
  .has()
  .lowercase()
  .has()
  .not()
  .spaces();

module.exports = schema;
