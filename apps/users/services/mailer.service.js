import pug from 'pug';
import * as mailService from '../../../common/services/email.service';

// generate the html from pug file
const generateHTML = (filename, url) => {
  const html = pug.renderFile(`${__dirname}/../views/emails/${filename}.pug`, {
    resetURL: url,
  });
  return html;
};

// Send registration confirmation email
export async function sendConfirmationEmail(url, email) {
  const subject = 'Confirmation Mail';
  const html = generateHTML('registration.confirm', url);
  return mailService.sendMail(email, subject, html);
}

// Send forgot password confirmation email
export async function forgotPasswordEmail(url, email) {
  const subject = 'Forgot Password';
  const html = generateHTML('password.forgot', url);
  return mailService.sendMail(email, subject, html);
}
