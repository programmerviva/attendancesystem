import express from 'express';
import * as attendanceController from '../controllers/attendanceController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

router.post('/', attendanceController.createAttendance);
router.get('/today', attendanceController.getTodayAttendance);
router.get('/history', attendanceController.getAttendanceHistory);
router.get('/comp-off-dates', attendanceController.getCompOffDates);

// Admin routes
router.get('/employee/:employeeId', attendanceController.getEmployeeAttendance);
router.get('/all', attendanceController.getAllAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);

// New route for auto checkout
router.post('/auto-checkout', attendanceController.triggerAutoCheckout);

export default router;