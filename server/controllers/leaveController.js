import Leave from '../models/Leave.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

// Create a new leave request
export const createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const userId = req.user._id;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return next(new AppError('Start date cannot be after end date', 400));
    }
    
    // Create leave request
    const leaveRequest = await Leave.create({
      user: userId,
      leaveType,
      startDate,
      endDate,
      reason
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        leave: leaveRequest
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all leave requests for the current user
export const getMyLeaveRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const leaveRequests = await Leave.find({ user: userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: leaveRequests.length,
      data: {
        leaves: leaveRequests
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all pending leave requests (admin only)
export const getPendingLeaveRequests = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    const pendingLeaves = await Leave.find({ status: 'pending' })
      .populate({
        path: 'user',
        select: 'fullName email department designation'
      })
      .sort({ startDate: 1 });
    
    res.status(200).json({
      status: 'success',
      results: pendingLeaves.length,
      data: {
        leaves: pendingLeaves
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all approved leave requests (admin only)
export const getApprovedLeaveRequests = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    const approvedLeaves = await Leave.find({ status: 'approved' })
      .populate({
        path: 'user',
        select: 'fullName email department designation'
      })
      .sort({ startDate: 1 });
    
    res.status(200).json({
      status: 'success',
      results: approvedLeaves.length,
      data: {
        leaves: approvedLeaves
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all rejected leave requests (admin only)
export const getRejectedLeaveRequests = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    const rejectedLeaves = await Leave.find({ status: 'rejected' })
      .populate({
        path: 'user',
        select: 'fullName email department designation'
      })
      .sort({ startDate: 1 });
    
    res.status(200).json({
      status: 'success',
      results: rejectedLeaves.length,
      data: {
        leaves: rejectedLeaves
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all leave requests (admin only)
export const getAllLeaveRequests = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    const allLeaves = await Leave.find()
      .populate({
        path: 'user',
        select: 'fullName email department designation'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: allLeaves.length,
      data: {
        leaves: allLeaves
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update leave request status (admin only)
export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return next(new AppError('Status must be either approved or rejected', 400));
    }
    
    const leaveRequest = await Leave.findById(id);
    
    if (!leaveRequest) {
      return next(new AppError('Leave request not found', 404));
    }
    
    // Update leave request
    leaveRequest.status = status;
    leaveRequest.approvedBy = req.user._id;
    leaveRequest.approvedAt = new Date();
    
    if (remarks) {
      leaveRequest.remarks = remarks;
    }
    
    await leaveRequest.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        leave: leaveRequest
      }
    });
  } catch (err) {
    next(err);
  }
};