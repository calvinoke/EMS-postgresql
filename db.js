import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: false, // Set to true if using a remote database with SSL
});

export default pool;

//  Test Database Connection (Optional)
//port const db = async () => {
//try {
  //const client = await pool.connect();
   ///nsole.log("Database connection successful!");
   //lient.release();
  //catch (error) {
  //console.error("Database connection failed:", error);
  //
//
