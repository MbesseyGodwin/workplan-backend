const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// MySQL database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Maria@123',
    database: 'CWMS',
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Enable CORS and JSON parsing middleware
app.use(cors({ origin: ["http://localhost:3000", "*"], credentials: true }));
app.use(express.json());


// Route to fetch all uploads
app.get('/uploads', (req, res) => {
    const sql = 'SELECT * FROM files';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching uploads from MySQL: ', err);
            res.status(500).send('Error fetching uploads');
        } else {
            res.send(results);
        }
    });
});

// Route to fetch user-specific reports
app.get('/user-reports', (req, res) => {
    const { user_id } = req.query;
    const sql = 'SELECT * FROM files WHERE user_id = ?';
    connection.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching user reports from MySQL: ', err);
            res.status(500).send('Error fetching user reports');
        } else {
            res.send(results);
        }
    });
});

// Route to handle file uploads
app.post('/upload', upload.single('pdf'), (req, res) => {
    const { user_id, user_fullname, description } = req.body;
    const file = req.file;

    // SQL query to insert file details into the database
    const sql = 'INSERT INTO files (filename, user_id, date_uploaded, user_fullname, description) VALUES (?, ?, ?, ?, ?)';
    const values = [file.filename, user_id, new Date(), user_fullname, description];
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error uploading file to MySQL: ', err);
            res.status(500).send('Error uploading file');
        } else {
            console.log('File uploaded to MySQL');
            res.send('File uploaded successfully');
        }
    });
});

// Route to delete a file
app.delete('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;

    // SQL query to delete file from the database
    const sql = 'DELETE FROM files WHERE filename = ?';
    connection.query(sql, [filename], (err, result) => {
        if (err) {
            console.error('Error deleting file from MySQL: ', err);
            res.status(500).send('Error deleting file');
        } else {
            console.log('File deleted from MySQL');
            res.send('File deleted successfully');
        }
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

// Start the server
const port = 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
