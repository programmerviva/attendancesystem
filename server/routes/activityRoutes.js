import express from 'express';
import { getRecentActivity } from '../controllers/activityController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin routes
router.get('/recent', restrictTo('admin', 'subadmin'), getRecentActivity);

export default router;
