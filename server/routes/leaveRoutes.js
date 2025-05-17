import express from 'express';
import { 
  createLeaveRequest, 
  getMyLeaveRequests, 
  getPendingLeaveRequests, 
  updateLeaveStatus,
  getApprovedLeaveRequests,
  getRejectedLeaveRequests,
  getAllLeaveRequests,
  getLeaveBalance,
  getCompOffDates
} from '../controllers/leaveController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', createLeaveRequest);
router.get('/', getMyLeaveRequests);
router.get('/balance', getLeaveBalance);
router.get('/compoff-dates', getCompOffDates);

// Admin routes
router.get('/pending', restrictTo('admin', 'subadmin'), getPendingLeaveRequests);
router.get('/approved', restrictTo('admin', 'subadmin'), getApprovedLeaveRequests);
router.get('/rejected', restrictTo('admin', 'subadmin'), getRejectedLeaveRequests);
router.get('/all', restrictTo('admin', 'subadmin'), getAllLeaveRequests);
router.patch('/:id', restrictTo('admin', 'subadmin'), updateLeaveStatus);

export default router;