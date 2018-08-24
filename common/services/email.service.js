import nodemailer from 'nodemailer';

function configurateMail() {
  const { host, mailPort } = process.env;
  // Configurate mail transporter
  const transporter = nodemailer.createTransport({
    host,
    port: mailPort,
  });
  return transporter;
}

// Send email
export async function sendMail(email, subject, msg) {
  const transporter = configurateMail();
  return transporter.sendMail({
    from: 'support@accounter.com',
    to: email,
    subject,
    html: msg,
  });
}
