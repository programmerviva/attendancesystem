import express from 'express';
import { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  updatePassword,
  protect,
  restrictTo,
  checkEmail,
  directReset
} from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);
router.post('/checkEmail', checkEmail);

// Protected routes
router.use(protect);
router.post('/updatePassword', updatePassword);

// Admin only routes
router.use(restrictTo('admin'));
router.post('/directReset', directReset);

export default router;