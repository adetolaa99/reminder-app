const express = require("express");
const bodyParser = require("body-parser");

const UserRouter = require("./routes/userRoutes.js");
const path = require("path");
const setupCronJob = require("./services/cron.js");
const { connectDB } = require("./config/dbConfig.js");

require("dotenv").config();
connectDB();

const app = express();
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", UserRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  setupCronJob();
});
