import express from 'express';
import { 
  markAttendance, 
  getAttendanceHistory, 
  getTodayAttendance,
  getAttendanceSummary,
  getAllAttendance
} from '../controllers/attendanceController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', markAttendance);
router.get('/history', getAttendanceHistory);
router.get('/today', getTodayAttendance);

// Admin routes
router.get('/summary', restrictTo('admin', 'subadmin'), getAttendanceSummary);
router.get('/all', restrictTo('admin', 'subadmin'), getAllAttendance);

export default router;