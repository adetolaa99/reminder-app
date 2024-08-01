const cron = require("node-cron");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

const setupCronJob = () => {
  cron.schedule("0 7 * * *", async () => {
    const today = new Date().toISOString().slice(5, 10);
    const birthdayUsers = await User.find({ dob: { $regex: today } });

    birthdayUsers.forEach((user) => {
      sendBirthdayEmail(user.email, user.username);
    });
  });
};

module.exports = setupCronJob;
