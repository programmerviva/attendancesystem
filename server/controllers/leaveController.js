import mongoose from 'mongoose';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Create a new leave request
export const createLeaveRequest = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason, compOffDate } = req.body;
    const userId = req.user._id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return next(new AppError('Start date cannot be after end date', 400));
    }

    // For comp off, validate that the comp off date exists and is not used
    if (leaveType === 'comp') {
      if (!compOffDate) {
        return next(new AppError('Comp off date is required for comp off leave', 400));
      }

      const user = await User.findById(userId);
      const compOffEntry = user.compOffDates.find(
        (entry) => entry.date.toISOString().split('T')[0] === compOffDate && !entry.used
      );

      if (!compOffEntry) {
        return next(new AppError('Invalid or already used comp off date', 400));
      }

      // Mark the comp off date as used
      compOffEntry.used = true;
      await user.save();
    }

    // Create leave request
    const leaveRequest = await Leave.create({
      user: userId,
      leaveType,
      startDate,
      endDate,
      reason,
      compOffDate: leaveType === 'comp' ? compOffDate : undefined,
    });

    res.status(201).json({
      status: 'success',
      data: {
        leave: leaveRequest,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all leave requests for the current user
export const getMyLeaveRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const leaveRequests = await Leave.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: leaveRequests.length,
      data: {
        leaves: leaveRequests,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get leave balance for the current user
export const getLeaveBalance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    // Get user's leave balance
    const user = await User.findById(userId);

    // Get system settings for leave balances
    const settings = await mongoose.model('Settings').findOne();

    // Calculate financial year if not provided
    let financialYearStart, financialYearEnd;
    if (!startDate || !endDate) {
      const today = dayjs();
      const month = today.month();
      const year = today.year();

      if (month < 3) {
        // Before April
        financialYearStart = `${year - 1}-04-01`;
        financialYearEnd = `${year}-03-31`;
      } else {
        financialYearStart = `${year}-04-01`;
        financialYearEnd = `${year + 1}-03-31`;
      }
    } else {
      financialYearStart = startDate;
      financialYearEnd = endDate;
    }

    // Count unused comp off dates
    const unusedCompOffDates = user.compOffDates.filter((entry) => !entry.used).length;

    // Calculate leave balance using system settings if available
    const leaveBalance = {
      sick: settings?.leaveSettings?.sickLeave || user.leaveBalance?.sick || 0,
      vacation: settings?.leaveSettings?.annualLeave || user.leaveBalance?.vacation || 0,
      short: settings?.leaveSettings?.casualLeave || user.leaveBalance?.short || 0,
      comp: unusedCompOffDates,
    };

    res.status(200).json({
      status: 'success',
      data: {
        balance: leaveBalance,
        financialYear: {
          start: financialYearStart,
          end: financialYearEnd,
        },
      },
    });
  } catch (err) {
    console.error('Error in getLeaveBalance:', err);
    next(err);
  }
};

// Get comp off dates for the current user
export const getCompOffDates = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user's comp off dates
    const user = await User.findById(userId);

    // Filter unused comp off dates
    const unusedCompOffDates = user.compOffDates
      .filter((entry) => !entry.used)
      .map((entry) => entry.date.toISOString().split('T')[0]);

    res.status(200).json({
      status: 'success',
      data: {
        dates: unusedCompOffDates,
      },
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
        select: 'fullName email department designation',
      })
      .sort({ startDate: 1 });

    res.status(200).json({
      status: 'success',
      results: pendingLeaves.length,
      data: {
        leaves: pendingLeaves,
      },
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
        select: 'fullName email department designation',
      })
      .sort({ startDate: 1 });

    res.status(200).json({
      status: 'success',
      results: approvedLeaves.length,
      data: {
        leaves: approvedLeaves,
      },
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
        select: 'fullName email department designation',
      })
      .sort({ startDate: 1 });

    res.status(200).json({
      status: 'success',
      results: rejectedLeaves.length,
      data: {
        leaves: rejectedLeaves,
      },
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
        select: 'fullName email department designation',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: allLeaves.length,
      data: {
        leaves: allLeaves,
      },
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

    // If rejecting a comp off leave that was previously approved, mark the comp off date as unused
    if (
      status === 'rejected' &&
      leaveRequest.status === 'approved' &&
      leaveRequest.leaveType === 'comp' &&
      leaveRequest.compOffDate
    ) {
      const user = await User.findById(leaveRequest.user);
      const compOffEntry = user.compOffDates.find(
        (entry) => entry.date.toISOString().split('T')[0] === leaveRequest.compOffDate && entry.used
      );

      if (compOffEntry) {
        compOffEntry.used = false;
        await user.save();
      }
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
        leave: leaveRequest,
      },
    });
  } catch (err) {
    next(err);
  }
};
