const jwt = require('jsonwebtoken');
const { connection } = require('../config/Database');

const refreshToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not provided' });
    }

    connection.query('SELECT * FROM User WHERE refresh_token = ?', [refreshToken], async (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (!results[0]) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      try {
        const { user_id, first_name, last_name, email, role_id, unit } = results[0];
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            console.error('Token verification error:', err);
            return res.status(403).json({ error: 'Invalid refresh token' });
          }
          const accessToken = jwt.sign({ user_id, first_name, last_name, email, role_id, unit }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
          res.json({ accessToken });
        });
      } catch (err) {
        console.error('Error generating access token:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { refreshToken };
