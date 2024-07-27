const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/birthdayDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    dob: Date,
});

const User = mongoose.model('User', userSchema);

// Endpoint to handle form submission
app.post('/api/users', async (req, res) => {
    const { username, email, dob } = req.body;
    const user = new User({ username, email, dob });
    await user.save();
    res.status(201).send('User added successfully');
});

// Cron job to send birthday emails
cron.schedule('0 7 * * *', async () => {
    const today = new Date();
    const todayMonthDay = today.toISOString().slice(5, 10);
    const birthdayUsers = await User.find({ dob: { $regex: todayMonthDay } });

    birthdayUsers.forEach(user => {
        sendBirthdayEmail(user.email, user.username);
    });
});

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

const sendBirthdayEmail = (email, username) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Happy Birthday!',
        text: `Dear ${username},\n\nWishing you a very happy birthday! Have a wonderful day!\n\nBest Regards,\nYour Company`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email: ', error);
        } else {
            console.log('Email sent: ', info.response);
        }
    });
};

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/*const express = require("express");

const app = express();
const PORT = 8000;

app.get("/", (req, res) => {
  res.status(200);
  res.json({
    message: "Hey from the Birthday Reminder App!",
  });
});

app.listen(PORT, () => {
  console.log(`Server started successfully at http://localhost:${PORT}`);
});
*/
