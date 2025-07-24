const User = require("../models/userModel.js");

//email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//name validation (letters, spaces, hyphens, apostrophes, 1-100 chars)
const nameRegex = /^[a-zA-Z\s\-']{1,100}$/;

const addUser = async (req, res) => {
  const { name, email, dob } = req.body;

  //input validation
  if (!name || !email || !dob) {
    return res.status(400).json({ error: "All fields are required!" });
  }

  if (!nameRegex.test(name.trim())) {
    return res.status(400).json({
      error: "Name must contain only letters, spaces, hyphens and apostrophes",
    });
  }

  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Please enter a valid email address!" });
  }

  //date validation
  const dobDate = new Date(dob);
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 120,
    today.getMonth(),
    today.getDate()
  );

  if (dobDate > today) {
    return res
      .status(400)
      .json({ error: "Date of birth cannot be in the future!" });
  }

  if (dobDate < minDate) {
    return res
      .status(400)
      .json({ error: "Please enter a valid date of birth" });
  }

  try {
    //check for duplicate emails
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      dob,
    });
    await user.save();

    res.status(201).json({
      message: "User added successfully",
      user: { name: user.name, email: user.email, dob: user.dob },
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { addUser };
