const express = require("express");
const { addUser } = require("../controllers/userController.js");

const UserRouter = express.Router();

UserRouter.post("/", addUser);

module.exports = UserRouter;
