const PasswordValidator = require('password-validator');

// Define password validator
const schema = new PasswordValidator();

schema
  .min(6)
  .max(20)
  .spaces();

module.exports = schema;
