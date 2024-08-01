const User = require("../models/userModel.js");

const addUser = async (req, res) => {
  const { username, email, dob } = req.body;
  const user = new User({ username, email, dob });
  await user.save();
  res.status(201).send("User added successfully");
};

module.exports = { addUser };
