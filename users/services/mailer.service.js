const mailService = require('../../common/services/email.service');

async function sendConfirmationEmail(url, email) {
  const subject = 'Confirmation Mail';
  const message = url;
  return mailService.sendMail(email, subject, message);
}

module.exports.sendConfirmationEmail = sendConfirmationEmail;

async function forgotPasswordEmail(url, email) {
  const subject = 'Forgot Password';
  const message = url;
  return mailService.sendMail(email, subject, message);
}
