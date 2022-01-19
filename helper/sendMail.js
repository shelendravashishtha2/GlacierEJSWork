require('dotenv').config();
const nodemailer = require("nodemailer");

exports.sendMail = async (sendTo) => {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false,
		requireTLS: true,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD
		}
  });

  const data = await transporter.sendMail({ 
    from: process.env.MAIL_FROM_ADDRESS,
    to: sendTo, 
    subject: "Hello ✔", 
    html: "<b>Hello world?</b>", 
  });
  return data.messageId
}

