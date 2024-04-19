// index.js

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
// var nodemailer = require('nodemailer');


const multer = require('multer');
const path = require('path');
const fs = require('fs');


const upload = multer({ dest: 'uploads/' });


// Import the router directly
const router = require("./routes");

dotenv.config();

const app = express();

// Allow requests from http://localhost:3000
app.use(
  cors({
    origin: ["http://localhost:3000", "*", "https://frontend-workplan.onrender.com", "http://192.168.94.29:3000"],
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

// Route to download a file
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');

      // Stream the file to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
  } else {
      res.status(404).send('File not found');
  }
});


app.use(cookieParser());
app.use(express.json());

// Routes
app.use(router);

const port = process.env.PORT || 1000;
app.listen(port, () => console.log(`Server running on port ${port}`));
