import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import AppError from '../utils/appError.js';
import dayjs from 'dayjs';

// Create or update attendance record
export const createAttendance = async (req, res, next) => {
  try {
    const { type, latitude, longitude, address, time } = req.body;
    const userId = req.user._id;
    
    // Validate type
    if (!['checkin', 'checkout'].includes(type)) {
      return next(new AppError('Type must be either checkin or checkout', 400));
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = dayjs(time).format('YYYY-MM-DD');
    
    // Check if attendance record exists for today
    let attendance = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    // If no attendance record exists, create one
    if (!attendance) {
      attendance = new Attendance({
        user: userId,
        date: today,
        status: 'present' // Default status
      });
    }
    
    // Update check-in or check-out
    if (type === 'checkin') {
      // Check if already checked in
      if (attendance.checkIn && attendance.checkIn.time) {
        return next(new AppError('Already checked in today', 400));
      }
      
      attendance.checkIn = {
        time,
        latitude,
        longitude,
        address
      };
      
      // Determine status based on check-in time
      const checkInHour = dayjs(time).hour();
      const checkInMinute = dayjs(time).minute();
      
      if (checkInHour < 10 || (checkInHour === 10 && checkInMinute < 30)) {
        attendance.status = 'present';
      } else if (checkInHour < 13 || (checkInHour === 13 && checkInMinute === 0)) {
        attendance.status = 'late';
      } else {
        attendance.status = 'half-day';
      }
      
      // Check if it's a weekend (Sunday = 0, Saturday = 6)
      const dayOfWeek = dayjs(time).day();
      if (dayOfWeek === 0) { // Sunday
        // Add to comp off dates if it's a Sunday
        const user = await User.findById(userId);
        user.compOffDates.push({
          date: new Date(today),
          used: false
        });
        await user.save();
      }
    } else {
      // Check if already checked out
      if (attendance.checkOut && attendance.checkOut.time) {
        return next(new AppError('Already checked out today', 400));
      }
      
      // Check if checked in first
      if (!attendance.checkIn || !attendance.checkIn.time) {
        return next(new AppError('Must check in before checking out', 400));
      }
      
      attendance.checkOut = {
        time,
        latitude,
        longitude,
        address
      };
      
      // Calculate work hours
      const checkInTime = dayjs(attendance.checkIn.time);
      const checkOutTime = dayjs(time);
      const workHours = checkOutTime.diff(checkInTime, 'hour', true).toFixed(2);
      attendance.workHours = workHours;
    }
    
    await attendance.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get today's attendance
export const getTodayAttendance = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = dayjs().format('YYYY-MM-DD');
    
    const attendance = await Attendance.findOne({
      user: userId,
      date: today
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance history
export const getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    const attendance = await Attendance.find({
      user: userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get comp off dates
export const getCompOffDates = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    // Get user's comp off dates
    const user = await User.findById(userId);
    
    // Filter unused comp off dates within the date range
    const compOffDates = user.compOffDates
      .filter(entry => {
        const entryDate = dayjs(entry.date).format('YYYY-MM-DD');
        return !entry.used && 
               entryDate >= startDate && 
               entryDate <= endDate;
      })
      .map(entry => dayjs(entry.date).format('YYYY-MM-DD'));
    
    res.status(200).json({
      status: 'success',
      data: {
        dates: compOffDates
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get attendance for a specific employee (admin only)
export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    const attendance = await Attendance.find({
      user: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get all attendance records (admin only)
export const getAllAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Check if user is admin or subadmin
    if (req.user.role !== 'admin' && req.user.role !== 'subadmin') {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400));
    }
    
    const attendance = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).populate({
      path: 'user',
      select: 'fullName email department designation'
    }).sort({ date: -1 });
    
    res.status(200).json({
      status: 'success',
      data: {
        attendance
      }
    });
  } catch (err) {
    next(err);
  }
};