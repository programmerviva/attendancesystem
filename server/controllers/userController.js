import User from '../models/User.js';
import AppError from '../utils/appError.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
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
      count,
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
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create new user (for admin)
export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, department, designation, joiningDate, mobile } =
      req.body;

    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Find the highest userId for this year
    const latestUser = await User.find({ 
      userId: new RegExp(`^${currentYear}`) 
    }).sort({ userId: -1 }).limit(1);
    
    let newUserId;
    
    if (latestUser.length > 0) {
      // Extract the sequence number and increment
      const lastSequence = parseInt(latestUser[0].userId.substring(4), 10);
      newUserId = `${currentYear}${(lastSequence + 1).toString().padStart(4, '0')}`;
    } else {
      // First employee for this year
      newUserId = `${currentYear}0001`;
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      userId: newUserId,
      email, // Now optional
      password,
      mobile, // Add mobile number
      role: role || 'employee',
      department,
      designation,
      joiningDate,
      empId: newUserId, // Use the same ID for empId
    });

    // Remove password from response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
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
      return next(
        new AppError('This route is not for password updates. Please use /updatePassword.', 400)
      );
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updatedUser) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
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
      data: null,
    });
  } catch (err) {
    next(err);
  }
};