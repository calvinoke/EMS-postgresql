import express from "express";
import * as attendanceController from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/attendance", attendanceController.addAttendance);
router.get("/attendance", attendanceController.getAttendance);
router.get("/attendance/:id", attendanceController.getAttendanceById);
router.put("/attendance/:id", attendanceController.updateAttendance);
router.delete("/attendance/:id", attendanceController.deleteAttendance);
router.get("/attendance-report-all-employees", attendanceController.getAttendanceReport);

export default router;
