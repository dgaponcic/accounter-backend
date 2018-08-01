const mailService = require('../../common/services/email.service');

async function sendConfirmationEmail(email) {
  console.log('here')
  const subject = 'Confirmation Mail';
  const message = 'Buna ziua';
  return mailService.sendMail(email, subject, message);
}

module.exports.sendConfirmationEmail = sendConfirmationEmail;
