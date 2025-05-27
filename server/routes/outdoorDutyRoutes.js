import express from 'express';
import {
  createOutdoorDutyRequest,
  getMyOutdoorDutyRequests,
  getAllOutdoorDutyRequests,
  updateOutdoorDutyRequestStatus,
  checkTodayOutdoorDuty,
} from '../controllers/outdoorDutyController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Employee routes
router.post('/', createOutdoorDutyRequest);
router.get('/my-requests', getMyOutdoorDutyRequests);
router.get('/check-today', checkTodayOutdoorDuty);

// Admin routes
router.get('/all', restrictTo('admin', 'subadmin'), getAllOutdoorDutyRequests);
router.patch('/:id', restrictTo('admin', 'subadmin'), updateOutdoorDutyRequestStatus);

export default router;