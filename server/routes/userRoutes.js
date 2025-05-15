import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserCount
} from '../controllers/userController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes restricted to admin and subadmin
router.use(restrictTo('admin', 'subadmin'));

router.get('/', getAllUsers);
router.get('/count', getUserCount);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;