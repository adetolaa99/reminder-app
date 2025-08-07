const cron = require("node-cron");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

function setupCronJob() {
  cron.schedule("1 0 * * *", async () => {
    console.log(
      "Daily birthday cron job running at:",
      new Date().toISOString()
    );

    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;

    console.log("Checking for birthdays on:", todayFormatted);

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
            dobMonthDay: todayFormatted,
          },
        },
      ]);

      console.log(
        `Found ${birthdayUsers.length} birthday users:`,
        birthdayUsers.map((u) => u.email)
      );

      if (birthdayUsers.length === 0) {
        console.log("No users with birthdays today");
      } else {
        for (const user of birthdayUsers) {
          console.log("Sending birthday email to:", user.email);
          try {
            await sendBirthdayEmail(user.email, user.name);
            console.log("Birthday email sent successfully to:", user.email);
          } catch (emailError) {
            console.error(
              "Failed to send birthday email to:",
              user.email,
              emailError
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in birthday cron job:", error);
    }
  });

  console.log("Birthday cron job scheduled daily");
}

module.exports = setupCronJob;
