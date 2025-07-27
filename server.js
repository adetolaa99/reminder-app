const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");

const UserRouter = require("./routes/userRoutes.js");
const path = require("path");
const setupCronJob = require("./services/cron.js");
const { connectDB } = require("./config/dbConfig.js");

require("dotenv").config();
connectDB();

const app = express();
app.set("trust proxy", 1);

//Security middleware
app.use(helmet());
app.use(cors());

//Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100,
  message: "You've sent too many requests from this IP... please try again later",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, 
  message: { error: "Too many API requests... please try again later" },
});

app.use(limiter);
app.use("/api", apiLimiter);

//Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", UserRouter);

//Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An error occurred! Please try again" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  setupCronJob();
});