import pool from "../db.js"; // Assuming you've set up pg Pool instance in db.js

// Create Employee
export const addEmployee = async (req, res) => {
  try {
    const {
      employee_name,
      employee_id,
      designation,
      phone_number,
      date_of_birth,
      joining_date,
      salary,
      address,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO employees (employee_name, employee_id, designation, phone_number, date_of_birth, joining_date, salary, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [employee_name, employee_id, designation, phone_number, date_of_birth, joining_date, salary, address]
    );

    res.status(201).json({ message: "Employee saved successfully", employee: result.rows[0] });
  } catch (error) {
    console.log("Error creating employee", error);
    res.status(500).json({ message: "Failed to add an employee", error });
  }
};

// Get All Employees
export const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM employees");
    res.status(200).json({ message: "Retrieved all employees", employees: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve employees", error });
  }
};

// Get Single Employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM employees WHERE employee_id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee", error });
  }
};

// Update Employee by ID
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_name,
      employee_id,
      designation,
      phone_number,
      date_of_birth,
      joining_date,
      salary,
      address,
    } = req.body;

    const result = await pool.query(
      `UPDATE employees
       SET employee_name = $1, employee_id = $2, designation = $3, phone_number = $4, 
           date_of_birth = $5, joining_date = $6, salary = $7, address = $8
       WHERE employee_id = $9
       RETURNING *`,
      [
        employee_name,
        employee_id,
        designation,
        phone_number,
        date_of_birth,
        joining_date,
        salary,
        address,
        id,
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee updated successfully", updatedEmployee: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating employee", error });
  }
};

// Delete Employee by ID
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM employees WHERE employee_id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Employee not found" });
    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting employee", error });
  }
};
