import express from "express";
import * as employeeController from "../controllers/employeeController.js";

const router = express.Router();

router.post("/employees", employeeController.addEmployee);
router.get("/employees", employeeController.getAllEmployees);
router.get("/employees/:id", employeeController.getEmployeeById);
router.put("/employees/:id", employeeController.updateEmployee);
router.delete("/employees/:id", employeeController.deleteEmployee);

export default router;
