import express from 'express';
import {
  getEmployeeDashboard,
  getEmployeeProfile,
  updateEmployeeProfile,
} from '../controllers/employeeController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.get('/dashboard', getEmployeeDashboard);
router.get('/profile', getEmployeeProfile);
router.patch('/profile', updateEmployeeProfile);

export default router;
