import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false, // Use SSL if required
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
