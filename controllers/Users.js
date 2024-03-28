// ../controllers/Users.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { connection } = require('../config/Database');

// Retrieve all users from the database
const getUsers = (req, res) => {
  try {
    connection.query(`SELECT * FROM User`, (error, result) => {
      if (error) {
        console.log(error);
        res.sendStatus(400); // Send a status of 400 if there's an error
      } else {
        res.json(result); // Send the retrieved users as JSON response
      }
    });
  } catch (error) {
    res.status(400).send(`Error retrieving users. ${JSON.stringify(error?.message)}`); // Send a status of 400 if there's an error
  }
};


// Sign up a new user
const signupUser = (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Hash the user's password before storing it in the database
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert the new user data into the database
    connection.query(`
      INSERT INTO User (username, password, email, first_name, last_name) 
      VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, email, firstName, lastName]);

    // Send a success message indicating the new user has been added
    res.send(`Added ${firstName} ${lastName} as a new user.`);
  } catch (error) {
    // Send an error message if there's an error during user creation
    res.status(400).send(`Error creating the user. ${JSON.stringify(error?.message)}`);
  }
};


// Log in an existing user
// Log in an existing user
const loginUser = (req, res) => {
  try {
    const { email, password } = req.body;

    // Query the database to find the user with the provided email
    connection.query(`SELECT * FROM User WHERE email = ?`, [email], (error, result) => {
      if (error) {
        console.log('Error:', error);
        res.send(`Error logging in the user. ${JSON.stringify(error?.message)}`);
      } else {
        // If no user is found with the provided email, return a 401 Unauthorized status
        if (!result.length) {
          return res.status(401).send('wrong email or password');
        }

        // Compare the provided password with the hashed password stored in the database
        const arePasswordsMatching = bcrypt.compareSync(password, result[0].password);

        // If passwords don't match, return a 401 Unauthorized status
        if (!arePasswordsMatching) {
          return res.status(401).send('wrong email or password');
        }

        // Extract user information from the query result
        const { user_id: userID, role_id: roleID, first_name: fName, last_name: lName, email } = result[0];

        // Generate an access token and a refresh token for the user
        const accessToken = jwt.sign({ userID, fName, lName, email, roleID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });
        const refreshToken = jwt.sign({ userID, fName, lName, email, roleID }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Update the user's refresh token in the database
        connection.query(`UPDATE User SET refresh_token = "${refreshToken}" WHERE user_id = ${userID}`);

        // Set the refresh token in a cookie with HttpOnly and Max-Age options
        res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });

        // Send the access token in the response
        res.status(200).json({ accessToken });
      }
    });
  } catch (error) {
    console.log('Error:', error);
    res.send(`Error logging in the user. ${JSON.stringify(error?.message)}`);
  }
};


// Log out a user
const logoutUser = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // If no refresh token is present, return a 204 No Content status
  if (!refreshToken) return res.sendStatus(204);

  // Query the database to find the user with the provided refresh token
  connection.query(`SELECT user_id FROM User WHERE refresh_token = "${refreshToken}"`, (error, result) => {
    if (error) {
      console.log('Error:', error);
      res.send(`Error logging out the user. ${JSON.stringify(error?.message)}`);
    } else {
      // If no user is found with the refresh token, return a 204 No Content status
      if (!result[0]) return res.sendStatus(204);

      // Extract the user ID from the query result
      const userID = result[0].user_id;

      // Update the user's refresh token to null in the database
      connection.query(`UPDATE User SET refresh_token = null WHERE user_id = ${userID}`, (error) => {
        if (error) {
          console.log('Error:', error);
          res.send(`Error logging out the user. ${JSON.stringify(error?.message)}`);
        } else {
          // Clear the refresh token cookie
          res.clearCookie('refreshToken');
          // Return a 200 OK status
          return res.sendStatus(200);
        }
      });
    }
  });
};

// Edit a user's information
const editUser = (req, res) => {
  try {
    const { userID } = req.params;
    const { username, firstName, lastName, email } = req.body;

    // Update the user's information in the database
    connection.query(`UPDATE User SET username = ?, first_name = ?, last_name = ?, email = ? WHERE user_id = ?`,
      [username, firstName, lastName, email, userID]);

    // Send a success message indicating the user's information has been updated
    res.send(`User with ID ${userID} updated successfully.`);
  } catch (error) {
    // Send an error message if there's an error during user update
    res.status(400).send(`Error updating the user. ${JSON.stringify(error?.message)}`);
  }
};

// Delete a user
const deleteUser = (req, res) => {
  try {
    const { userID } = req.params;

    // Delete the user from the database
    connection.query(`DELETE FROM User WHERE user_id = ?`, [userID]);

    // Send a success message indicating the user has been deleted
    res.send(`User with ID ${userID} deleted successfully.`);
  } catch (error) {
    // Send an error message if there's an error during user deletion
    res.status(400).send(`Error deleting the user. ${JSON.stringify(error?.message)}`);
  }
};


// View user details
const userDetails = (req, res) => {
  try {
    const { userID } = req.params;

    // Query the database to retrieve user details by user ID
    connection.query(`SELECT * FROM User WHERE user_id = ?`, [userID], (error, result) => {
      if (error) {
        console.error('Error retrieving user details:', error);
        return res.status(400).send(`Error retrieving user details: ${error.message}`);
      }

      // If no user is found with the provided ID, return a 404 Not Found status
      if (result.length === 0) {
        return res.status(404).send(`User with ID ${userID} not found.`);
      }

      // Send the user details as a JSON response
      res.json(result[0]);
    });
  } catch (error) {
    // Send an error message if there's an error during user details retrieval
    console.error('Error retrieving user details:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
};


module.exports = { getUsers, signupUser, loginUser, logoutUser, editUser, deleteUser, userDetails };
