import express from 'express';
import { 
  markAttendance, 
  getAttendanceHistory, 
  getTodayAttendance 
} from '../controllers/attendanceController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/', markAttendance);
router.get('/history', getAttendanceHistory);
router.get('/today', getTodayAttendance);

export default router;