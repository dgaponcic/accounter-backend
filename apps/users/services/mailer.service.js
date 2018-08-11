const pug = require('pug');
const mailService = require('../../../common/services/email.service');

const generateHTML = (filename, url) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/${filename}.pug`, {
    resetURL: url,
  });
  return html;
};

async function sendConfirmationEmail(url, email) {
  const subject = 'Confirmation Mail';
  const html = generateHTML('registration.confirm', url);
  return mailService.sendMail(email, subject, html);
}

module.exports.sendConfirmationEmail = sendConfirmationEmail;

async function forgotPasswordEmail(url, email) {
  const subject = 'Forgot Password';
  const html = generateHTML('password.forgot', url);
  return mailService.sendMail(email, subject, html);
}

module.exports.forgotPasswordEmail = forgotPasswordEmail;
