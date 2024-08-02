const cron = require("node-cron");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

function setupCronJob() {
  cron.schedule("0 7 * * *", async () => {
    console.log("Cron job running");

    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;
    console.log("Today's date:", todayFormatted);

    try {
      const birthdayUsers = await User.aggregate([
        {
          $project: {
            username: 1,
            email: 1,
            dob: {
              $dateToString: {
                format: "%m-%d",
                date: { $dateFromString: { dateString: "$dob" } },
              },
            },
          },
        },
        {
          $match: {
            dob: todayFormatted,
          },
        },
      ]);
      console.log("Birthday users:", birthdayUsers);

      if (birthdayUsers.length === 0) {
        console.log("No users with birthdays today");
      } else {
        birthdayUsers.forEach((user) => {
          console.log("Sending email to:", user.email);
          sendBirthdayEmail(user.email, user.username);
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  });
}

module.exports = setupCronJob;
