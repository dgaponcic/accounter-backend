const nodemailer = require('nodemailer');

function emailSender(email) {
    var transporter = nodemailer.createTransport({
        host: 'localhost',
        port: 1025
    });

    const mailOptions = {
        from: 'support@accounter.com',
        to: email,
        subject: "User Registration",
        html: `You registrated`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            return res.send(err);
        else
            return res.status(201).send({ msg: "success", info });
    });
}

module.exports = emailSender;
