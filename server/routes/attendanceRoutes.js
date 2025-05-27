import express from 'express';
import {
  createAttendance,
  getTodayAttendance,
  getAttendanceHistory,
  getEmployeeAttendance,
  getAllAttendance,
  getCompOffDates,
  getAttendanceSummary,
} from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', createAttendance);
router.get('/today', getTodayAttendance);
router.get('/history', getAttendanceHistory);
router.get('/compoff-dates', getCompOffDates);

// Admin routes
router.get('/employee/:employeeId', restrictTo('admin', 'subadmin'), getEmployeeAttendance);
router.get('/all', restrictTo('admin', 'subadmin'), getAllAttendance);
router.get('/summary', restrictTo('admin', 'subadmin'), getAttendanceSummary);

export default router;
