// ../middleware/VerifyToken.js

const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token is present, return 401 Unauthorized status
  if (token == null) return res.sendStatus(401);

  // Verify the token using jwt.verify()
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // If the token is invalid, return 403 Forbidden status
    if (err) return res.sendStatus(403);
    
    // If the token is valid, attach the decoded email to the request object
    req.email = decoded.email;
    // Call the next middleware function in the chain
    next();
  });
};

module.exports = { verifyToken };
