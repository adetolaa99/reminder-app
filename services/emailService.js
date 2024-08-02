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
    text: `Happy Birthday ${username} 🎉🎂\n\nWe hope you have a fantastic day filled with joy and celebration!\n\nBest regards,\nYour Company`,
    html: `
            <h2>Happy Birthday ${username} 🎉🎂</h2>
            <p>We hope you have a fantastic day filled with joy and celebration!</p>
            <p>Best regards, <br> Your Company</p>
        `,
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
