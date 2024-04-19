// Import the connection object from the database configuration
const { connection } = require('../config/Database');


// Function to send email notification using nodemailer
const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to send email
const sendEmailInBackground = async ({ to, subject, text }) => {
  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER, // Sender address
      to: to, // List of recipients
      subject: subject, // Subject line
      text: text, // Plain text body
    });
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    // Handle error
  }
};


// Route for creating a new workplan
const createWorkplan = (req, res) => {
  try {
    const { title, description, status, user_id, workplan_type, workplan_day, workplan_date, vehicleId, destination, location, departure_time, logistic, implementingTeam, authorizer, user_unit, workplan_week, workplan_quarter } = req.body;

    console.log(implementingTeam);
    console.log(user_unit);


    // Insert the new workplan data into the database
    connection.query(`set foreign_key_checks = 0;`);
    connection.query(`
      INSERT INTO Workplan (title, description, status, user_id, workplan_type, workplan_day, workplan_date, vehicle_id, destination, location, departure_time, logistic, authorizer, user_unit, workplan_week, workplan_quarter)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, status, user_id, workplan_type, workplan_day, workplan_date, vehicleId, destination, location, departure_time, logistic, authorizer, user_unit, workplan_week, workplan_quarter], (error, results, fields) => {
        if (error) {
          console.error('Error creating workplan:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Get the ID of the newly inserted workplan
        const workplanId = results.insertId;

        // Insert implementing team members
        connection.query(`set foreign_key_checks = 0;`);
        const values = implementingTeam.map(memberId => [workplanId, memberId]);
        connection.query('INSERT INTO implementing_team (workplan_id, user_id) VALUES ?', [values], (error, results, fields) => {
          if (error) {
            console.error('Error adding implementing team member:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          // Send a success message indicating the new workplan has been added
          console.log('Workplan created successfully');
          res.status(201).json({ message: 'Workplan created successfully' });
        });
      });

  } catch (error) {
    // Send an error message if there's an error during workplan creation
    console.error('Error creating workplan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Function to check if a workplan exists for the selected day
const checkWorkplanExists = (req, res) => {
  try {
    const { workplanDay } = req.params;

    // Convert the provided day to the appropriate day format in the database
    const dayMap = {
      'sunday': 'Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday'
    };

    const formattedDay = dayMap[workplanDay.toLowerCase()];
    if (!formattedDay) {
      return res.status(400).json({ error: 'Invalid day provided' });
    }

    // Check if a workplan exists for the specified day
    connection.query(
      `SELECT * FROM Workplan WHERE workplan_day = ?`,
      [formattedDay],
      (error, results) => {
        if (error) {
          console.error('Error checking workplan existence:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        // If results are found, it means a workplan exists for the specified day
        if (results.length > 0) {
          return res.status(200).json({ exists: true });
        }

        // No workplan found for the specified day
        return res.status(200).json({ exists: false });
      }
    );

  } catch (error) {
    console.error('Error checking workplan existence:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};




// Function to edit an existing workplan
const editWorkplan = (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Update the workplan data in the database
    connection.query(`
      UPDATE Workplan 
      SET title = ?, description = ?, status = ? 
      WHERE workplan_id = ?`,
      [title, description, status, id]);

    // Send a success message indicating the workplan has been updated
    res.status(200).json({ message: 'Workplan updated successfully' });
  } catch (error) {
    // Send an error message if there's an error during workplan update
    console.error('Error updating workplan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to delete an existing workplan
const deleteWorkplan = (req, res) => {
  try {
    const { id } = req.params;

    connection.query("SET FOREIGN_KEY_CHECKS = 0");

    // Delete the workplan from the database
    connection.query(`
      DELETE FROM Workplan WHERE workplan_id = ?`,
      [id]);

    // Send a success message indicating the workplan has been deleted
    res.status(200).json({ message: 'Workplan deleted successfully' });
  } catch (error) {
    // Send an error message if there's an error during workplan deletion
    console.error('Error deleting workplan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Function to get all workplans
const getAllWorkplans = (req, res) => {
  try {
    // Fetch all workplans from the database
    connection.query(`
      SELECT * FROM Workplan`,
      (error, results) => {
        if (error) {
          throw error;
        }
        // Send the retrieved workplans as a JSON response
        res.status(200).json(results);
        console.log(results);
      });
  } catch (error) {
    // Send an error message if there's an error during fetching workplans
    console.error('Error fetching workplans:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Route to fetch all unique workplan days
const getWorkplanDays = (req, res) => {
  try {
    // Fetch all unique workplan days from the database
    connection.query('SELECT DISTINCT workplan_day FROM Workplan', (error, results) => {
      if (error) {
        console.error('Error fetching workplan days:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      // Send the retrieved workplan days as a JSON response
      res.status(200).json(results.map(result => result.workplan_day));
    });
  } catch (error) {
    console.error('Error fetching workplan days:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Route to fetch all unique workplan days for a user
const getWorkplanDaysByUserId = (req, res) => {
  try {


    const { userId } = req.params; // Extract the user ID from the request parameters

    // Fetch all unique workplan days from the database
    connection.query('SELECT DISTINCT workplan_day FROM Workplan where user_id = ?', [userId], (error, results) => {
      if (error) {
        console.error('Error fetching workplan days:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      // Send the retrieved workplan days as a JSON response
      res.status(200).json(results.map(result => result.workplan_day));
    });
  } catch (error) {
    console.error('Error fetching workplan days:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};




const allPendingWorkplans = (req, res) => {
  // Query the database to fetch all pending workplans
  connection.query('SELECT * FROM Workplan WHERE status = "Pending"', (error, results, fields) => {
    if (error) {
      console.error('Error fetching pending workplans:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Send the retrieved pending workplans as a response
    res.status(200).json(results);
  });
};


const pendingWorkplansByUserId = (req, res) => {
  const userId = req.params.userId;

  const sqlQuery = `SELECT Workplan.*, u.username as authorizer_username, concat(first_name,' ', u.last_name) as authorizer_fullname, u.email AS authorizer_email FROM Workplan inner JOIN User u ON Workplan.authorizer = u.user_id WHERE Workplan.status IN ("Pending", "Approved", "Declined") AND Workplan.user_id = ?;`


  // Query the database to fetch pending workplans for the specified user ID
  connection.query(sqlQuery, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching pending workplans for user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Send the retrieved pending workplans as a response
    res.status(200).json(results);
  });
};


const pendingWorkplansByauthorizer = (req, res) => {
  const userId = req.params.userId;

  const sqlQuery = `SELECT wp.*, u.username AS user_username, CONCAT(u.first_name, ' ', u.last_name) AS user_fullname, u.email AS user_email FROM Workplan AS wp INNER JOIN User AS u ON u.user_id = wp.user_id WHERE wp.authorizer = ? AND status = "Pending"`


  // Query the database to fetch pending workplans for the specified user ID
  connection.query(sqlQuery, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching pending workplans for user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    // Send the retrieved pending workplans as a response
    res.status(200).json(results);
  });
};


const approveWorkplanByUserId = async (req, res) => {
  const { Workplan_id } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date and time

  const sqlQuery = `UPDATE Workplan SET status = "Approved", authorizer = 43, approval_date = ? WHERE Workplan_id = ?`;

  // Query the database to update the status of pending workplans
  connection.query(sqlQuery, [currentDate, Workplan_id], async (error, results, fields) => {
    if (error) {
      console.error('Error updating workplans:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      // If no workplans were updated, it means there were no pending workplans
      return res.status(404).json({ message: 'No pending workplans found for the Workplan ID' });
    }

    // Send email notification for the approved workplan in the background
    const recipientEmail = 'maondohemba@ccfng.org';
    const subject = 'Workplan Approved';
    const text = `Your workplan with ID ${Workplan_id} has been approved.`;

    sendEmailInBackground({ to: recipientEmail, subject: subject, text: text });

    // Send a success response with the number of workplans updated
    res.status(200).json({ message: `Approved ${results.affectedRows} workplan(s)` });
  });
};





// this api will send the workplan to francis agim in admin so that he can assign vehicle and pilot for the week
// Function to approve workplans for vehicle assignment
const approveWorkplanForVehicleAssignment = (req, res) => {
  const { Workplan_id } = req.body;
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date and time

  // SQL query to update the status of workplans
  const sqlQuery = `UPDATE Workplan SET status = "Approved", authorizer = 56, approval_date = ? WHERE Workplan_id = ?`;

  // Execute the SQL query
  connection.query(sqlQuery, [currentDate, Workplan_id], (error, results) => {
    if (error) {
      console.error('Error updating workplans:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      // If no workplans were updated, send a 404 response
      return res.status(404).json({ message: 'No workplan found for the given ID' });
    }

    // Send a success response with the number of workplans updated
    res.status(200).json({ message: `Approved ${results.affectedRows} workplan(s)` });
  });
};


// francis agim in admin will assign, it puts the names of vehicle and pilot for each   
// Function to allocate workplans for vehicle assignment
const allocateVehicleAndPilot = (req, res) => {

  const { Workplan_id, vehicle_name, pilot_name } = req.body;

  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date and time

  const authorizerId = 56; // Set the authorizer ID

  // SQL query to update the status of workplans
  const sqlQuery = `UPDATE Workplan SET status = "Approved", authorizer = ?, approval_date = ?, vehicle_name = ?, pilot_name = ? WHERE Workplan_id = ?;`;

  // Execute the SQL query
  connection.query(sqlQuery, [authorizerId, currentDate, vehicle_name, pilot_name, Workplan_id], (error, results) => {
    if (error) {
      console.error('Error updating workplans:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      // If no workplans were updated, send a 404 response
      return res.status(404).json({ message: 'No workplan found for the given ID' });
    }

    // Send a success response with the number of workplans updated
    res.status(200).json({ message: `Approved ${results.affectedRows} workplan(s)` });
  });
};




const declineWorkplanByUserId = (req, res) => {
  const { userId, Workplan_id, declineReason } = req.body;

  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' '); // Get current date and time

  const sqlQuery = `UPDATE Workplan SET status = "Declined", authorizer = ?, decline_date = ?, decline_reason = ? WHERE Workplan_id = ?`;

  connection.query(sqlQuery, [userId, currentDate, declineReason, Workplan_id], (error, results, fields) => {
    if (error) {
      console.error('Error declining workplan:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'No pending workplans found for the user ID' });
    }

    res.status(200).json({ message: `Declined ${results.affectedRows} workplan(s)` });
  });
};


// Function to get a workplan by ID
const getWorkplanById = (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the workplan with the specified ID from the database
    connection.query(`
      SELECT * FROM Workplan WHERE workplan_id = ?`,
      [id],
      (error, results) => {
        if (error) {
          throw error;
        }
        // Check if the workplan exists
        if (results.length > 0) {
          // Send the retrieved workplan as a JSON response
          res.status(200).json(results[0]);
        } else {
          // Send a 404 error response if the workplan is not found
          res.status(404).json({ error: 'Workplan not found' });
        }
      });
  } catch (error) {
    // Send an error message if there's an error during fetching the workplan
    console.error('Error fetching workplan by ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Function to get all workplans with a specific authorizer ID, this API is for dr nnadi, it get all the workplans sent to him
const getWorkplansByAuthorizerCollate = (req, res) => {
  try {
    const authorizerId = 43; // Set the authorizer ID

    // Fetch workplans with the specified authorizer ID from the database
    connection.query(
      `SELECT CONCAT(User.first_name, ' ', User.last_name) AS full_name, Workplan.* FROM Workplan JOIN User ON Workplan.user_id = User.user_id WHERE Workplan.authorizer = ? AND Workplan.user_unit != '' AND Workplan.user_unit != 'NULL';`,
      [authorizerId],
      (error, results) => {
        if (error) {
          throw error;
        }
        // Check if any workplans are found
        if (results.length > 0) {
          // Send the retrieved workplans as a JSON response
          res.status(200).json(results);
        } else {
          // Send a 404 error response if no workplans are found
          res.status(404).json({ message: 'No workplans found for the specified authorizer' });
        }
      }
    );
  } catch (error) {
    // Send an error message if there's an error during fetching the workplans
    console.error('Error fetching workplans by authorizer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





// Function to get all workplans with a specific authorizer ID, this API is for dr nnadi, it get all the workplans sent to him
const getAllApprovedStateWorkplanForTheWeek = (req, res) => {
  try {
    const authorizerId = 56; // Set the authorizer ID

    // Fetch workplans with the specified authorizer ID from the database
    connection.query(`SELECT CONCAT(User.first_name, ' ', User.last_name) AS full_name, Workplan.* FROM Workplan JOIN User ON Workplan.user_id = User.user_id WHERE authorizer = ?  AND (user_unit IS NOT NULL AND TRIM(user_unit) != '')  AND (vehicle_name IS NOT NULL OR TRIM(vehicle_name) != '')  AND (pilot_name IS NOT NULL OR TRIM(pilot_name) != '');`,

      [authorizerId],
      (error, results) => {
        if (error) {
          throw error;
        }
        // Check if any workplans are found
        if (results.length > 0) {
          // Send the retrieved workplans as a JSON response
          res.status(200).json(results);
        } else {
          // Send a 404 error response if no workplans are found
          res.status(404).json({ message: 'No workplans found for the specified authorizer' });
        }
      }
    );
  } catch (error) {
    // Send an error message if there's an error during fetching the workplans
    console.error('Error fetching workplans by authorizer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};












// Function to get all workplans with a specific authorizer ID, this API is for francis agim, it get all the workplans sent to admin for vehicle allocation
const getWorkplansByAuthorizerAllocate = (req, res) => {
  try {
    const authorizerId = 56; // Set the authorizer ID

    // Fetch workplans with the specified authorizer ID from the database
    connection.query(
      `
      SELECT
      LOWER(CONCAT(u.first_name, ' ', u.last_name)) AS "requested by",
      w.workplan_id,
      w.user_id,
      w.workplan_type,
      w.workplan_day,
      DATE_FORMAT(w.workplan_date, '%Y-%m-%d') AS date,
      w.destination,
      w.location,
      DATE_FORMAT(w.departure_time, '%H:%i') AS time,
      w.logistic,
      w.assigned_pilot_id,
      w.implementing_team_id,
      w.authorizer,
      w.user_unit,
      w.vehicle_name,
      w.pilot_name
      FROM
      Workplan w
      JOIN
      User u ON w.user_id = u.user_id
      WHERE
      w.authorizer = ?
      AND (w.user_unit IS NOT NULL AND TRIM(w.user_unit) != '')
      AND (w.vehicle_name IS NULL OR TRIM(w.vehicle_name) = '')
      AND (w.pilot_name IS NULL OR TRIM(w.pilot_name) = '')
      `,
      [authorizerId],
      (error, results) => {
        if (error) {
          throw error;
        }
        // Check if any workplans are found
        if (results.length > 0) {
          // Send the retrieved workplans as a JSON response
          res.status(200).json(results);
        } else {
          // Send a 404 error response if no workplans are found
          res.status(404).json({ message: 'No workplans found for the specified authorizer' });
        }
      }
    );
  } catch (error) {
    // Send an error message if there's an error during fetching the workplans
    console.error('Error fetching workplans by authorizer:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Export the controller functions
module.exports = {
  createWorkplan,
  editWorkplan,
  deleteWorkplan,
  getAllWorkplans,
  getWorkplanDays,
  getWorkplanDaysByUserId,
  getWorkplanById,
  getAllApprovedStateWorkplanForTheWeek,
  checkWorkplanExists,
  allPendingWorkplans,
  pendingWorkplansByUserId,
  approveWorkplanForVehicleAssignment,
  allocateVehicleAndPilot,

  pendingWorkplansByauthorizer,
  approveWorkplanByUserId,
  declineWorkplanByUserId,
  getWorkplansByAuthorizerCollate,
  getWorkplansByAuthorizerAllocate

};
