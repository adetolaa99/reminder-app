const nodemailer = require("nodemailer");
const emailConfig = require("../config/emailConfig.js");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailConfig.EMAIL,
    pass: emailConfig.EMAIL_PASSWORD,
  },
});

const sendBirthdayEmail = (email, username) => {
  const mailOptions = {
    from: emailConfig.EMAIL,
    to: email,
    subject: "Happy Birthday!",
    text: `Dear ${username},\n\nWishing you a very happy birthday! Have a wonderful day!\n\nBest Regards,\nYour Company`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });
};

module.exports = { sendBirthdayEmail };
