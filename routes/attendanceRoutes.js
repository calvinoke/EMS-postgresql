import express from "express";
import * as attendanceController from "../controllers/attendanceController.js";

const router = express.Router();

// Add or update attendance
router.post("/attendance", attendanceController.addAttendance);

// Get all attendance records
router.get("/attendance", attendanceController.getAttendance);

// Get attendance by employee ID and date (via query param)
router.get("/attendance/:id", attendanceController.getAttendanceByEmployeeAndDate);

// Update attendance by employee ID and date (from body)
router.put("/attendance/:id", attendanceController.updateAttendanceByEmployeeAndDate);

// Delete attendance by record ID
router.delete("/attendance/:id", attendanceController.deleteAttendance);

// Attendance report for all employees
router.get("/attendance-report-all-employees", attendanceController.getAttendanceReport);

export default router;
