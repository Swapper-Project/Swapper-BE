const mysql = require('mysql');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

// const pool = mysql.createPool({
//   connectionLimit: 25,
//   host: 'localhost',
//   port: `${process.env.DB_PORT}`,
//   user: `${process.env.DB_USER}`,
//   password: `${process.env.DB_PASS}`,
//   database: 'swapper_dev',
// });

const pool = mysql.createPool({
  connectionLimit: 25,
  host: `${process.env.DB_HOST}`,
  port: `${process.env.DB_PORT}`,
  user: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASS}`,
  database: 'Swapper_development'
});

pool.getConnection((err, conn) => {
  if (err) {
    console.log(err + ' ' + 'ERROR-CODE: ' + err.code);
  }

  if (conn) {
    conn.release();
    console.log('DB connection successful.');
  }
});

pool.query = util.promisify(pool.query);
module.exports = pool;
