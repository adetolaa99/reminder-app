const User = require("../models/userModel.js");

const addUser = async (req, res) => {
  const { username, email, dob } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

   if (existingUser) {
     if (existingUser.username === username) {
       return res.status(400).json({ error: "Username already exists" });
     }
     if (existingUser.email === email) {
       return res.status(400).json({ error: "Email already exists" });
     }
   }

    const user = new User({ username, email, dob });
    await user.save();
    res.status(201).send("User added successfully");
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { addUser };
