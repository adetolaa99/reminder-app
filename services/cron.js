const cron = require("node-cron");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

function setupCronJob() {
  //runs every hour
  cron.schedule("0 * * * *", async () => {
    console.log("Cron job running at:", new Date().toISOString());

    const timezones = [0, -5, -8, +1, +8];
    const datesToCheck = new Set();

    timezones.forEach((offset) => {
      const date = new Date();
      date.setHours(date.getHours() + offset);
      const formatted = `${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
      datesToCheck.add(formatted);
    });

    console.log("Checking dates:", Array.from(datesToCheck));

    try {
      const birthdayUsers = await User.aggregate([
        {
          $project: {
            name: 1,
            email: 1,
            dob: 1,
            dobMonthDay: {
              $substr: ["$dob", 5, 5],
            },
          },
        },
        {
          $match: {
            dobMonthDay: { $in: Array.from(datesToCheck) },
          },
        },
      ]);

      console.log("Birthday users found:", birthdayUsers);

      if (birthdayUsers.length === 0) {
        console.log("No users with birthdays today");
      } else {
        for (const user of birthdayUsers) {
          console.log("Sending email to:", user.email);
          try {
            await sendBirthdayEmail(user.email, user.name);
            console.log("Email sent successfully to:", user.email);
          } catch (emailError) {
            console.error("Failed to send email to:", user.email, emailError);
          }
        }
      }
    } catch (error) {
      console.error("Error in cron job:", error);
    }
  });
}

module.exports = setupCronJob;
