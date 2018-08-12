const nodemailer = require('nodemailer');

// Configurate mail transporter
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
});

// Send email
async function sendMail(email, subject, msg) {
  return transporter.sendMail({
    from: 'support@accounter.com',
    to: email,
    subject,
    html: msg,
  });
}

module.exports.sendMail = sendMail;
