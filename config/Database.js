// ../config/Database.js

const mysql = require('mysql2');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();


// Database configuration object to local database
// const config = {
//   host: process.env.LOCAL_MYSQL_HOST,
//   user: process.env.LOCAL_MYSQL_USERNAME,
//   password: process.env.LOCAL_MYSQL_PASSWORD,
//   database: process.env.LOCAL_MYSQL_DB_NAME,
// };


// Database configuration object to hosted database
const config = {
  host: process.env.REMOTE_MYSQL_HOST,
  user: process.env.REMOTE_MYSQL_USERNAME,
  password: process.env.REMOTE_MYSQL_PASSWORD,
  database: process.env.REMOTE_MYSQL_DB_NAME,
};


// Create a connection pool using the configuration
const connection = mysql.createPool(config);

// Export the connection pool for use in other files
module.exports = { connection };