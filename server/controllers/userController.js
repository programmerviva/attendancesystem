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
    const { fullName, userId, email, password, role, department, designation, joiningDate } =
      req.body;

    // Check if userId already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return next(new AppError('User ID already exists', 400));
    }

    // Auto-generate empId
    let newEmpId;
    // Find last empId (numeric only)
    const lastUser = await User.findOne({ empId: { $ne: null } }).sort({ empId: -1 });
    if (lastUser && lastUser.empId) {
      // If empId is numeric, increment, else fallback to 1001
      const lastEmpIdNum = parseInt(lastUser.empId, 10);
      newEmpId = isNaN(lastEmpIdNum) ? '1001' : String(lastEmpIdNum + 1);
    } else {
      newEmpId = '1001';
    }

    // Create new user
    const newUser = await User.create({
      fullName,
      userId, // Store without PF prefix
      email, // Now optional
      password,
      role: role || 'employee',
      department,
      designation,
      joiningDate,
      empId: newEmpId,
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