import pool from "../db.js"; // PostgreSQL Pool instance

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

    

    res.status(201).json({ message: "Attendance recorded successfully", attendance: result.rows[0] });
  } catch (error) {
    console.error("Error in addAttendance:", error);
    res.status(500).json({ message: "Error submitting attendance", error });
  }
};


export const getAttendance = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM attendance"); // Get all data
    //console.log("🛠 All Attendance Data:", result.rows); // Debug log

    res.status(200).json({ message: "Attendance data retrieved successfully", attendanceData: result.rows });
  } catch (error) {
    console.error("❌ Error in getAttendance:", error);
    res.status(500).json({ message: "Error fetching attendance data", error });
  }
};




// Get Single Attendance by ID
export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM attendance WHERE id = $1", [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Attendance record not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error in getAttendanceById:", error);
    res.status(500).json({ message: "Error fetching attendance record", error });
  }
};

// Update Attendance by ID
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      "UPDATE attendance SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Attendance record not found" });
    res.status(200).json({ message: "Attendance updated successfully", updatedAttendance: result.rows[0] });
  } catch (error) {
    console.error("Error in updateAttendance:", error);
    res.status(500).json({ message: "Error updating attendance", error });
  }
};

// Delete Attendance by ID
export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM attendance WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Attendance record not found" });
    res.status(200).json({ message: "Attendance deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAttendance:", error);
    res.status(500).json({ message: "Error deleting attendance", error });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        e.employee_id,
        e.employee_name,
        e.designation,
        e.salary,
        COUNT(a.status) FILTER (WHERE a.status = 'present') AS present,
        COUNT(a.status) FILTER (WHERE a.status = 'absent') AS absent,
        COUNT(a.status) FILTER (WHERE a.status = 'halfday') AS halfday,
        COUNT(a.status) FILTER (WHERE a.status = 'holiday') AS holiday
      FROM employees e
      LEFT JOIN attendance a ON e.employee_id = a.employee_id
      GROUP BY e.employee_id, e.employee_name, e.designation, e.salary;`
    );

   // console.log("report", result.rows)

    res.status(200).json({ message: "Attendance report generated successfully", report: result.rows });
    
  } catch (error) {
    console.error("Error in getAttendanceReport:", error);
    res.status(500).json({ message: "Error generating the report", error });
  }
};
