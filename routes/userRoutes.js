const express = require("express");
const { addUser } = require("../controllers/userController.js");
const User = require("../models/userModel.js");
const { sendBirthdayEmail } = require("../services/emailService.js");

const UserRouter = express.Router();

UserRouter.post("/", addUser);

UserRouter.get("/trigger-birthdays", async (req, res) => {
  const { secret } = req.query;

  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const now = new Date();
    const nigerianTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);
    const todayFormatted = `${String(nigerianTime.getMonth() + 1).padStart(2, "0")}-${String(nigerianTime.getDate()).padStart(2, "0")}`;

    console.log(`Cron triggered! Nigerian Date: ${todayFormatted}`);

    const birthdayUsers = await User.aggregate([
      {
        $project: {
          name: 1,
          email: 1,
          dob: 1,
          dobMonthDay: { $substr: ["$dob", 5, 5] },
        },
      },
      { $match: { dobMonthDay: todayFormatted } },
    ]);

    const results = [];
    for (const user of birthdayUsers) {
      try {
        await sendBirthdayEmail(user.email, user.name);
        results.push({ email: user.email, status: "sent" });
      } catch (err) {
        results.push({
          email: user.email,
          status: "failed",
          error: err.message,
        });
      }
    }

    res.json({
      message: "Completed!",
      count: birthdayUsers.length,
      details: results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

UserRouter.get("/all", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

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
