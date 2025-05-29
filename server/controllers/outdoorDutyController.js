import OutdoorDuty from '../models/OutdoorDuty.js';
import Attendance from '../models/Attendance.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Create outdoor duty request
export const createOutdoorDutyRequest = async (req, res, next) => {
  try {
    const { date, startTime, endTime, reason } = req.body;
    const userId = req.user._id;

    // Validate date
    if (!date) {
      return next(new AppError('Date is required', 400));
    }

    // Validate start and end times
    if (!startTime) {
      return next(new AppError('Start time is required', 400));
    }

    if (!endTime) {
      return next(new AppError('End time is required', 400));
    }

    // Validate reason
    if (!reason) {
      return next(new AppError('Reason is required', 400));
    }

    // Format date to YYYY-MM-DD
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    
    // Check if date is in the past (only allow past dates for OD requests)
    const requestDate = dayjs(formattedDate);
    const today = dayjs().startOf('day');
    
    if (requestDate.isAfter(today)) {
      return next(new AppError('Outdoor duty can only be requested for past dates', 400));
    }

    // Check if request already exists for this date with overlapping time
    const existingRequests = await OutdoorDuty.find({
      user: userId,
      date: formattedDate,
    });

    if (existingRequests.length > 0) {
      // Check for time overlap with existing requests
      const newStartTime = dayjs(startTime);
      const newEndTime = dayjs(endTime);
      
      const hasOverlap = existingRequests.some(request => {
        const existingStartTime = dayjs(request.startTime);
        const existingEndTime = dayjs(request.endTime);
        
        // Check if new time range overlaps with existing time range
        return (
          (newStartTime.isBefore(existingEndTime) && newEndTime.isAfter(existingStartTime)) ||
          newStartTime.isSame(existingStartTime) || 
          newEndTime.isSame(existingEndTime)
        );
      });
      
      if (hasOverlap) {
        return next(new AppError('Outdoor duty request with overlapping time already exists for this date', 400));
      }
    }

    // Create new outdoor duty request
    const outdoorDutyRequest = new OutdoorDuty({
      user: userId,
      date: formattedDate,
      startTime,
      endTime,
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

        // Calculate outdoor duty hours
        const odStartTime = dayjs(outdoorDutyRequest.startTime);
        const odEndTime = dayjs(outdoorDutyRequest.endTime);
        const odHours = odEndTime.diff(odStartTime, 'hour', true).toFixed(2);
        const parsedOdHours = parseFloat(odHours);
        
        // Create outdoor duty details
        const outdoorDutyDetails = {
          startTime: outdoorDutyRequest.startTime,
          endTime: outdoorDutyRequest.endTime,
          reason: outdoorDutyRequest.reason || '',
          outdoorDutyId: outdoorDutyRequest._id
        };

        if (!attendance) {
          // Create new attendance record for full day OD
          attendance = new Attendance({
            user: outdoorDutyRequest.user,
            date: outdoorDutyRequest.date,
            outdoorDutyHours: parsedOdHours,
            totalHours: parsedOdHours,
            outdoorDutyDetails: outdoorDutyDetails,
            remarks: `Outdoor duty approved by ${req.user.fullName || 'Admin'}`,
          });
          
          // Set status based on OD hours
          if (parsedOdHours >= 7) {
            attendance.status = 'present';
          } else if (parsedOdHours >= 5) {
            attendance.status = 'early-leave';
          } else if (parsedOdHours >= 4) {
            attendance.status = 'half-day';
          } else {
            attendance.status = 'early-leave';
          }
        } else {
          // Update existing attendance record
          attendance.outdoorDutyHours = parsedOdHours;
          attendance.outdoorDutyDetails = outdoorDutyDetails;
          
          // If there are work hours, add them to total hours
          if (attendance.workHours) {
            attendance.totalHours = parseFloat((attendance.workHours + parsedOdHours).toFixed(2));
          } else {
            attendance.totalHours = parsedOdHours;
          }
          
          // Always update status based on total hours, regardless of check-in/out
          // This handles cases where employee was marked absent but had full day OD
          if (attendance.totalHours >= 7) {
            attendance.status = 'present';
          } else if (attendance.totalHours >= 5) {
            attendance.status = 'early-leave';
          } else if (attendance.totalHours >= 4) {
            attendance.status = 'half-day';
          } else {
            attendance.status = 'early-leave';
          }
          
          // Add remark about OD approval
          attendance.remarks = attendance.remarks 
            ? `${attendance.remarks}; Outdoor duty approved by ${req.user.fullName || 'Admin'}`
            : `Outdoor duty approved by ${req.user.fullName || 'Admin'}`;
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