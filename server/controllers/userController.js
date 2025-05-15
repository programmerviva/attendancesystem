import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get user count
export const getUserCount = async (req, res, next) => {
  try {
    const count = await User.countDocuments({ role: { $ne: 'admin' } });
    
    res.status(200).json({
      status: 'success',
      count
    });
  } catch (err) {
    next(err);
  }
};

// Get user by ID
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    // Don't allow password updates through this route
    if (req.body.password) {
      return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');
    
    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};