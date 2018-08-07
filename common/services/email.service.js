const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025
});

// var transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//          user:
//          pass:
//      }
//  });

async function sendMail(email, subject, msg) {
  return transporter.sendMail({
    from: 'support@accounter.com',
    to: email,
    subject: subject,
    html: msg
  });
}

module.exports.sendMail = sendMail;
