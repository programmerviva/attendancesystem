import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Restrict to admin and subadmin
router.use(restrictTo('admin', 'subadmin'));

// Settings routes
router.get('/', getSettings);
router.patch('/', updateSettings);

export default router;