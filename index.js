// index.js

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
// var nodemailer = require('nodemailer');

// Import the router directly
const router = require("./routes");

dotenv.config();

const app = express();

// Allow requests from http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// API Routes
app.get("/", (req, res) => {
  res.json({
    message: `API Routes`,
    links: [
      "/api/names",
      // "/api/reports",
    ]
  });
});

app.use(cookieParser());
app.use(express.json());

// Routes
app.use(router);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));
