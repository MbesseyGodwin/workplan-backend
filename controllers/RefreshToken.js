// ../controllers/RefreshToken.js

const jwt = require('jsonwebtoken');
const { connection } = require('../config/Database');

const refreshToken = (req, res) => {
  try {
    // Extract the refresh token from the request cookies
    const refreshToken = req.cookies.refreshToken;

    // If no refresh token is present, return 401 Unauthorized status
    if (!refreshToken) return res.sendStatus(401);

    // Query the database to find the user associated with the refresh token
    connection.query(
      `SELECT user_id, first_name, last_name, email, role_id, unit FROM User WHERE refresh_token = ?`,
      [refreshToken],
      (error, result) => {
        if (error) {
          console.log('Error:', error);
          return res.sendStatus(500);
        } else {
          // If no user is found with the refresh token, return 403 Forbidden status
          if (!result[0]) return res.sendStatus(403);

          // Verify the refresh token and decode its payload
          jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.sendStatus(403);

            // If refresh token is valid, generate a new access token
            const { user_id: userID, first_name: fName, last_name: lName, email, role_id: roleID, unit: user_unit } = result[0];
            const accessToken = jwt.sign({ userID, fName, lName, email, roleID, user_unit }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '60s' });

            // Send the new access token in the response
            res.json({ accessToken });
          });
        }
      }
    );
  } catch (error) {
    console.log('Error:', error);
    res.sendStatus(500);
  }
};

module.exports = { refreshToken };
