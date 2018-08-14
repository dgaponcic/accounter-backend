const nodemailer = require('nodemailer'); //TODO: Please import me

// Configurate mail transporter
const transporter = nodemailer.createTransport({
  host: 'localhost', // TODO: Use config service
  port: 1025 // TODO: Use config service
});

// Send email
async function sendMail(email, subject, msg) {
  return transporter.sendMail({
    from: 'support@accounter.com',
    to: email,
    subject,
    html: msg
  });
}

module.exports.sendMail = sendMail;
