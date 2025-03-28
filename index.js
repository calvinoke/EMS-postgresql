import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import db from "./db.js"; // Import PostgreSQL pool instance
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import authRoutes from "./routes/authRoutes.js"; // Import auth routes

const app = express();
const port = 8000;

const allowedOrigins = [
  "http://localhost:8081",      // Metro Bundler (Dev)   // Your local IP (Dev)
  "http://10.0.2.2:8081",       // Android Emulator (Dev)
  "file://*",                   // React Native Production (APK)
  null                          // Some React Native requests have no origin
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: false, // If using cookies or authentication
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// No need to call db() since it's already a pool instance
// You can optionally test the connection if needed:
db.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('Error connecting to PostgreSQL:', err));

app.use("/api", employeeRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/auth", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
