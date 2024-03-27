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

app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

// Allow requests from http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// Routes
app.use(router);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));
