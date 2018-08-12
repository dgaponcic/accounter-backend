const PasswordValidator = require('password-validator');

// Define password validator
const schema = new PasswordValidator();

schema
  .min(6)
  .max(20)
  .has().not()
  .spaces();

module.exports = schema;
