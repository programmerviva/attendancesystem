import express from 'express';
import { 
  getSettings, 
  updateSettings, 
  addHoliday, 
  updateHoliday, 
  deleteHoliday, 
  getHolidays 
} from '../controllers/settingsController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Settings routes
router.get('/', protect, restrictTo('admin', 'subadmin'), getSettings);
router.patch('/', protect, restrictTo('admin', 'subadmin'), updateSettings);

// Holiday routes - allow all authenticated users to view holidays
router.get('/holidays', getHolidays);

// Admin-only holiday management routes
router.post('/holidays', restrictTo('admin', 'subadmin'), addHoliday);
router.patch('/holidays/:id', restrictTo('admin', 'subadmin'), updateHoliday);
router.delete('/holidays/:id', restrictTo('admin', 'subadmin'), deleteHoliday);

export default router;