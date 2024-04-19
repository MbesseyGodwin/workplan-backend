const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const app = express();
const upload = multer({ dest: '../uploads' });
const { connection } = require('../config/Database');

// Route to fetch all uploads
const fetchAllUploads = (req, res) => {
    const sql = 'SELECT * FROM files';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching uploads from MySQL: ', err);
            res.status(500).send('Error fetching uploads');
        } else {
            res.send(results);
        }
    });
};

// Route to fetch user-specific reports
const userSpecificReports = (req, res) => {
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
};


// Route to fetch workplans without a report
const workplansWithoutReport = (req, res) => {
    const { user_id } = req.query;
    const sql = 'SELECT * FROM Workplan where status = "Approved" AND report_status = 0 and user_id = ?';
    connection.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching workplans without a report: ', err);
            res.status(500).send('Error fetching workplans without a report');
        } else {
            res.send(results);
        }
    });
};

// Route to fetch workplans with a report
const workplansWithReport = (req, res) => {
    const { user_id } = req.query;
    const sql = 'SELECT * FROM Workplan where status = "Approved" AND report_status = 1 and user_id = ?';
    connection.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching workplans without a report: ', err);
            res.status(500).send('Error fetching workplans without a report');
        } else {
            res.send(results);
        }
    });
};

// Route to handle file uploads
handleFileUploads = (req, res) => {
    const { user_id, user_fullname, description, workplan_week, workplan_quarter, workplan_year } = req.body;
    const file = req.file;

    const sql = 'INSERT INTO files (filename, user_id, date_uploaded, user_fullname, description, workplan_week, workplan_quarter, workplan_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [file.filename, user_id, new Date(), user_fullname, description, workplan_week, workplan_quarter, workplan_year];
    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error uploading file to MySQL: ', err);
            res.status(500).send('Error uploading file');
        } else {
            connection.query(`UPDATE Workplan SET report_status = 1 WHERE status = "Approved" AND report_status = 0 AND user_id = ${user_id} and workplan_week = ${workplan_week} AND workplan_quarter =  ${workplan_quarter};`);
            console.log('File uploaded to MySQL');
            res.send('File uploaded successfully');
        }
    });
};


// Route to delete a file
const deleteAFile = (req, res) => {
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
};

const downloadAFile = (req, res) => {
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
};






// View workplan_week 
const getWorkplanWeekWithoutReport = (req, res) => {
    try {
      const { userID } = req.params;
  
      // Query the database to retrieve workplan_week  by user ID
      connection.query(`select workplan_week from Workplan where status = "Approved" and report_status = 0 and user_id = ?;`, [userID], (error, result) => {
        if (error) {
          console.error('Error retrieving workplan_week :', error);
          return res.status(400).send(`Error retrieving workplan_week : ${error.message}`);
        }
  
        // If no user is found with the provided ID, return a 404 Not Found status
        if (result.length === 0) {
          return res.status(404).send(`workplan_week for user_id ${userID} not found.`);
        }
  
        // Send the workplan_week  as a JSON response
        res.json(result);
      });
    } catch (error) {
      // Send an error message if there's an error during workplan_week  retrieval
      console.error('Error retrieving workplan_week :', error);
      res.status(500).send(`Internal Server Error: ${error.message}`);
    }
  };
  
  

module.exports = { fetchAllUploads, userSpecificReports, handleFileUploads, deleteAFile, downloadAFile, workplansWithoutReport, workplansWithReport, getWorkplanWeekWithoutReport };
