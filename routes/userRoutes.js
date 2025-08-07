const express = require("express");
const { addUser } = require("../controllers/userController.js");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

const UserRouter = express.Router();

UserRouter.post("/", addUser);

//test route to manually trigger birthday check
UserRouter.get("/test-birthday", async (req, res) => {
  try {
    const today = new Date();
    const todayFormatted = `${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}`;

    console.log("Testing for date:", todayFormatted);

    const birthdayUsers = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          dob: 1,
          dobMonthDay: {
            $substr: ["$dob", 5, 5], //extract MM-DD from YYYY-MM-DD
          },
        },
      },
      {
        $match: {
          dobMonthDay: todayFormatted,
        },
      },
    ]);

    console.log("Found birthday users:", birthdayUsers);

    if (birthdayUsers.length > 0) {
      birthdayUsers.forEach((user) => {
        sendBirthdayEmail(user.email, user.name);
      });
    }

    res.json({
      message: "Birthday check completed",
      todayFormatted,
      birthdayUsers,
    });
  } catch (error) {
    console.error("Error in test:", error);
    res.status(500).json({ error: error.message });
  }
});

//test route to get all users
UserRouter.get("/all", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

//test route to send email manually
UserRouter.post("/test-email", async (req, res) => {
  try {
    const { email, name } = req.body;
    sendBirthdayEmail(email, name);
    res.json({ message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: error.message });
  }
});

//health check for cron job
UserRouter.get("/cron-status", (req, res) => {
  const now = new Date();
  res.json({
    message: "Cron service is active",
    serverTime: now.toISOString(),
    serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    formattedDate: `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  });
});

module.exports = UserRouter;
