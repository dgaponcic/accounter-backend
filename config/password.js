var passwordValidator = require('password-validator');

var schema = new passwordValidator();
 
schema
.is().min(6)
.is().max(20)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()
 
module.exports = schema;