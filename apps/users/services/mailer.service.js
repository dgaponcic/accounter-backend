const mailService = require('../../../common/services/email.service');

async function sendConfirmationEmail(url, email) {
  const subject = 'Confirmation Mail';
  const message = `Follow this <a href=${url}>${url}</a>`;
  return mailService.sendMail(email, subject, message);
}

module.exports.sendConfirmationEmail = sendConfirmationEmail;

async function forgotPasswordEmail(url, email) {
  const subject = 'Forgot Password';
  const message = `Follow this <a href=${url}>link</a>`;
  return mailService.sendMail(email, subject, message);
}
