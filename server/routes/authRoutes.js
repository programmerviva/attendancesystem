import express from 'express';
import {
  signup,
  login,
  protect,
  restrictTo
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

// Protected route example
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// Admin-only route example
router.get('/admin-dashboard', protect, restrictTo('admin'), (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Admin dashboard content'
    }
  });
});

export default router;