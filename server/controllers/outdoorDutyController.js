import OutdoorDuty from '../models/OutdoorDuty.js';
import Attendance from '../models/Attendance.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Create outdoor duty request
export const createOutdoorDutyRequest = async (req, res, next) => {
  try {
    const { date, reason } = req.body;
    const userId = req.user._id;

    // Validate date
    if (!date) {
      return next(new AppError('Date is required', 400));
    }

    // Validate reason
    if (!reason) {
      return next(new AppError('Reason is required', 400));
    }

    // Format date to YYYY-MM-DD
    const formattedDate = dayjs(date).format('YYYY-MM-DD');

    // Check if request already exists for this date
    const existingRequest = await OutdoorDuty.findOne({
      user: userId,
      date: formattedDate,
    });

    if (existingRequest) {
      return next(new AppError('Outdoor duty request already exists for this date', 400));
    }

    // Create new outdoor duty request
    const outdoorDutyRequest = new OutdoorDuty({
      user: userId,
      date: formattedDate,
      reason,
    });

    await outdoorDutyRequest.save();

    res.status(201).json({
      status: 'success',
      data: {
        outdoorDutyRequest,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all outdoor duty requests for current user
export const getMyOutdoorDutyRequests = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;

    let query = { user: userId };

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const outdoorDutyRequests = await OutdoorDuty.find(query).sort({ date: -1 });

    res.status(200).json({
      status: 'success',
      data: {
        outdoorDutyRequests: outdoorDutyRequests || [],
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
      data: {
        outdoorDutyRequests: [],
      },
    });
  }
};

// Get all outdoor duty requests (admin only)
export const getAllOutdoorDutyRequests = async (req, res, next) => {
  try {
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    const { startDate, endDate, status } = req.query;

    let query = {};

    // Add date range filter if provided
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Add status filter if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    let outdoorDutyRequests = [];
    try {
      outdoorDutyRequests = await OutdoorDuty.find(query)
        .populate({
          path: 'user',
          select: 'fullName email department designation',
        })
        .sort({ date: -1 });
      
      // Ensure user data is properly formatted
      outdoorDutyRequests = outdoorDutyRequests.map(duty => {
        // Create a safe copy of the document
        const safeDuty = duty.toObject();
        
        // Ensure user object is properly formatted
        if (safeDuty.user && typeof safeDuty.user === 'object') {
          // Keep it as is
        } else {
          // If user is not properly populated, set to a safe default
          safeDuty.user = { fullName: 'Unknown', email: '', department: '', designation: '' };
        }
        
        return safeDuty;
      });
    } catch (findError) {
      console.error('Error querying outdoor duty requests:', findError);
      outdoorDutyRequests = [];
    }

    // Always return an array, even if empty
    res.status(200).json({
      status: 'success',
      data: {
        outdoorDutyRequests: outdoorDutyRequests || [],
      },
    });
  } catch (err) {
    // Return empty array on error to prevent client-side crashes
    console.error('Error in getAllOutdoorDutyRequests:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch outdoor duty requests',
      data: {
        outdoorDutyRequests: [],
      },
    });
  }
};

// Approve or reject outdoor duty request (admin only)
export const updateOutdoorDutyRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    // Validate status
    if (!status || !['approved', 'rejected'].includes(status)) {
      return next(new AppError('Status must be either approved or rejected', 400));
    }

    // Find the outdoor duty request
    const outdoorDutyRequest = await OutdoorDuty.findById(id);

    if (!outdoorDutyRequest) {
      return next(new AppError('Outdoor duty request not found', 404));
    }

    // Update status
    outdoorDutyRequest.status = status;
    outdoorDutyRequest.approvedBy = req.user._id;
    outdoorDutyRequest.approvedAt = Date.now();
    
    if (remarks) {
      outdoorDutyRequest.remarks = remarks;
    }

    await outdoorDutyRequest.save();

    // If approved, create or update attendance record for that day
    if (status === 'approved') {
      try {
        // Check if attendance record exists for that day
        let attendance = await Attendance.findOne({
          user: outdoorDutyRequest.user,
          date: outdoorDutyRequest.date,
        });

        // Create a safe outdoorDutyRequest object for attendance
        const safeOutdoorDutyRequest = {
          status: 'approved',
          reason: outdoorDutyRequest.reason || '',
          approvedBy: req.user._id,
          approvedAt: Date.now(),
        };

        if (!attendance) {
          // Create new attendance record
          attendance = new Attendance({
            user: outdoorDutyRequest.user,
            date: outdoorDutyRequest.date,
            status: 'outdoor-duty',
            isOutdoorDuty: true,
            outdoorDutyRequest: safeOutdoorDutyRequest,
            remarks: `Outdoor duty approved by ${req.user.fullName || 'Admin'}`,
          });
        } else {
          // Update existing attendance record
          attendance.status = 'outdoor-duty';
          attendance.isOutdoorDuty = true;
          attendance.outdoorDutyRequest = safeOutdoorDutyRequest;
          attendance.remarks = `Outdoor duty approved by ${req.user.fullName || 'Admin'}`;
        }

        await attendance.save();
      } catch (attendanceErr) {
        console.error('Error updating attendance record:', attendanceErr);
        // Continue even if attendance update fails
      }
    }

    // Return a safe version of the object
    const safeResponse = {
      _id: outdoorDutyRequest._id,
      user: outdoorDutyRequest.user,
      date: outdoorDutyRequest.date,
      reason: outdoorDutyRequest.reason || '',
      status: outdoorDutyRequest.status,
      remarks: outdoorDutyRequest.remarks || '',
      approvedBy: outdoorDutyRequest.approvedBy,
      approvedAt: outdoorDutyRequest.approvedAt,
      createdAt: outdoorDutyRequest.createdAt,
      updatedAt: outdoorDutyRequest.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: {
        outdoorDutyRequest: safeResponse,
      },
    });
  } catch (err) {
    console.error('Error in updateOutdoorDutyRequestStatus:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update outdoor duty request',
      data: {
        outdoorDutyRequest: null,
      },
    });
  }
};

// Check if user has approved outdoor duty for today
export const checkTodayOutdoorDuty = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().format('YYYY-MM-DD');

    const outdoorDuty = await OutdoorDuty.findOne({
      user: userId,
      date: today,
      status: 'approved',
    });

    res.status(200).json({
      status: 'success',
      data: {
        hasApprovedOutdoorDuty: !!outdoorDuty,
        outdoorDuty: outdoorDuty || null,
      },
    });
  } catch (err) {
    res.status(200).json({
      status: 'success',
      data: {
        hasApprovedOutdoorDuty: false,
        outdoorDuty: null,
      },
    });
  }
};