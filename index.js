import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pool from "./db.js"; // Import PostgreSQL pool instance
import dotenv from "dotenv";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:8081', 
    'http://localhost:8082',           // For local development (Expo or React Native development)
    'https://ems-5ypa.onrender.com',   // Your deployed backend URL (e.g., Render, Heroku, etc.)
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow cookies to be sent if needed (for sessions, tokens, etc.)
}));

// Middleware setup
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Test Database Connection (Optional)
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

// Table creation logic
const userTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log("Users table created successfully");
  } catch (error) {
    console.error("Error creating users table:", error);
  }
};

const employeeTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      employee_id VARCHAR(50) UNIQUE NOT NULL,
      designation VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      date_of_birth DATE NOT NULL,
      joining_date DATE NOT NULL,
      salary DECIMAL(10, 2) NOT NULL,
      address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log("Employees table created successfully");
  } catch (error) {
    console.error("Error creating employees table:", error);
  }
};

const attendanceTables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS attendance (
      id SERIAL PRIMARY KEY,
      employee_id VARCHAR(50) NOT NULL,
      employee_name VARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Halfday', 'Absent', 'Holiday')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
    );
  `;

  try {
    await pool.query(query);
    console.log("attendance table created successfully");
  } catch (error) {
    console.error("Error creating attendance table:", error);
  }
};


// Call table creation functions
const createTables = async () => {
  await userTables();
  await employeeTables();
  await attendanceTables();
};

// Run table creation before server starts
createTables().then(() => {
  // After tables are created, start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error) => {
  console.error("Error creating tables:", error);
});

// Routes setup
app.use("/api", employeeRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/auth", authRoutes);

// Basic route to test server
app.get("/", (req, res) => {
  res.send("Server is running!");
});
