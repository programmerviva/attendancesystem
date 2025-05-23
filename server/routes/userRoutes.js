import express from 'express';
import {
  getAllUsers,
  getUserCount,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// Restrict to admin and subadmin
router.use(restrictTo('admin', 'subadmin'));

router.route('/').get(getAllUsers).post(createUser);

router.get('/count', getUserCount);

router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

export default router;
