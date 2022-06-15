const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "103.171.26.85",
  user: "fullstacktest",
  password: "test1234",
  database: "fstest",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

module.exports = { promisePool };
