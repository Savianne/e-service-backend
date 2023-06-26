import dotenv from 'dotenv';
import mysql from "mysql2";

dotenv.config();
// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PSWRD,
  port: 3306,
  database: 'sandiat_centro_information_system',
  waitForConnections: true,
  connectionLimit: 5,
//   maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//   idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//   queueLimit: 0
});

export default pool;