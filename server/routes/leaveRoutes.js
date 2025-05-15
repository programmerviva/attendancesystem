import express from 'express';
import { 
  createLeaveRequest, 
  getMyLeaveRequests, 
  getPendingLeaveRequests, 
  updateLeaveStatus 
} from '../controllers/leaveController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', createLeaveRequest);
router.get('/', getMyLeaveRequests);

// Admin routes
router.get('/pending', restrictTo('admin', 'subadmin'), getPendingLeaveRequests);
router.patch('/:id', restrictTo('admin', 'subadmin'), updateLeaveStatus);

export default router;