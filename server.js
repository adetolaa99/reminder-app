const express = require("express");

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
