import pool from "../db.js"; // PostgreSQL Pool instance

// Add or update attendance
export const addAttendance = async (req, res) => {
  try {
    const { employee_id, employee_name, date, status } = req.body;

    const query = `
      INSERT INTO attendance (employee_id, employee_name, date, status) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (employee_id, date) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        employee_name = COALESCE(EXCLUDED.employee_name, attendance.employee_name)
      RETURNING *;
    `;

    const result = await pool.query(query, [employee_id, employee_name, date, status]);

    res.status(201).json({
      message: "Attendance recorded successfully",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error in addAttendance:", error);
    res.status(500).json({ message: "Error submitting attendance", error });
  }
};

// Get all attendance records
export const getAttendance = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM attendance");

    res.status(200).json({
      message: "Attendance data retrieved successfully",
      attendanceData: result.rows,
    });
  } catch (error) {
    console.error("❌ Error in getAttendance:", error);
    res.status(500).json({ message: "Error fetching attendance data", error });
  }
};

// Get attendance by employee ID and date
export const getAttendanceByEmployeeAndDate = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  try {
    const result = await pool.query(
      "SELECT * FROM attendance WHERE employee_id = $1 AND date = $2",
      [id, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No attendance record found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(" Error in getAttendanceByEmployeeAndDate:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update attendance by employee ID and date
export const updateAttendanceByEmployeeAndDate = async (req, res) => {
  const { id } = req.params;
  const { status, date } = req.body;

  try {
    const result = await pool.query(
      "UPDATE attendance SET status = $1 WHERE employee_id = $2 AND date = $3 RETURNING *",
      [status, id, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.status(200).json({
      message: "Attendance updated successfully",
      updatedAttendance: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error in updateAttendanceByEmployeeAndDate:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete attendance by attendance table ID (not employee ID)
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM attendance WHERE employee_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("❌ Error in deleteAttendance:", error);
    res.status(500).json({ message: "Error deleting attendance", error });
  }
};

// Attendance summary report
export const getAttendanceReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.employee_id,
        e.employee_name,
        e.designation,
        e.salary,
        COUNT(a.status) FILTER (WHERE a.status = 'Present') AS present,
        COUNT(a.status) FILTER (WHERE a.status = 'Absent') AS absent,
        COUNT(a.status) FILTER (WHERE a.status = 'Halfday') AS halfday,
        COUNT(a.status) FILTER (WHERE a.status = 'Holiday') AS holiday
      FROM employees e
      LEFT JOIN attendance a ON e.employee_id = a.employee_id
      GROUP BY e.employee_id, e.employee_name, e.designation, e.salary;
    `);

    res.status(200).json({
      message: "Attendance report generated successfully",
      report: result.rows,
    });
  } catch (error) {
    console.error("❌ Error in getAttendanceReport:", error);
    res.status(500).json({ message: "Error generating the report", error });
  }
};
