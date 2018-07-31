const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025
});


function setOptions(email, msg) {
    const mailOptions = {
        from: 'support@accounter.com',
        to: email,
        subject: "User Registration",
        html: msg
    };
    return mailOptions;
}

module.exports.transporter = transporter;
module.exports.setOptions = setOptions;
