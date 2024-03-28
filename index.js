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
    origin: ["http://localhost:3000", "*", "https://frontend-workplan.onrender.com"],
    credentials: true,
  })
);

// home API Routes
app.get("/", (req, res) => {
  res.json({
    name: `Workplan Manager`,
    version: `1.0.0`,
    description: `Workplan Manager is a web application for managing workplans efficiently.`,
    authors: ['mbessey godwin', 'ezeobi onyedikachi', 'samuel uzochukwu', 'nelson attah', 'thelma abba'],
    email: `caritasnigeriaworkplan@gmail.com`,
    website: `https://example.com`,
    language: `Node.js`,
    database: `MySQL`,
    frontend: `React.js`,
    backend: `Node.js (Express)`,
    repository: `https://github.com/MbesseyGodwin`,
  });
});


app.use(cookieParser());
app.use(express.json());

// Routes
app.use(router);

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server running on port ${port}`));
